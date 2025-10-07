import { Component, computed, inject, signal, Input, OnInit } from '@angular/core';
import { AlumnoService } from '../../_services/alumno.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NotasService } from '../../_services/notas.service';
import { NotasDetalleDialogComponent } from './notas-detalle-dialog.component';

@Component({
  selector: 'app-historial-academico',
  imports: [
     CommonModule,
     MatTableModule,
     MatPaginatorModule,
     MatIconModule,
     MatButtonModule
  ],
  templateUrl: './historial-academico.component.html',
  styleUrl: './historial-academico.component.scss'
})
export class HistorialAcademicoComponent implements OnInit {

  @Input() codigoAlumno!: string; // Recibir desde componente padre
  // Frontend pagination signals
   historialAcademico = signal<any[]>([]);
  allHistorialData = signal<any[]>([]); // Store all data
   private alumnoService = inject(AlumnoService);
     private notasService = inject(NotasService);
  private dialog = inject(MatDialog);
  currentPageIndex = signal<number>(0);
  currentPageSize = signal<number>(50); // Inicializa con 50
  pageSizeOptions = [50, 100, 250];
  // Paginated data computed property
  paginatedHistorialData = computed(() => {
    const allData = this.allHistorialData();
    const startIndex = this.currentPageIndex() * this.currentPageSize();
    const endIndex = startIndex + this.currentPageSize();
    return allData.slice(startIndex, endIndex);
  });

   totalHistorialCount = computed(() => this.allHistorialData().length);

  displayedColumns: string[] = [
    'anio', 'mes', 'descripcion', 'modalidad', 
    'nombreCompleto', 'nombre', 'nombreAula', 'notaReg', 
    'apruebaReg', 'sustinotaReg', 'sustiestReg', 'deben', 'estado', 'opciones'
  ];

  ngOnInit(): void {
    this.loadHistorialAcademico(this.codigoAlumno);
  }

  loadHistorialAcademico(codigoAlumno: string): void {
    this.currentPageIndex.set(0); // Reset to first page
    
    this.alumnoService.obtenerHistorialAcademicoByCodigo(codigoAlumno).subscribe({
      next: (response: any) => {        
        // Handle nested array structure - flatten if needed
        let historialData: any[] = [];
        
        if (Array.isArray(response)) {
          if (response.length > 0 && Array.isArray(response[0])) {
            historialData = response[0];
          } else {
            historialData = response;
          }
        }
        
        // Store all data and set paginated view
        this.allHistorialData.set(historialData);
        this.historialAcademico.set(this.paginatedHistorialData());
      }
    });
  }

  onHistorialPageChange(event: PageEvent): void {
    this.currentPageIndex.set(event.pageIndex);
    this.currentPageSize.set(event.pageSize);
    this.historialAcademico.set(this.paginatedHistorialData());
  }

   async verDetalle(element: any): Promise<void> {
    const idHorario = element.idHorario ?? element.IdHorario;
    const idFormatoNota = element.idFormatoNota ?? element.IdFormatoNota;
    const idRegistro = element.idregistro ?? element.Idregistro; // Usar el valor del componente padre

    if (!idHorario || !idFormatoNota || !idRegistro) return;

      const notas: any = await this.notasService.listarNotas(idHorario, idFormatoNota, idRegistro).toPromise();
      this.dialog.open(NotasDetalleDialogComponent, {
        width: '600px',
        data: { notas, element }
      });
  }





}
