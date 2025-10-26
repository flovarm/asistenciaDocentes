import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComentarioService } from '../../_services/comentario.service';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Profesor } from '../../_models/profesor';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-comentarios',
  imports: [
    CommonModule, 
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    CommonModule
  ],
  templateUrl: './comentarios.component.html',
  styleUrl: './comentarios.component.scss'
})
export class ComentariosComponent implements OnInit, OnDestroy {
  profesor: Profesor = localStorage.getItem('profesor') ? JSON.parse(localStorage.getItem('profesor')!) : null;
  @Input() codigoAlumno: string = '';
  
  comentarios: any[] = [];
  mostrarFormulario: boolean = false;
  comentarioEditando: any = null;
  nuevoComentario = {
    descripcion: ''
  };
  private destroy$ = new Subject<void>();

  constructor(private comentarioService: ComentarioService) {}

  ngOnInit(): void {
    if (this.codigoAlumno) {
      this.cargarComentarios();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarComentarios(): void {
    const idAlumno = parseInt(this.codigoAlumno);
    
    if (isNaN(idAlumno)) {
      return;
    }

    this.comentarioService.listarComentarios(idAlumno)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.comentarios = data;
        }
      });
  }

  puedeEditarComentario(comentario: any): boolean {
    return this.profesor && comentario.idDocente === this.profesor.idProfesor;
  }

  editarComentario(comentario: any): void {
    this.comentarioEditando = { ...comentario };
    this.mostrarFormulario = true;
    this.nuevoComentario.descripcion = comentario.descripcion;
  }

  cancelarAgregar(): void {
    this.mostrarFormulario = false;
    this.comentarioEditando = null;
    this.nuevoComentario = {
      descripcion: ''
    };
  }

  agregarComentario(): void {
    if (!this.nuevoComentario.descripcion.trim()) {
      return;
    }

    const idAlumno = parseInt(this.codigoAlumno);
    if (isNaN(idAlumno)) {
      return;
    }

    // Si estamos editando un comentario existente
    if (this.comentarioEditando) {
      const comentarioActualizado = {
        idDocente: this.comentarioEditando.idDocente,
        idAlumno: this.comentarioEditando.idAlumno,
        descripcion: this.nuevoComentario.descripcion,
        fecha: this.comentarioEditando.fecha,
        idUsuarioRegistro: this.comentarioEditando.idUsuarioRegistro,
        estado: this.comentarioEditando.estado
      };

      this.comentarioService.updateComentario(this.comentarioEditando.id, comentarioActualizado)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            this.cargarComentarios(); // Recargar la lista
            this.cancelarAgregar(); // Cerrar formulario
          }
        });
    } else {
      // Crear nuevo comentario
      const comentarioDto = {
        idDocente: this.profesor.idProfesor,
        idAlumno: idAlumno,
        descripcion: this.nuevoComentario.descripcion,
        fecha: new Date().toISOString().split('T')[0],
        idUsuarioRegistro: this.profesor.idProfesor,
        estado: true
      };

      this.comentarioService.createComentario(comentarioDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            this.cargarComentarios(); // Recargar la lista
            this.cancelarAgregar(); // Cerrar formulario
          }
        });
    }
  }

  get fechaActual(): string {
    return new Date().toLocaleDateString('es-ES');
  }
}
