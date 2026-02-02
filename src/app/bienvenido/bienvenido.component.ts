import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  OnDestroy,
} from "@angular/core";
import { Profesor } from "../_models/profesor";
import { ProfesorService } from "../_services/profesor.service";
import { MatCardModule } from "@angular/material/card";
import { CommonModule } from "@angular/common";
import { InitialsPipe } from "../_pipes/Initials.pipe";
import { MatDividerModule } from "@angular/material/divider";
import { FormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActualizarProfesorDialogComponent } from "./actualizar-profesor-dialog.component";
import { EventoDialogComponent } from "./evento-dialog/evento-dialog.component";
import { MatButtonModule } from "@angular/material/button";
import { EventoService } from "../_services/evento.service";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { NotificacionesComponent } from "../Shared/notificaciones/notificaciones.component";
import { ArchivoAcademicoService } from "../_services/archivoAcademico.service";
import { ArchivoAcademico } from "../_models/archivoAcademico";
import { interval, Subscription } from "rxjs";

@Component({
  selector: "app-bienvenido",
  imports: [
    MatCardModule,
    CommonModule,
    InitialsPipe,
    MatDividerModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    NotificacionesComponent,
  ],
  templateUrl: "./bienvenido.component.html",
  styleUrl: "./bienvenido.component.scss",
})
export class BienvenidoComponent implements OnDestroy {
  usuarioService = inject(ProfesorService);
  dialog = inject(MatDialog);
  profesorService = inject(ProfesorService);
  usuario: Profesor = JSON.parse(localStorage.getItem("profesor"));
  mostrarModalActualizar = false;
  profesorEdit: any = {};
  mensajeActualizacion: string = "";
  usuarioLogeado: Profesor | null = null;
  eventos: any[] = [];
  private eventoService = inject(EventoService);
  private archivoAcademicoService = inject(ArchivoAcademicoService);

  // Archivos PDF académicos y carrusel
  archivosAcademicos: ArchivoAcademico[] = [];
  currentIndex = 0;
  itemsPorPagina = 2;

  ngOnInit(): void {
    this.obtenerUsuario();
    this.eventosDesdeAhora();
    this.cargarArchivosAcademicos();
  }

  ngOnDestroy(): void {}

  obtenerUsuario() {
    this.usuarioService
      .obtenerProfesor(this.usuario.idProfesor)
      .subscribe((result: any) => {
        this.usuarioLogeado = result;
      });
  }

  abrirModalActualizar() {
    const dialogRef = this.dialog.open(ActualizarProfesorDialogComponent, {
      width: "500px",
      disableClose: true,
      data: { profesor: this.usuarioLogeado },
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
    this.mensajeActualizacion = "";
  }

  eventosDesdeAhora() {
    this.eventoService.listarEventosDesdeAhora().subscribe((eventos) => {
      this.eventos = eventos as any[];
    });
  }

  // Método para abrir el dialog del evento
  abrirDialogEvento(evento: any) {
    const dialogRef = this.dialog.open(EventoDialogComponent, {
      width: "600px",
      maxHeight: "80vh",
      disableClose: false,
      data: { evento: evento },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === "asistencia_registrada") {
        // Aquí podrías actualizar la lista de eventos o mostrar un mensaje
        console.log("Asistencia registrada para el evento:", evento.titulo);
      }
    });
  }

  // Método para cargar archivos académicos desde el servicio
  cargarArchivosAcademicos(): void {
    this.archivoAcademicoService.listarArchivosAcademicos(true).subscribe({
      next: (archivos: ArchivoAcademico[]) => {
        this.archivosAcademicos = archivos || [];
      },
      error: (error) => {
        console.error("Error al cargar archivos:", error);
      },
    });
  }

  // Métodos del carrusel
  get archivosVisibles(): ArchivoAcademico[] {
    return this.archivosAcademicos.slice(
      this.currentIndex,
      this.currentIndex + this.itemsPorPagina,
    );
  }

  get currentPage(): number {
    return Math.floor(this.currentIndex / this.itemsPorPagina);
  }

  get dots(): any[] {
    const totalPages = Math.ceil(
      this.archivosAcademicos.length / this.itemsPorPagina,
    );
    return Array(totalPages).fill(0);
  }

  anteriorArchivos() {
    if (this.currentIndex > 0) {
      this.currentIndex = Math.max(0, this.currentIndex - this.itemsPorPagina);
    }
  }

  siguienteArchivos() {
    if (
      this.currentIndex <
      this.archivosAcademicos.length - this.itemsPorPagina
    ) {
      this.currentIndex = Math.min(
        this.archivosAcademicos.length - this.itemsPorPagina,
        this.currentIndex + this.itemsPorPagina,
      );
    }
  }

  irAPaginaArchivos(page: number) {
    this.currentIndex = page * this.itemsPorPagina;
  }

  // Método para abrir PDF en nueva pestaña
  abrirPDF(rutaArchivo: string) {
    if (rutaArchivo && rutaArchivo.trim() !== "") {
      window.open(rutaArchivo, "_blank");
    } else {
      console.warn("URL del PDF está vacía o es inválida");
    }
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString("es-ES");
  }
}
