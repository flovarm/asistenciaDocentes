import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

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
export class NotasComponent implements OnInit{
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
  dataSource =new MatTableDataSource<any>();
   dataSourceRecuperacion =new MatTableDataSource<any>();
  tableColumns: string[] = []; 
  displayedColumns: string[] = [];
  displayedColumnsRecuperacion: string[] = [];
  colaNotasPendientes: { nota: any, col: string }[] = [];
procesandoCola = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  profesor: Profesor = JSON.parse(localStorage.getItem('profesor'));
  ngOnInit(): void {
    this.obtenerUltimoPeriodo();
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
        this.turnos = datos
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
        console.log(notaEjemplo);
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

  // ✅ Limpiar el estado de error si la validación es exitosa
  if (row.estadoGuardado[col] === false) {
    delete row.estadoGuardado[col];
  }

  // ✅ Calcular promedio sin guardar para mostrar preview
  this.calcularPromedioSinGuardar(row, col);

  // ✅ Marcar como pendiente de guardar (para que se vea en verde luego)
  row.estadoGuardado[col] = undefined;
 // this.agregarNotaAPendientes(row, col);
}

 applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  obtenerCurso(){
    this.curso = '';
    setTimeout(() => {
      this.curso = this.turno?.curso ?? '';
      this.listarNotas(this.turno.idHorario , this.turno.idFormatoNota);
    });
  }


procesarSiguienteNota() {
  debugger;
  if (this.colaNotasPendientes.length === 0) {
    this.procesandoCola = false;
    return;
  }

  this.procesandoCola = true;

  const { nota, col } = this.colaNotasPendientes.shift()!;

  const nombreColumna = col.split('_').pop();
  const valor = nota[col];

  const notaDto = {
    ...nota,
    NombreColumna: this.getNombreColumnaReal(col),
    valor,
    idPeriodo: this.turno.idPeriodo,
  };

  const esNueva = !nota.idNota || nota.idNota === 0;
  const servicio = esNueva
    ? this.notasService.guardarNota(notaDto)
    : this.notasService.actualizarNota(notaDto);

  servicio.subscribe({
    next: (result: any) => {
      nota.idNota = result.idNota;
      nota.finalGrade = result.finalGrade; // Actualiza finalGrade si existe
      Object.assign(nota, result); // actualiza todo el row
      nota.estadoGuardado = nota.estadoGuardado || {};
      nota.estadoGuardado[col] = true;
     // this.calcularPromedio(result);
      setTimeout(() => {
        delete nota.estadoGuardado[col];
      }, 3000);
    },
    error: (error) => {
      console.error('Error al guardar nota:', error);
      nota.estadoGuardado = nota.estadoGuardado || {};
      nota.estadoGuardado[col] = false;
      
      // Mostrar mensaje de error
      this.snack.open('Error al guardar la nota', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      
      // No limpiar el estado de error - se mantiene en rojo permanentemente
    },
    complete: () => {
      this.dataSource._updateChangeSubscription();
      this.procesarSiguienteNota(); // 👈 llama al siguiente
    }
  });
}

agregarNotaAPendientes(nota: any, col: string) {
  this.colaNotasPendientes.push({ nota, col });

  // Inicia el procesamiento si no está activo
  if (!this.procesandoCola) {
    this.procesarSiguienteNota();
  }
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
      },
      error: error => console.log(error)
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
      },
      error: error => {
        this.snack.open('Error al cerrar el acta', 'Cerrar', {
          duration: 2000,
          panelClass: ['snack-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
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

 guardarNotaRecuperacion(nota: any, colIndex: number, col: any) {
  const nuevoValor = nota[col];

  // Inicializa estructuras auxiliares si no existen
  nota.valoresAnteriores = nota.valoresAnteriores || {};
  nota.guardando = nota.guardando || {};
  nota.estadoGuardado = nota.estadoGuardado || {};

  // 1. No guardar si el valor no ha cambiado
  if (nota.valoresAnteriores[col] === nuevoValor) {
    return;
  }

  // 2. Evita múltiples guardados simultáneos por celda
  if (nota.guardando[col]) {
    return;
  }

  nota.guardando[col] = true;

  const notaDto = {
    ...nota,
    NombreColumna: this.getNombreColumnaReal(col),
    valor: nuevoValor,
    idPeriodo: this.turno.idPeriodo,
  };

  const esNueva = nota.idNota === 0;

  const manejarExito = (result: any) => {
    nota.idNota = result.idNota;
    nota.finalGrade = result.finalGrade;
    // Mantener el valor actual en el input, no sobrescribir
    nota.valoresAnteriores[col] = nuevoValor;
    nota.estadoGuardado[col] = true;

    let index = this.dataSourceRecuperacion.data.findIndex(n => n.idRegistro === notaDto.idRegistro);

    if (esNueva && index === -1) {
      const yaExiste = this.dataSourceRecuperacion.data.some(n => n.idNota === result.idNota);
      if (!yaExiste) {
        this.dataSourceRecuperacion.data.push(result);
      }
    } else if (index !== -1) {
      Object.assign(this.dataSourceRecuperacion.data[index], result);
    }
    this.dataSourceRecuperacion._updateChangeSubscription();

    this.snack.open('Nota guardada', 'Cerrar', {
      panelClass: ['snack-success'],
      duration: 2000
    });

    // Limpia el estado visual después de 3 segundos
    setTimeout(() => {
      delete nota.estadoGuardado[col];
    }, 3000);
  };

  const manejarError = (error: any) => {
    nota.estadoGuardado[col] = false;

    // No limpiar el estado de error - se mantiene en rojo permanentemente
  };

  const finalizar = () => {
    nota.guardando[col] = false;
  };

  const servicio = esNueva
    ? this.notasService.guardarNota(notaDto)
    : this.notasService.actualizarNota(notaDto);

  servicio.subscribe({
    next: manejarExito,
    error: manejarError,
    complete: finalizar
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

    // ✅ Limpiar el estado de error si la validación es exitosa
    if (row.estadoGuardado[col] === false) {
      delete row.estadoGuardado[col];
    }

    // ✅ Marcar como pendiente de guardar y guardar directamente
    row.estadoGuardado[col] = undefined;
    this.guardarNotaRecuperacion(row, colIndex, col);
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

    // Si no hay columnas con valores, no calcular
    if (Object.keys(columnas).length === 0) {
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
      },
      error: (error) => {
        console.error('Error al calcular promedio:', error);
        // No mostrar error al usuario para no interrumpir el flujo de entrada de datos
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
        if (col !== 'alumno') // Omitir la columna de alumno ya que ya la agregamos
          // Usar el nombre original de la columna tal como viene del servidor
          filaExportada[col] = fila[col] || '';
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
    }).catch((error) => {
      console.error('Error al importar Excel:', error);
      this.snack.open('Error al procesar el archivo Excel', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
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

    // Preparar notas para envío masivo
    const notasMasivas: any[] = [];

    datosExcel.forEach((filaExcel) => {
      // Buscar la fila correspondiente en el dataSource por idRegistro
      const filaLocal = this.dataSource.data.find(f => f.idRegistro === filaExcel.idRegistro);
      
      if (!filaLocal) {
        console.warn('No se encontró registro local para idRegistro:', filaExcel.idRegistro);
        return;
      }

      // Preparar columnas para esta nota
      const columnas: { [key: string]: any } = {};
      let tieneColumnas = false;

      this.displayedColumns.forEach(col => {
        if (this.isNotaColumn(col) && filaExcel.hasOwnProperty(col)) {
          const valorExcel = filaExcel[col];
          
          // Solo incluir si hay un valor válido en el Excel
          if (valorExcel !== null && valorExcel !== undefined && valorExcel !== '') {
            const valorNumerico = Number(valorExcel);
            const valorMaximo = this.getValorMaximo(col);
            
            // Validar el valor
            if (!isNaN(valorNumerico) && valorNumerico >= 0 && valorNumerico <= valorMaximo) {
              columnas[this.getNombreColumnaReal(col)] = valorNumerico;
              tieneColumnas = true;
              
              // Actualizar también el dataSource local para mostrar los cambios
              filaLocal[col] = valorNumerico;
            }
          }
        }
      });

      // Si tiene columnas válidas, agregar a la lista de envío masivo
      if (tieneColumnas) {
        notasMasivas.push({
          IdRegistro: filaLocal.idRegistro,
          IdHorario: filaLocal.idHorario,
          Codigo: filaLocal.codigo,
          IdPeriodo: this.turno.idPeriodo,
          Columnas: columnas
        });
      }
    });

    if (notasMasivas.length === 0) {
      this.snack.open('No se encontraron notas válidas para procesar', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-warning'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Enviar notas masivamente
   // this.enviarNotasMasivo(notasMasivas);
  }

  enviarNotasMasivo(notasMasivas: any[]): void {
    // Mostrar indicador de carga
    this.snack.open('Procesando notas masivamente...', null, {
      duration: 0, // Sin tiempo límite
      panelClass: ['snack-info'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    this.notasService.guardarNotasMasivo(notasMasivas).subscribe({
      next: (result: any) => {
        // Cerrar snackbar de carga
        this.snack.dismiss();

        // Actualizar el dataSource con los resultados
        if (result.Resultados) {
          result.Resultados.forEach((res: any) => {
            const filaLocal = this.dataSource.data.find(f => f.idRegistro === res.IdRegistro);
            if (filaLocal && res.IdNota) {
              filaLocal.idNota = res.IdNota;
            }
          });
        }

        // Actualizar la vista
        this.dataSource._updateChangeSubscription();

        // Mostrar resultado de importación exitosa
        console.log('Resultado del procesamiento masivo:', result);
        let mensaje = ` Excel importado correctamente: Se actualizaron las notas de ${result.TotalProcesadas || notasMasivas.length} alumnos`;
        if (result.TotalErrores > 0) {
          mensaje += `, ${result.TotalErrores} errores`;
        }

        this.snack.open(mensaje, 'Cerrar', {
          duration: 5000,
          panelClass: result.TotalErrores > 0 ? ['snack-warning'] : ['snack-success'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        // Si hay errores, mostrarlos en consola para debugging
        if (result.Errores && result.Errores.length > 0) {
          console.warn('Errores en procesamiento masivo:', result.Errores);
        }

        // Limpiar el input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        // Recargar las notas para obtener los promedios actualizados
        setTimeout(() => {
          this.listarNotas(this.turno.idHorario, this.turno.idFormatoNota);
        }, 1000);
      },
      error: (error) => {
        // Cerrar snackbar de carga
        this.snack.dismiss();
        
        console.error('Error en envío masivo:', error);
        this.snack.open('Error al procesar las notas masivamente', 'Cerrar', {
          duration: 5000,
          panelClass: ['snack-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });

        // Limpiar el input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    });
  }

  guardarNotasMasivoManual(): void {
    if (!this.dataSource?.data?.length) {
      this.snack.open('No hay notas para guardar', 'Cerrar', {
        duration: 3000,
        panelClass: ['snack-warning'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Recopilar todas las notas que tienen cambios
    const notasMasivas: any[] = [];

    this.dataSource.data.forEach((fila) => {
      const columnas: { [key: string]: any } = {};
      let tieneColumnas = false;

      // Revisar todas las columnas de notas
      this.displayedColumns.forEach(col => {
        if (this.isNotaColumn(col)) {
          const valor = fila[col];
          
          // Solo incluir si hay un valor válido
          if (valor !== null && valor !== undefined && valor !== '') {
            const valorNumerico = Number(valor);
            
            if (!isNaN(valorNumerico) && valorNumerico >= 0) {
              columnas[this.getNombreColumnaReal(col)] = valorNumerico;
              tieneColumnas = true;
            }
          }
        }
      });

      // Si tiene columnas válidas, agregar a la lista
      if (tieneColumnas) {
        notasMasivas.push({
          IdRegistro: fila.idRegistro,
          IdHorario: fila.idHorario,
          Codigo: fila.codigo,
          IdPeriodo: this.turno.idPeriodo,
          Columnas: columnas
        });
      }
    });

    if (notasMasivas.length === 0) {
      this.snack.open('No se encontraron notas válidas para guardar', 'Cerrar', {
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
    // Verificar si hay notas en la cola o cambios sin guardar
    if (this.colaNotasPendientes.length > 0) {
      return true;
    }

    // Verificar si hay notas con valores válidos en el dataSource
    if (!this.dataSource?.data?.length) {
      return false;
    }

    for (const fila of this.dataSource.data) {
      for (const col of this.displayedColumns) {
        if (this.isNotaColumn(col)) {
          const valor = fila[col];
          if (valor !== null && valor !== undefined && valor !== '' && !isNaN(Number(valor))) {
            return true;
          }
        }
      }
    }

    return false;
  }

}