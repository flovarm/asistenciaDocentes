import { Component, inject, OnInit, signal, ViewChild, AfterViewInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificacionService } from '../../_services/notificacion.service';
import { DetalleNotificacionComponent } from './detalle-notificacion/detalle-notificacion.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRadioModule } from '@angular/material/radio';
import { TiempoRelativoPipe } from '../../_pipes/tiempo-relativo.pipe';

@Component({
  selector: 'app-notificaciones',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule, 
    MatPaginatorModule, 
    MatInputModule, 
    MatFormFieldModule,
    MatBadgeModule,
    MatRadioModule,
    TiempoRelativoPipe, 
    FormsModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss'
})
export class NotificacionesComponent implements OnInit {
  public notificacionService = inject(NotificacionService);
  private dialog = inject(MatDialog);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  searchValue = signal('');
  filtroLectura = signal<'todas' | 'noLeidas'>('todas');
  displayedColumns: string[] = ['usuario', 'fechaRegistro', 'acciones'];
  user: any = JSON.parse(localStorage.getItem('profesor') || '{}');
  
  // Computed signal para notificaciones filtradas
  notificacionesFiltradas = computed(() => {
    let notificaciones = this.notificacionService.listaNotificaciones();
    
    // Aplicar filtro de búsqueda
    const searchTerm = this.searchValue().trim();
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      notificaciones = notificaciones.filter(notif => 
        notif.usuario.toLowerCase().includes(searchLower) ||
        notif.descripcion.toLowerCase().includes(searchLower) ||
        notif.fechaRegistro.toLowerCase().includes(searchLower)
      );
    }
    
    // Aplicar filtro de estado de lectura
    if (this.filtroLectura() === 'noLeidas') {
      notificaciones = notificaciones.filter(notif => this.esNoLeida(notif));
    }
    return notificaciones;
  });
  
  ngOnInit() {
    this.cargarNotificaciones();
  }

  
  cargarNotificaciones() {
    if (this.user.idProfesor) {
      this.notificacionService.listarNotificacionDocente(this.user.idProfesor).subscribe({
        next: (notificaciones) => {
        },
        error: (error) => {
          console.error('Error al cargar notificaciones:', error);
        }
      });
    }
  }
  
  aplicarFiltro() {
    // Los filtros se aplican automáticamente a través del computed signal
  }
  
  limpiarBusqueda() {
    this.searchValue.set('');
  }
  
  verDetalle(notificacion: any) {
    this.dialog.open(DetalleNotificacionComponent, {
      width: '500px',
      data: notificacion
    }).afterClosed().subscribe(() => {
      this.cargarNotificaciones();
    });
  }
  
  esNoLeida(notificacion: any): boolean {
    return notificacion.leido === false || notificacion.leido === 0;
  }

  cambiarFiltroLectura() {
    this.aplicarFiltro();
  }
}
