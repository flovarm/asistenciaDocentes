import { Component, inject, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

// Custom imports
import { TituloComponent } from '../Shared/titulo/titulo.component';
import { ConfirmacionComponent } from '../confirmacion/confirmacion.component';

// Services
import { TurnoService } from '../_services/turno.service';
import { PeriodoService } from '../_services/periodo.service';
import { NotasService } from '../_services/notas.service';
import { HorarioService } from '../_services/horario.service';
import { ExportExcelService } from '../_services/exportExcel.service';
import { EstadoNotasService } from '../_services/estado-notas.service';

// Models
import { Periodo } from '../_models/periodo';
import { Profesor } from '../_models/profesor';

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TituloComponent,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './notas.component.html',
  styleUrl: './notas.component.scss'
})
export class NotasComponent implements OnInit, OnDestroy, AfterViewInit{
  filteredOptions: Observable<string[]>;
  turnos : any[] = [];
  turno;
  turnoService = inject(TurnoService);
  periodoService = inject(PeriodoService);
  notasService = inject(NotasService);
  periodo: Periodo;
  notaErrores: { [key: string]: boolean } = {};
  horarioService = inject(HorarioService);
  curso: string = '';
  readonly dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private exportExcelService = inject(ExportExcelService);
  private router = inject(Router);
  private estadoNotasService = inject(EstadoNotasService);
  private subscriptions = new Subscription();
  dataSource =new MatTableDataSource<any>();
   dataSourceRecuperacion =new MatTableDataSource<any>();
  tableColumns: string[] = []; 
  displayedColumns: string[] = [];
  displayedColumnsRecuperacion: string[] = [];
  colaNotasPendientes: { nota: any, col: string }[] = [];
  procesandoCola = false;
  // Agregar nueva propiedad para rastrear cambios
  notasEditadas: Set<string> = new Set();
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  profesor: Profesor = JSON.parse(localStorage.getItem('profesor'));
  ngOnInit(): void {
    this.obtenerUltimoPeriodo();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.guardarEstadoActual();
    this.subscriptions.unsubscribe();
  }

  /**
   * Guarda el estado actual de las notas
   */
  private guardarEstadoActual(): void {
    if (this.turno) {
      this.estadoNotasService.guardarTurno(this.turno);
      this.estadoNotasService.guardarCurso(this.curso);
      this.estadoNotasService.guardarEstadoNotas(this.dataSource.data);
      this.estadoNotasService.guardarEstadoNotasRecuperacion(this.dataSourceRecuperacion.data);
      this.estadoNotasService.guardarColumnas(this.displayedColumns);
      this.estadoNotasService.guardarColumnasRecuperacion(this.displayedColumnsRecuperacion);
      
      // Guardar filtro actual si existe
      const filtroInput = document.querySelector('#filtroNotas') as HTMLInputElement;
      if (filtroInput && filtroInput.value) {
        this.estadoNotasService.guardarFiltro(filtroInput.value);
      }
      
      // Guardar página actual del paginador
      if (this.paginator) {
        this.estadoNotasService.guardarPagina(this.paginator.pageIndex);
      }
    }
  }

  /**
   * Restaura el estado anterior si existe
   */
  private restaurarEstadoAnterior(): void {
    const turnoAnterior = this.estadoNotasService.obtenerTurnoSeleccionado();
    const cursoAnterior = this.estadoNotasService.obtenerCursoSeleccionado();
    const filtroAnterior = this.estadoNotasService.obtenerFiltroActual();
    const estadoNotas = this.estadoNotasService.obtenerEstadoNotas();
    const estadoNotasRecuperacion = this.estadoNotasService.obtenerEstadoNotasRecuperacion();
    const columnasGuardadas = this.estadoNotasService.obtenerColumnas();
    const columnasRecuperacionGuardadas = this.estadoNotasService.obtenerColumnasRecuperacion();

    if (turnoAnterior && turnoAnterior.idHorario && this.turnos.length > 0) {
      const turnoEncontrado = this.turnos.find(t => t.idHorario === turnoAnterior.idHorario);
      if (turnoEncontrado) {
        this.turno = turnoEncontrado;
        this.curso = cursoAnterior;
        
        // Restaurar datos de notas si existen
        if (estadoNotas && estadoNotas.length > 0) {
          this.dataSource.data = estadoNotas;
          this.displayedColumns = columnasGuardadas || ['alumno'];
          this.tableColumns = ['index', ...this.displayedColumns];
        }
        
        // Restaurar datos de recuperación si existen
        if (estadoNotasRecuperacion && estadoNotasRecuperacion.length > 0) {
          this.dataSourceRecuperacion.data = estadoNotasRecuperacion;
          this.displayedColumnsRecuperacion = columnasRecuperacionGuardadas || ['alumno'];
        }
        
        // Si no hay estado guardado, cargar normalmente
        if (!estadoNotas || estadoNotas.length === 0) {
          this.listarNotas(this.turno?.idHorario, this.turno?.idFormatoNota);
        }
        
        // Restaurar filtro después de que se carguen los datos
        setTimeout(() => {
          if (filtroAnterior) {
            this.aplicarFiltroGuardado(filtroAnterior);
          }
          // Restaurar página del paginador
          const paginaAnterior = this.estadoNotasService.obtenerPaginaActual();
          if (this.paginator && paginaAnterior > 0) {
            this.paginator.pageIndex = paginaAnterior;
          }
        }, 200);
      } else {
        this.estadoNotasService.limpiarEstado();
      }
    }
  }

  /**
   * Aplica un filtro guardado anteriormente
   */
  private aplicarFiltroGuardado(filtro: string): void {
    const filtroInput = document.querySelector('#filtroNotas') as HTMLInputElement;
    if (filtroInput) {
      filtroInput.value = filtro;
      this.dataSource.filter = filtro.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  obtenerUltimoPeriodo() {
    this.periodoService.obtenerUltimoPeriodo().subscribe({
      next: (result: Periodo) => {
        this.periodo = result;
        this.obtenerTurnos(this.profesor.idProfesor , this.periodo.idPeriodo);
      }
    })
  }

  obtenerTurnos(idProfesor, idPeriodo){
    this.turnoService.listarTurnosDocente(idProfesor , idPeriodo).subscribe({
      next : (datos: any[]) => {
        this.turnos = datos;
        // Intentar restaurar estado después de cargar los turnos
        if (this.turnos.length > 0) {
          setTimeout(() => {
            this.restaurarEstadoAnterior();
          }, 50);
        }
      }
    })
  }

  listarNotas(idHorario , idFormatoNota) {
  this.notasService.listarNotas(idHorario , idFormatoNota).subscribe({
    next : (result: any[]) => {
      this.listarNotasRecuperacion(idHorario, idFormatoNota);
      if (result.length > 0) {
        const notaEjemplo = result[0];
        // Obtén todas las claves de notas, ignorando cualquier variante de finalGrade
        let columns = Object.keys(notaEjemplo.notas || {}).filter(
          c => c.toLowerCase() !== 'finalgrade'
        );
        // Si finalGrade existe en el objeto principal, agrégalo al final
        if ('finalGrade' in notaEjemplo) {
          columns.push('finalGrade');
        }
        this.displayedColumns = ['alumno', ...columns];
        this.tableColumns = ['index', ...this.displayedColumns]; 
        this.dataSource.data = result.map(n => ({
          ...n,
          ...n.notas
        }))
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        // Cuando no hay datos, definir columnas mínimas para evitar errores
        this.displayedColumns = ['alumno'];
        this.tableColumns = ['index', 'alumno'];
        this.dataSource.data = [];
      }
    }
  })
}


listarNotasRecuperacion(idHorario , idFormatoNota) {
  this.notasService.listarNotasRecuperacion(idHorario , idFormatoNota).subscribe({
    next : (result: any[]) => {
      if (result.length > 0) {
        const notaEjemplo = result[0];
        // Obtén todas las claves de notas, ignorando cualquier variante de finalGrade
        let columns = Object.keys(notaEjemplo.notas || {}).filter(
          c => c.toLowerCase() !== 'finalgrade'
        );
        // Si finalGrade existe en el objeto principal, agrégalo al final
        if ('finalGrade' in notaEjemplo) {
          columns.push('finalGrade');
        }
        this.displayedColumnsRecuperacion = ['alumno', ...columns];
        this.dataSourceRecuperacion.data = result.map(n => ({
          ...n,
          ...n.notas
        }))
      } else {
        // Cuando no hay datos, definir columnas mínimas para evitar errores
        this.displayedColumnsRecuperacion = ['alumno'];
        this.dataSourceRecuperacion.data = [];
      }
    }
  })
}

// Determina si una columna es una nota (contiene "_")
isNotaColumn(col: string): boolean {
  return col.includes('_');
}

// Extrae el valor máximo desde el nombre de la columna (ej. Vocabulary_30 → 30)
getValorMaximo(col: string): number {
  const parts = col.split('_');
  return Number(parts[1]) || 0;
}

formatColumnNameLine1(col: string): string {
  return this.isNotaColumn(col) ? col.split('_')[0] : col;
}

formatColumnNameLine2(col: string): string {
  return this.isNotaColumn(col) ? `(${col.split('_')[1]})` : '';
}

getNombreColumnaReal(col: string): string {
  const partes = col.split('_');
  return partes[partes.length - 1];
}

confirmarCerrarActa() {
  this.dialog.open(ConfirmacionComponent, {
    data: '¿ Cerrar acta?. Recuerde una vez cerrada el acta ya no podrá editar las notas ni tomar asistencia.',
  }).afterClosed().subscribe({
    next: result => {
      if (result) {
        this.cerrarActa();
      }
    }
  })
}

cerrarActa() {
  this.horarioService.cerrarActa(this.turno.idHorario).subscribe({
    next: () => {
      this.snack.open('Acta cerrada correctamente', 'Cerrar', {
        duration: 2000,
        panelClass: ['snack-success'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      this.turno.registroCerrado = true;
    }
  });
}

tieneNotasVacias(): boolean {
  if (!this.dataSource?.data?.length) return true;
  // Recorre cada fila y cada columna de notas
  for (const row of this.dataSource.data) {
    for (const col of this.displayedColumns) {
      if (this.isNotaColumn(col) && (row[col] === null || row[col] === undefined || row[col] === '')) {
        return true; // Hay al menos una nota vacía
      }
    }
  }
  return false; // No hay notas vacías
}

// Valida al cambiar una nota
validarNota(row: any, col: string, colIndex: number): void {
  const max = this.getValorMaximo(col);
  const valor = Number(row[col]);

  row.estadoGuardado = row.estadoGuardado || {};

  if (isNaN(valor) || valor < 0) {
    row.estadoGuardado[col] = false;
    row[col] = '';
    return;
  }

  if (valor > max) {
    row.estadoGuardado[col] = false;
    row[col] = '';
    this.snack.open(`El valor no puede ser mayor que ${max}`, null, {
      duration: 3000,
      panelClass: ['snack-error'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    return;
  }

  // Limpiar el estado de error si la validación es exitosa
  if (row.estadoGuardado[col] === false) {
    delete row.estadoGuardado[col];
  }

  // Marcar como nota editada
  const claveUnica = `${row.idRegistro}-${col}`;
  this.notasEditadas.add(claveUnica);

  // Calcular promedio sin guardar para mostrar preview
  this.calcularPromedioSinGuardar(row, col);

  // Marcar como pendiente
  row.estadoGuardado[col] = 'pendiente';
}

 applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  obtenerCurso(){
    // Solo limpiar estado si hay un cambio real de turno
    const turnoAnterior = this.estadoNotasService.obtenerTurnoSeleccionado();
    const esCambioTurno = turnoAnterior && turnoAnterior.idHorario !== this.turno?.idHorario;
    
    if (esCambioTurno) {
      this.estadoNotasService.limpiarEstado();
      // Limpiar también las notas editadas al cambiar de turno
      this.notasEditadas.clear();
    }

    this.curso = '';
    setTimeout(() => {
      this.curso = this.turno?.curso ?? '';
      this.listarNotas(this.turno.idHorario , this.turno.idFormatoNota);
    });
  }


  validarNotaRecuperacion(row: any, col: string, colIndex: number): void {
    const max = this.getValorMaximo(col);
    const valor = Number(row[col]);

    row.estadoGuardado = row.estadoGuardado || {};

    if (isNaN(valor) || valor < 0) {
      row.estadoGuardado[col] = false;
      row[col] = '';
      return;
    }

    if (valor > max) {
      row.estadoGuardado[col] = false;
      row[col] = '';
      this.snack.open(`El valor no puede ser mayor que ${max}`, null, {
        duration: 3000,
        panelClass: ['snack-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Limpiar el estado de error si la validación es exitosa
    if (row.estadoGuardado[col] === false) {
      delete row.estadoGuardado[col];
    }

    // Marcar como nota editada para recuperación
    const claveUnica = `${row.idRegistro}-${col}-recuperacion`;
    this.notasEditadas.add(claveUnica);

    // Marcar como pendiente
    row.estadoGuardado[col] = 'pendiente';
  }

  calcularPromedioSinGuardar(row: any, col: string): void {
    // Preparar columnas actuales de la fila incluyendo el cambio temporal
    const columnas: { [key: string]: any } = {};
    
    // Recopilar todas las notas de la fila actual
    this.displayedColumns.forEach(column => {
      if (this.isNotaColumn(column)) {
        const nombreColumna = this.getNombreColumnaReal(column);
        const valor = row[column];
        
        if (valor !== null && valor !== undefined && valor !== '') {
          columnas[nombreColumna] = Number(valor);
        }
      }
    });

    // Si no hay columnas con valores, limpiar el promedio y salir
    if (Object.keys(columnas).length === 0) {
      row.finalGrade = null;
      this.dataSource._updateChangeSubscription();
      return;
    }

    const notaDto = {
      IdRegistro: row.idRegistro,
      IdHorario: row.idHorario,
      Codigo: row.codigo,
      IdPeriodo: this.turno.idPeriodo,
      Columnas: columnas
    };

    this.notasService.calcularPromedioSinGuardar(notaDto).subscribe({
      next: (promedio: number) => {
        // Actualizar el promedio temporal en la fila
        row.finalGrade = promedio;
        
        // Actualizar la vista para mostrar el nuevo promedio
        this.dataSource._updateChangeSubscription();
      }
    });
  }

  exportarNotasAExcel(): void {
    if (!this.dataSource?.data?.length) {
      this.snack.open('No hay datos para exportar', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-warning'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Preparar los datos para exportar con las cabeceras originales del servidor
    const datosParaExportar = this.dataSource.data.map((fila, index) => {
      const filaExportada: any = {
        'N°': index + 1,
        'idHorario': fila.idHorario || '',
        'idRegistro': fila.idRegistro || '',
        'alumno': fila.alumno || ''
      };

      // Agregar todas las columnas de notas con sus nombres originales del servidor
      this.displayedColumns.forEach(col => {
        if (col !== 'alumno') {
          filaExportada[col] = fila[col] || '';
        }
      });

      return filaExportada;
    });

    // Generar nombre del archivo con información del curso y fecha
    const fecha = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    const nombreArchivo = `Notas_${this.curso || 'Curso'}_${fecha}.xlsx`;

    // Exportar a Excel
    this.exportExcelService.exportarExcel(datosParaExportar, nombreArchivo);

    // Mostrar mensaje de éxito
    this.snack.open('Excel exportado correctamente', 'Cerrar', {
      duration: 3000,
      panelClass: ['snack-success'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea un archivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.snack.open('Por favor seleccione un archivo Excel válido (.xlsx o .xls)', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    this.importarExcel(file);
  }

  importarExcel(archivo: File): void {
    this.exportExcelService.importarExcel(archivo).then((datos: any[]) => {
      this.procesarDatosImportados(datos);
    }).catch(() => {
      // El interceptor maneja el error
    });
  }

  procesarDatosImportados(datosExcel: any[]): void {
    if (!datosExcel || datosExcel.length === 0) {
      this.snack.open('El archivo está vacío o no tiene datos válidos', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-warning'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    if (!this.dataSource?.data?.length) {
      this.snack.open('Primero debe cargar las notas del turno seleccionado', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-warning'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Validar que el idHorario del Excel coincida con el turno actual
    const idHorarioActual = this.turno?.idHorario;
    const primeraFilaExcel = datosExcel[0];
    
    if (primeraFilaExcel && primeraFilaExcel.idHorario && primeraFilaExcel.idHorario !== idHorarioActual) {
      this.snack.open('Error: No coincide horario. El archivo Excel pertenece a un horario diferente al seleccionado.', 'Cerrar', {
        duration: 5000,
        panelClass: ['snack-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    let notasImportadas = 0;
    let erroresImportacion = 0;

    datosExcel.forEach((filaExcel) => {
      // Buscar la fila correspondiente en el dataSource por idRegistro
      const filaLocal = this.dataSource.data.find(f => f.idRegistro === filaExcel.idRegistro);
      
      if (!filaLocal) {
        erroresImportacion++;
        return;
      }

      // Inicializar estado si no existe
      filaLocal.estadoGuardado = filaLocal.estadoGuardado || {};
      let tieneNotasValidas = false;

      // Procesar cada columna del Excel
      this.displayedColumns.forEach(col => {
        if (this.isNotaColumn(col) && filaExcel.hasOwnProperty(col)) {
          const valorExcel = filaExcel[col];
          
          // Solo procesar si hay un valor válido en el Excel
          if (valorExcel !== null && valorExcel !== undefined && valorExcel !== '') {
            const valorNumerico = Number(valorExcel);
            const valorMaximo = this.getValorMaximo(col);
            
            // Validar el valor
            if (!isNaN(valorNumerico) && valorNumerico >= 0 && valorNumerico <= valorMaximo) {
              // Actualizar el valor en la fila local
              filaLocal[col] = valorNumerico;
              
              // Marcar como nota editada para el guardado masivo
              const claveUnica = `${filaLocal.idRegistro}-${col}`;
              this.notasEditadas.add(claveUnica);
              
              // Marcar como pendiente (amarillo)
              filaLocal.estadoGuardado[col] = 'pendiente';
              
              tieneNotasValidas = true;
            } else {
              // Valor inválido - marcar como error
              filaLocal.estadoGuardado[col] = false;
              erroresImportacion++;
            }
          }
        }
      });

      if (tieneNotasValidas) {
        notasImportadas++;
        // Calcular promedio para esta fila con las nuevas notas
        this.calcularPromedioSinGuardar(filaLocal, '');
      }
    });

    // Actualizar la vista para mostrar los cambios
    this.dataSource._updateChangeSubscription();

    // Mostrar mensaje de resultado de importación
    let mensaje = `Importación completada: ${notasImportadas} estudiantes con notas importadas`;
    if (erroresImportacion > 0) {
      mensaje += `, ${erroresImportacion} errores encontrados`;
    }
    mensaje += '. Use "GUARDAR NOTAS" para confirmar los cambios.';

    this.snack.open(mensaje, 'Cerrar', {
      duration: 8000,
      panelClass: erroresImportacion > 0 ? ['snack-warning'] : ['snack-success'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    // Limpiar el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  guardarNotasMasivoManual(): void {
    if (!this.dataSource?.data?.length && !this.dataSourceRecuperacion?.data?.length) {
      this.snack.open('No hay notas para guardar', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-warning'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Recopilar solo las notas que han sido editadas
    const notasMasivas: any[] = [];

    // Procesar notas regulares
    if (this.dataSource?.data?.length) {
      this.dataSource.data.forEach((fila) => {
        const columnas: { [key: string]: any } = {};
        let tieneColumnasEditadas = false;

        // Revisar solo las columnas que han sido editadas
        this.displayedColumns.forEach(col => {
          if (this.isNotaColumn(col)) {
            const claveUnica = `${fila.idRegistro}-${col}`;
            
            // Solo incluir si esta nota específica fue editada
            if (this.notasEditadas.has(claveUnica)) {
              const valor = fila[col];
              
              // Solo incluir si hay un valor válido
              if (valor !== null && valor !== undefined && valor !== '') {
                const valorNumerico = Number(valor);
                
                if (!isNaN(valorNumerico) && valorNumerico >= 0) {
                  columnas[this.getNombreColumnaReal(col)] = valorNumerico;
                  tieneColumnasEditadas = true;
                }
              }
            }
          }
        });

        // Si tiene columnas editadas válidas, agregar a la lista
        if (tieneColumnasEditadas) {
          notasMasivas.push({
            IdRegistro: fila.idRegistro,
            IdHorario: fila.idHorario,
            Codigo: fila.codigo,
            IdPeriodo: this.turno.idPeriodo,
            Columnas: columnas
          });
        }
      });
    }

    // Procesar notas de recuperación
    if (this.dataSourceRecuperacion?.data?.length) {
      this.dataSourceRecuperacion.data.forEach((fila) => {
        const columnas: { [key: string]: any } = {};
        let tieneColumnasEditadas = false;

        // Revisar solo las columnas que han sido editadas (con sufijo -recuperacion)
        this.displayedColumnsRecuperacion.forEach(col => {
          if (this.isNotaColumn(col)) {
            const claveUnica = `${fila.idRegistro}-${col}-recuperacion`;
            
            // Solo incluir si esta nota específica fue editada
            if (this.notasEditadas.has(claveUnica)) {
              const valor = fila[col];
              
              // Solo incluir si hay un valor válido
              if (valor !== null && valor !== undefined && valor !== '') {
                const valorNumerico = Number(valor);
                
                if (!isNaN(valorNumerico) && valorNumerico >= 0) {
                  columnas[this.getNombreColumnaReal(col)] = valorNumerico;
                  tieneColumnasEditadas = true;
                }
              }
            }
          }
        });

        // Si tiene columnas editadas válidas, agregar a la lista
        if (tieneColumnasEditadas) {
          notasMasivas.push({
            IdRegistro: fila.idRegistro,
            IdHorario: fila.idHorario,
            Codigo: fila.codigo,
            IdPeriodo: this.turno.idPeriodo,
            Columnas: columnas
          });
        }
      });
    }

    if (notasMasivas.length === 0) {
      this.snack.open('No hay notas editadas para guardar', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-warning'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Limpiar la cola de notas pendientes ya que guardaremos masivamente
    this.colaNotasPendientes = [];
    this.procesandoCola = false;

    // Enviar notas masivamente
    this.enviarNotasMasivo(notasMasivas);
  }

  tieneNotasPendientes(): boolean {
    // Verificar si hay notas editadas (regulares o de recuperación)
    return this.notasEditadas.size > 0;
  }

  enviarNotasMasivo(notasMasivas: any[]): void {
    // Mostrar indicador de carga
    this.snack.open('Procesando notas masivamente...', null, {
      duration: 0,
      panelClass: ['snack-info'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    this.notasService.guardarNotasMasivo(notasMasivas).subscribe({
      next: (result: any) => {
        // Cerrar snackbar de carga
        this.snack.dismiss();

        // Actualizar el dataSource con los resultados (notas regulares)
        if (result.Resultados) {
          result.Resultados.forEach((res: any) => {
            // Buscar en notas regulares
            const filaLocal = this.dataSource.data.find(f => f.idRegistro === res.IdRegistro);
            if (filaLocal && res.IdNota) {
              filaLocal.idNota = res.IdNota;
              filaLocal.finalGrade = res.FinalGrade || filaLocal.finalGrade;
              
              // Marcar todas las columnas de esta fila como guardadas exitosamente
              this.displayedColumns.forEach(col => {
                if (this.isNotaColumn(col) && filaLocal.estadoGuardado && filaLocal.estadoGuardado[col] === 'pendiente') {
                  filaLocal.estadoGuardado[col] = true;
                  
                  // Limpiar estado visual después de 3 segundos
                  setTimeout(() => {
                    if (filaLocal.estadoGuardado && filaLocal.estadoGuardado[col] === true) {
                      delete filaLocal.estadoGuardado[col];
                    }
                  }, 3000);
                }
              });
            }

            // Buscar en notas de recuperación
            const filaRecuperacion = this.dataSourceRecuperacion.data.find(f => f.idRegistro === res.IdRegistro);
            if (filaRecuperacion && res.IdNota) {
              filaRecuperacion.idNota = res.IdNota;
              filaRecuperacion.finalGrade = res.FinalGrade || filaRecuperacion.finalGrade;
              
              // Marcar todas las columnas de esta fila como guardadas exitosamente
              this.displayedColumnsRecuperacion.forEach(col => {
                if (this.isNotaColumn(col) && filaRecuperacion.estadoGuardado && filaRecuperacion.estadoGuardado[col] === 'pendiente') {
                  filaRecuperacion.estadoGuardado[col] = true;
                  
                  // Limpiar estado visual después de 3 segundos
                  setTimeout(() => {
                    if (filaRecuperacion.estadoGuardado && filaRecuperacion.estadoGuardado[col] === true) {
                      delete filaRecuperacion.estadoGuardado[col];
                    }
                  }, 3000);
                }
              });
            }
          });
        }

        // Limpiar las notas editadas después del guardado exitoso
        this.notasEditadas.clear();

        // Actualizar ambas vistas
        this.dataSource._updateChangeSubscription();
        this.dataSourceRecuperacion._updateChangeSubscription();

        // Mostrar resultado exitoso
        let mensaje = `Se guardaron las notas de ${result.TotalProcesadas || notasMasivas.length} registros correctamente`;
        if (result.TotalErrores > 0) {
          mensaje += `, ${result.TotalErrores} errores`;
        }

        this.snack.open(mensaje, 'Cerrar', {
          duration: 5000,
          panelClass: result.TotalErrores > 0 ? ['snack-warning'] : ['snack-success'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        // Limpiar el input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error: () => {
        // Cerrar snackbar de carga - el interceptor maneja el mensaje de error
        this.snack.dismiss();
        
        // Limpiar el input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    });
  }

  navegarADetalleAlumno(row: any): void {
    if (row.codigo) {
      // Guardar estado antes de navegar
      this.guardarEstadoActual();
      
      this.router.navigate(['/detalle-alumno', row.codigo]).catch(() => {
        // El interceptor maneja el error de navegación si es necesario
      });
    } else {
      this.snack.open('No se pudo obtener el código del alumno', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-warning'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

}