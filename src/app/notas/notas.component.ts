import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TituloComponent } from '../Shared/titulo/titulo.component';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { TurnoService } from '../_services/turno.service';
import { PeriodoService } from '../_services/periodo.service';
import { Periodo } from '../_models/periodo';
import { Profesor } from '../_models/profesor';
import { FormsModule } from '@angular/forms';
import { NotasService } from '../_services/notas.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmacionComponent } from '../confirmacion/confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { HorarioService } from '../_services/horario.service';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-notas',
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
  horarioService = inject(HorarioService);
  curso: string = '';
  readonly dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  dataSource =new MatTableDataSource<any>();
  tableColumns: string[] = []; 
  displayedColumns: string[] = [];
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
        this.displayedColumns = [];
        this.dataSource.data = [];
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
  if (isNaN(valor) || valor < 0) {
    row[col] = '';
    return; // No guardar si no es válido
  } else if (valor > max) {
    this.snack.open(`El valor no puede ser mayor que ${max}` , null , {
      duration: 2000,
      panelClass: ['snack-error'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    row[col] = '';
    this.guardarNota(row, colIndex , col);
    return; // No guardar si no es válido
  }
  // Si pasa la validación, guardar
  this.guardarNota(row, colIndex , col);
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

  guardarNota(nota: any, colindex: number, col:any) {
    const notaDto = {
      ...nota,
      NombreColumna: this.getNombreColumnaReal(col),
      valor: nota[col],
      idPeriodo: this.turno.idPeriodo,
    };
    if (nota.idNota == 0) {
      this.notasService.guardarNota(notaDto).subscribe({
        next: (result: any) => {
          if (result) {
            let index = this.dataSource.data.findIndex((n) => n.idRegistro == notaDto.idRegistro);
            if (index == -1) {
              this.dataSource.data.push(result);
              this.dataSource._updateChangeSubscription();
              this.snack.open('Nota guardada', 'Cerrar', {
                panelClass: ['snack-success'],
                duration: 2000,           
            });
            } else {
              this.dataSource.data[index].idNota = result.idNota;
              this.calcularPromedio(result);
              this.dataSource._updateChangeSubscription();
              this.snack.open('Nota guardada', 'Cerrar', {
                panelClass: ['snack-success'],
                duration: 2000,           
            });
          }
        }
        }
      });
    } else {
      this.notasService.actualizarNota(notaDto).subscribe({
        next: () => {
          this.calcularPromedio(notaDto);
             this.snack.open('Nota guardada', 'Cerrar', {
                duration: 2000,   
                panelClass: ['snack-success'],        
            });
        }
      });
    }
  }

  calcularPromedio(nota: any) {
    this.notasService.calcularPromedio(nota.idNota, this.turno.idFormatoNota).subscribe({
      next: (result: any) => {
        if (result) {
          let index = this.dataSource.data.findIndex((n) => n.idRegistro == nota.idRegistro);
          if (index != -1) {
            this.dataSource.data[index].finalGrade = result;
            this.dataSource._updateChangeSubscription();
          }
        }
      }
  })
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
}