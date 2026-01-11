import { Component, inject } from '@angular/core';
import { Profesor } from '../_models/profesor';
import { ProfesorService } from '../_services/profesor.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { InitialsPipe } from '../_pipes/Initials.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActualizarProfesorDialogComponent } from './actualizar-profesor-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { EventoService } from '../_services/evento.service';
import { MatIcon, MatIconModule } from "@angular/material/icon";


@Component({
  selector: 'app-bienvenido',
  imports: [
    MatCardModule,
    CommonModule,
    InitialsPipe,
    MatDividerModule,
    FormsModule,
    MatButtonModule,
    MatIconModule
],
  templateUrl: './bienvenido.component.html',
  styleUrl: './bienvenido.component.scss'
})
export class BienvenidoComponent {
  usuarioService = inject(ProfesorService);
  usuario : Profesor = JSON.parse(localStorage.getItem('profesor'));
  mostrarModalActualizar = false;
  profesorEdit: any = {};
  mensajeActualizacion: string = '';
  usuarioLogeado: Profesor | null = null;
  eventos: any[] = [];
  private eventoService = inject(EventoService);
  constructor(
    private profesorService: ProfesorService,
    private dialog: MatDialog
  ) {
    this.usuarioLogeado = this.profesorService.currentUser();
  }

  ngOnInit(): void {
    this.obtenerUsuario();
    this.eventosDesdeAhora();
  }

  obtenerUsuario() {
    this.usuarioService.obtenerProfesor(this.usuario.idProfesor).subscribe((result: any) => {
      this.usuarioLogeado =  result;
    });
  }

  abrirModalActualizar() {
    const dialogRef = this.dialog.open(ActualizarProfesorDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { profesor: this.usuarioLogeado }
    });

    dialogRef.afterClosed().subscribe((profesorActualizado) => {
      if (profesorActualizado) {
        this.usuarioLogeado = profesorActualizado;
        this.profesorService.currentUser.set(profesorActualizado);
      }
    });
  }

  cerrarModalActualizar() {
    this.mostrarModalActualizar = false;
    this.profesorEdit = {};
    this.mensajeActualizacion = '';
  }

   eventosDesdeAhora() {
     this.eventoService.listarEventosDesdeAhora().subscribe(eventos => {
       this.eventos = eventos as any[];
     });
  } 
}
