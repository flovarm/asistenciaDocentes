import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Periodo } from '../_models/periodo';
import { TurnoService } from '../_services/turno.service';
import { PeriodoService } from '../_services/periodo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Profesor } from '../_models/profesor';
import { TituloComponent } from '../Shared/titulo/titulo.component';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AsistenciaAlumnoService } from '../_services/asistenciaAlumno.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-asistencia-alumnos',
  imports: [
    TituloComponent,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './asistencia-alumnos.component.html',
  styleUrl: './asistencia-alumnos.component.scss'
})
export class AsistenciaAlumnosComponent implements OnInit {
  turnos: any[] = [];
  turno;
  turnoService = inject(TurnoService);
  periodoService = inject(PeriodoService);
  periodo: Periodo;
  asistenciaAlumnoService = inject(AsistenciaAlumnoService);
  curso: string = '';
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  tableColumns: string[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  private snack = inject(MatSnackBar);
 clasesRecuperacion: any[] = [];
displayedColumnsRecuperacion: string[] = ['numero','alumno', 'accion'];
  advertenciaAsistencia: boolean = true;
  dataSourceRecuperacion = new MatTableDataSource<any>([]);
  profesor: Profesor = JSON.parse(localStorage.getItem('profesor'));
  ngOnInit(): void {
    this.obtenerUltimoPeriodo();
  }
  obtenerUltimoPeriodo() {
    this.periodoService.obtenerUltimoPeriodo().subscribe({
      next: (result: Periodo) => {
        this.periodo = result;
        this.obtenerTurnos(this.profesor.idProfesor, this.periodo.idPeriodo);
      }
    })
  }

  obtenerTurnos(idProfesor, idPeriodo) {
    this.turnoService.listarTurnosDocente(idProfesor, idPeriodo).subscribe({
      next: (datos: any[]) => {
        this.turnos = datos
      }
    })
  }

  obtenerCurso() {
    this.curso = '';
    setTimeout(() => {
      this.curso = this.turno?.curso ?? '';
      this.listarAsistencia(this.turno?.idHorario);
    });
  }

 listarAsistencia(idHorario: number) {
    this.asistenciaAlumnoService.ObtenerLista(idHorario).subscribe({
      next: (datos: any[]) => {
        console.log('Datos de asistencia:', datos);
        const fechasSet = new Set<string>();
        datos.forEach(d => {
          Object.keys(d.asistenciasPorFecha || {}).forEach(f => fechasSet.add(f));
        });
        const fechas = Array.from(fechasSet).sort();

        // Adapta cada registro para tener las fechas como propiedades de primer nivel
        const today = this.getTodayString();
        const adaptados = datos.map(d => {
          const asistencia = fechas.reduce((acc, fecha) => {
            // Si es la fecha de hoy y no hay valor, pon "P" por defecto
            acc[fecha] = (fecha === today)
              ? (d.asistenciasPorFecha?.[fecha] && d.asistenciasPorFecha[fecha] !== '')
                ? d.asistenciasPorFecha[fecha]
                : ''
              : (d.asistenciasPorFecha?.[fecha] ?? '');
            return acc;
          }, {} as Record<string, string>);
          
          // Agregar recuperaciones al modelo
          const recuperaciones = d.recuperaciones || [];
          const recuperacionesTooltip = recuperaciones.map((rec: any) => rec.fecha).join(', ');
          
          return {
            alumno: d.alumno,
            idAlumno: d.idAlumno,
            idHorario: d.idHorario,
            recuperaciones: recuperaciones,
            recuperacionesTooltip: recuperacionesTooltip,
            tieneRecuperaciones: recuperaciones.length > 0,
            ...asistencia
          };
        });

        this.displayedColumns = ['alumno', ...fechas];
        this.tableColumns = ['index', ...this.displayedColumns]; 
        this.dataSource = new MatTableDataSource<any>(adaptados);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => {
        console.error('Error al listar asistencia:', error);
        this.snack.open('Error al listar asistencia', 'Cerrar', { duration: 3000 });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isDateColumn(col: string): boolean {
    return col !== 'alumno' && col !== 'idAlumno' && !isNaN(Date.parse(col));
  }

  getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  guardarAsistencia(): void {
  const today = new Date(this.getTodayString());
  const fechas = this.displayedColumns.filter(col => this.isDateColumn(col));
  const asistencias = [];

  this.dataSource.data.forEach(row => {
    debugger;
    fechas.forEach(fecha => {
      const fechaDate = new Date(fecha);
      // Compara solo año, mes y día
      if (fechaDate <= today) {
        asistencias.push({
          idAlumno: row.idAlumno,
          idHorario: row.idHorario,
          fecha: fecha,
          estado: row[fecha] || 'F' // Por defecto "F" si no hay valor
        });
      }
    });
  });
  this.asistenciaAlumnoService.GuardarAsistencias(asistencias).subscribe({
    next: () => {
      this.snack.open('Asistencias guardadas', 'Cerrar', { duration: 3000, panelClass: ['snack-success'] }),
      this.advertenciaAsistencia = false;
    },
  });
  }

  listarRecuperacionClase() {
    this.asistenciaAlumnoService.recuperacionClases(this.turno?.idHorario).subscribe({
      next: (datos: any[]) => {
        console.log(datos)
         this.clasesRecuperacion = datos.map(d => ({
        ...d,
        estado: d.estado === null ? 'P' : d.estado
      }));
      this.dataSourceRecuperacion.data = this.clasesRecuperacion;
      } 
    });
  }

isEditableDate(column: string): boolean {
  const today = new Date();
  const colDate = new Date(column);
  // Compara solo año, mes y día
  return colDate <= today;
}

 guardarRecuperado(): void {
  const asistencias = [];

  this.dataSourceRecuperacion.data.forEach(row => {
    const fechaFormateada = row.fecha.split('T')[0];
    asistencias.push({
          idAlumno: row.idAlumno,
          idHorario: row.idHorario,
          fecha: fechaFormateada,
          estado: row.estado || 'F' // Por defecto "F" si no hay valor
        });
  });

  this.asistenciaAlumnoService.GuardarAsistencias(asistencias).subscribe({
    next: () => {
      this.snack.open('Asistencias guardadas', 'Cerrar', { duration: 3000, panelClass: ['snack-success'] }),
      this.advertenciaAsistencia = false;
    },
  });
  }

 getMesDia(): string {
  const date = new Date();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${mes}/${dia}`;
}

/**
 * Obtiene la columna correspondiente a la fecha actual
 */
getCurrentDateColumn(): string | null {
  const today = this.getTodayString();
  
  // Buscar fecha exacta
  let fechaActual = this.displayedColumns.find(col => this.isDateColumn(col) && col === today);
  
  if (fechaActual) {
    return fechaActual;
  }
  
  // Si no encuentra fecha exacta, buscar fechas editables (de hoy o anteriores)
  const fechasEditables = this.displayedColumns.filter(col => this.isDateColumn(col) && this.isEditableDate(col));
  
  if (fechasEditables.length > 0) {
    // Buscar la fecha más reciente entre las editables
    const fechasOrdenadas = fechasEditables.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return fechasOrdenadas[0];
  }
  
  return null;
}

/**
 * Verifica si hay fechas editables disponibles (para mostrar los botones de selección masiva)
 */
hasFechasEditables(): boolean {
  return this.displayedColumns.some(col => this.isDateColumn(col) && this.isEditableDate(col));
}

/**
 * Verifica si existe específicamente la fecha actual en las columnas disponibles
 */
existeFechaActual(): boolean {
  const today = this.getTodayString();
  return this.displayedColumns.some(col => this.isDateColumn(col) && col === today);
}

/**
 * Hace scroll horizontal hacia la última fecha de asistencia
 */
scrollToLastDate(): void {
  setTimeout(() => {
    const tableContainer = document.querySelector('.table-container') as HTMLElement;
    if (tableContainer) {
      // Scroll hasta el final (derecha) del contenedor para mostrar las fechas más recientes
      const maxScrollLeft = tableContainer.scrollWidth - tableContainer.clientWidth;
      
      // Si hay scroll behavior smooth en CSS, usar scrollTo, sino usar scrollLeft directo
      if (tableContainer.style.scrollBehavior === 'smooth' || 
          getComputedStyle(tableContainer).scrollBehavior === 'smooth') {
        tableContainer.scrollTo({
          left: maxScrollLeft,
          behavior: 'smooth'
        });
      } else {
        tableContainer.scrollLeft = maxScrollLeft;
      }
    }
  }, 300); // Delay aumentado para asegurar que la tabla se haya renderizado completamente
}

/**
 * Marca todos los alumnos con el estado especificado para la fecha actual
 */
marcarTodosParaFechaActual(estado: 'P' | 'T' | 'A'): void {
  const fechaActual = this.getCurrentDateColumn();
  
  if (!fechaActual) {
    this.snack.open('No se encontró ninguna fecha editable', 'Cerrar', { 
      duration: 3000, 
      panelClass: ['snack-error'] 
    });
    return;
  }

  // Actualizar todos los registros con el estado seleccionado para la fecha actual
  const datosActualizados = this.dataSource.data.map(row => ({
    ...row,
    [fechaActual]: estado
  }));

  this.dataSource.data = datosActualizados;
  
  // Activar la advertencia para recordar guardar
  this.advertenciaAsistencia = true;
  
  // Mostrar mensaje de confirmación
  const estadoTexto = estado === 'P' ? 'Presente' : estado === 'T' ? 'Tardanza' : 'Falta';
  const fechaFormateada = new Date(fechaActual).toLocaleDateString('es-ES');
  // this.snack.open(`Todos los alumnos marcados como: ${estadoTexto} para ${fechaFormateada}`, 'Cerrar', { 
  //   duration: 3000, 
  //   panelClass: ['snack-success'] 
  // });
}
}
