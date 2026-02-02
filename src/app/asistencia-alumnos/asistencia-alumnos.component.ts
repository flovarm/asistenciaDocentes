import {
  Component,
  inject,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { Periodo } from "../_models/periodo";
import { TurnoService } from "../_services/turno.service";
import { PeriodoService } from "../_services/periodo.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { Profesor } from "../_models/profesor";
import { TituloComponent } from "../Shared/titulo/titulo.component";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AsistenciaAlumnoService } from "../_services/asistenciaAlumno.service";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { EstadoAsistenciaService } from "../_services/estado-asistencia.service";
import { Subscription } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { HorarioService } from "../_services/horario.service";
import { CodigoPlataforma } from "../_models/codigoPlataforma";
import { CodigoPlataformaModalComponent } from "./codigo-plataforma-modal.component";

@Component({
  selector: "app-asistencia-alumnos",
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
    MatTooltipModule,
  ],
  templateUrl: "./asistencia-alumnos.component.html",
  styleUrl: "./asistencia-alumnos.component.scss",
})
export class AsistenciaAlumnosComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  turnos: any[] = [];
  turno;
  turnoService = inject(TurnoService);
  periodoService = inject(PeriodoService);
  periodo: Periodo;
  private router = inject(Router);
  private estadoService = inject(EstadoAsistenciaService);
  private subscriptions = new Subscription();
  asistenciaAlumnoService = inject(AsistenciaAlumnoService);
  curso: string = "";
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  tableColumns: string[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  private snack = inject(MatSnackBar);
  clasesRecuperacion: any[] = [];
  displayedColumnsRecuperacion: string[] = ["numero", "alumno", "accion"];
  advertenciaAsistencia: boolean = true;
  dataSourceRecuperacion = new MatTableDataSource<any>([]);
  profesor: Profesor = JSON.parse(localStorage.getItem("profesor"));

  // Propiedades para código de plataforma
  private dialog = inject(MatDialog);
  private horarioService = inject(HorarioService);
  codigoPlataforma: CodigoPlataforma | null = null;
  cargandoCodigoPlataforma = false;

  // Propiedades para rastrear datos originales
  private datosOriginales: any[] = [];
  private datosRecuperacionOriginales: any[] = [];

  // Propiedades para manejar cambios de asistencia
  private asistenciasIniciales = new Map<string, string>();
  private asistenciasModificadas = new Set<string>();
  private datosYaCargados = false;

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

  private restaurarEstadoAnterior(): void {
    // Implementación de restaurar estado...
  }

  private guardarEstadoActual(): void {
    if (this.turno) {
      this.estadoService.guardarTurno(this.turno);
      this.estadoService.guardarCurso(this.curso);
      this.estadoService.guardarEstadoAsistencia(this.dataSource.data);
    }
  }

  obtenerUltimoPeriodo() {
    this.periodoService.obtenerUltimoPeriodo().subscribe({
      next: (result: Periodo) => {
        this.periodo = result;
        this.obtenerTurnos(this.profesor.idProfesor, this.periodo.idPeriodo);
      },
    });
  }

  obtenerTurnos(idProfesor, idPeriodo) {
    this.turnoService.listarTurnosDocente(idProfesor, idPeriodo).subscribe({
      next: (datos: any[]) => {
        this.turnos = datos;
        if (this.turnos.length > 0) {
          setTimeout(() => {
            this.restaurarEstadoAnterior();
          }, 50);
        }
      },
    });
  }

  obtenerCurso() {
    this.curso = "";
    setTimeout(() => {
      this.curso = this.turno?.curso ?? "";
      this.listarAsistencia(this.turno?.idHorario);
      this.listarRecuperacionClase();
      this.obtenerCodigoPlataforma();
    }, 100);
  }

  listarAsistencia(idHorario: number) {
    if (!idHorario) return;
    this.asistenciaAlumnoService.ObtenerLista(idHorario).subscribe({
      next: (datos: any[]) => {
        console.log("Datos de asistencia:", datos);

        // Limpiar estado anterior
        this.asistenciasIniciales.clear();
        this.asistenciasModificadas.clear();
        this.datosYaCargados = false;

        if (!datos || datos.length === 0) {
          this.dataSource.data = [];
          this.displayedColumns = ["alumno"];
          this.tableColumns = ["index", "alumno"];
          this.datosOriginales = [];
          return;
        }

        const fechasSet = new Set<string>();
        datos.forEach((d) => {
          Object.keys(d.asistenciasPorFecha || {}).forEach((f) =>
            fechasSet.add(f),
          );
        });
        const fechas = Array.from(fechasSet).sort();

        const today = this.getTodayString();
        const adaptados = datos.map((d) => {
          const asistencia = fechas.reduce(
            (acc, fecha) => {
              let valorAsistencia =
                fecha === today
                  ? d.asistenciasPorFecha?.[fecha] &&
                    d.asistenciasPorFecha[fecha] !== ""
                    ? d.asistenciasPorFecha[fecha]
                    : ""
                  : (d.asistenciasPorFecha?.[fecha] ?? "");

              if (valorAsistencia) {
                const parsed = this.parseEstadoAsistencia(valorAsistencia);
                acc[fecha] = valorAsistencia;
                acc[`${fecha}_estado`] = parsed.estado;
                if (parsed.estado === "T" && parsed.minutos) {
                  acc[`${fecha}_minutos`] = parsed.minutos;
                } else {
                  acc[`${fecha}_minutos`] = null;
                }
              } else {
                acc[fecha] = valorAsistencia;
                acc[`${fecha}_estado`] = "";
                acc[`${fecha}_minutos`] = null;
              }

              const clave = `${d.idAlumno}-${fecha}`;
              this.asistenciasIniciales.set(clave, valorAsistencia);

              return acc;
            },
            {} as Record<string, any>,
          );

          const recuperaciones = d.recuperaciones || [];
          const recuperacionesTooltip = recuperaciones
            .map((rec: any) => rec.fecha)
            .join(", ");

          return {
            alumno: d.alumno,
            idAlumno: d.idAlumno,
            idHorario: d.idHorario,
            recuperaciones: recuperaciones,
            recuperacionesTooltip: recuperacionesTooltip,
            tieneRecuperaciones: recuperaciones.length > 0,
            ...asistencia,
          };
        });

        this.displayedColumns = ["alumno", ...fechas];
        this.tableColumns = ["index", ...this.displayedColumns];
        this.dataSource.data = adaptados;
        this.datosOriginales = JSON.parse(JSON.stringify(adaptados));
        this.datosYaCargados = true;
      },
      error: (error) => {
        console.error("Error al cargar asistencia:", error);
        this.snack.open("Error al cargar datos de asistencia", "Cerrar", {
          duration: 3000,
          panelClass: ["snack-error"],
        });
      },
    });
  }

  listarRecuperacionClase() {
    if (!this.turno?.idHorario) return;

    this.asistenciaAlumnoService
      .recuperacionClases(this.turno?.idHorario)
      .subscribe({
        next: (datos: any[]) => {
          this.clasesRecuperacion = datos.map((d) => {
            let estado = "";
            let minutos = 0;

            if (d.estado === null) {
              estado = "";
            } else if (typeof d.estado === "object" && d.estado !== null) {
              estado = d.estado.estado || "";
              minutos = d.estado.minTardanza || 0;
            } else {
              const parsed = this.parseEstadoAsistencia(d.estado);
              estado = parsed.estado;
              minutos = parsed.minutos || 0;
            }

            return {
              ...d,
              estado: estado,
              fecha_estado: estado, // Campo para el select
              fecha_minutos: minutos > 0 ? minutos : null, // Campo para el input
            };
          });
          this.dataSourceRecuperacion.data = this.clasesRecuperacion;
          this.datosRecuperacionOriginales = JSON.parse(
            JSON.stringify(this.clasesRecuperacion),
          );
        },
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
    return col !== "alumno" && col !== "idAlumno" && !isNaN(Date.parse(col));
  }

  getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  guardarAsistencia(): void {
    if (!this.datosYaCargados) {
      this.snack.open("Los datos aún no están cargados", "Cerrar", {
        duration: 3000,
      });
      return;
    }

    if (this.asistenciasModificadas.size === 0) {
      this.snack.open("No hay cambios para guardar", "Cerrar", {
        duration: 3000,
        panelClass: ["snack-info"],
      });
      return;
    }

    const today = new Date(this.getTodayString());
    const fechas = this.displayedColumns.filter((col) =>
      this.isDateColumn(col),
    );
    const asistenciasModificadas = [];

    this.dataSource.data.forEach((row) => {
      fechas.forEach((fecha) => {
        const fechaDate = new Date(fecha);
        const clave = `${row.idAlumno}-${fecha}`;

        if (fechaDate <= today && this.asistenciasModificadas.has(clave)) {
          const estadoActual = row[`${fecha}_estado`] || row[fecha] || "F";
          let minutosTardanza = 0;

          if (estadoActual === "T") {
            const minutosInput = row[`${fecha}_minutos`];
            const valorOriginal = row[fecha];
            const minutosOriginales = this.getMinutosTardanza(valorOriginal);

            if (
              minutosInput !== null &&
              minutosInput !== undefined &&
              minutosInput !== ""
            ) {
              minutosTardanza = parseInt(minutosInput.toString(), 10);
            } else if (
              minutosOriginales !== null &&
              minutosOriginales !== undefined
            ) {
              minutosTardanza = minutosOriginales;
            } else {
              minutosTardanza = 5;
            }

            minutosTardanza = minutosTardanza > 0 ? minutosTardanza : 5;
          }

          const asistenciaData: any = {
            idAlumno: row.idAlumno,
            idHorario: row.idHorario,
            fecha: fecha,
            estado: estadoActual,
            minTardanza: minutosTardanza,
          };

          asistenciasModificadas.push(asistenciaData);
        }
      });
    });

    if (asistenciasModificadas.length > 0) {
      console.log("Enviando asistencias modificadas:", asistenciasModificadas);

      this.asistenciaAlumnoService
        .GuardarAsistencias(asistenciasModificadas)
        .subscribe({
          next: () => {
            this.snack.open(
              `${asistenciasModificadas.length} asistencias guardadas`,
              "Cerrar",
              {
                duration: 3000,
                panelClass: ["snack-success"],
              },
            );
            this.advertenciaAsistencia = false;

            asistenciasModificadas.forEach((asistencia) => {
              const clave = `${asistencia.idAlumno}-${asistencia.fecha}`;
              this.asistenciasIniciales.set(clave, asistencia.estado);
            });
            this.asistenciasModificadas.clear();
          },
          error: (error) => {
            console.error("Error al guardar asistencias:", error);
            this.snack.open("Error al guardar asistencias", "Cerrar", {
              duration: 3000,
              panelClass: ["snack-error"],
            });
          },
        });
    }
  }

  guardarRecuperado(): void {
    const recuperacionesModificadas = [];

    // Verificar si todos los elementos tienen un estado seleccionado
    const elementosSinEstado = this.dataSourceRecuperacion.data.filter(
      (element) =>
        !element.fecha_estado ||
        element.fecha_estado === "" ||
        element.fecha_estado === null,
    );

    if (elementosSinEstado.length > 0) {
      this.snack.open(
        "No seleccionó ningún estado de asistencia para algunos estudiantes",
        "Cerrar",
        {
          duration: 3000,
          panelClass: ["snack-error"],
        },
      );
      return;
    }

    this.dataSourceRecuperacion.data.forEach((element) => {
      const estadoActual = element.fecha_estado || element.estado || "F";
      let minutosTardanza = 0;

      if (estadoActual === "T") {
        minutosTardanza = element.fecha_minutos || 5;
      }

      const fechaFormateada = element.fecha.split("T")[0];
      recuperacionesModificadas.push({
        idAlumno: element.idAlumno,
        idHorario: element.idHorario,
        fecha: fechaFormateada,
        estado: estadoActual,
        minTardanza: minutosTardanza,
      });
    });

    if (recuperacionesModificadas.length > 0) {
      console.log(
        "Enviando recuperaciones modificadas:",
        recuperacionesModificadas,
      );

      this.asistenciaAlumnoService
        .GuardarAsistencias(recuperacionesModificadas)
        .subscribe({
          next: () => {
            this.snack.open(
              `${recuperacionesModificadas.length} asistencias de recuperación guardadas`,
              "Cerrar",
              {
                duration: 3000,
                panelClass: ["snack-success"],
              },
            );
            this.advertenciaAsistencia = false;
            this.datosRecuperacionOriginales = JSON.parse(
              JSON.stringify(this.dataSourceRecuperacion.data),
            );
          },
          error: (error) => {
            console.error("Error al guardar recuperaciones:", error);
            this.snack.open(
              "Error al guardar asistencias de recuperación",
              "Cerrar",
              {
                duration: 3000,
                panelClass: ["snack-error"],
              },
            );
          },
        });
    } else {
      this.snack.open("No hay recuperaciones para guardar", "Cerrar", {
        duration: 3000,
        panelClass: ["snack-info"],
      });
    }
  }

  isEditableDate(column: string): boolean {
    const today = new Date();
    const colDate = new Date(column);
    return colDate <= today;
  }

  getMesDia(): string {
    const date = new Date();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${mes}/${dia}`;
  }

  // Método para detectar si una asistencia ha cambiado
  private hasAsistenciaChanged(
    idAlumno: number,
    fecha: string,
    estadoActual: string,
  ): boolean {
    const clave = `${idAlumno}-${fecha}`;
    const estadoInicial = this.asistenciasIniciales.get(clave) || "";
    return estadoInicial !== estadoActual;
  }

  // Método para marcar una asistencia como modificada
  onAsistenciaChange(idAlumno: number, fecha: string): void {
    const clave = `${idAlumno}-${fecha}`;
    this.asistenciasModificadas.add(clave);

    const filaIndex = this.dataSource.data.findIndex(
      (row) => row.idAlumno === idAlumno,
    );
    if (filaIndex !== -1) {
      const fila = this.dataSource.data[filaIndex];
      const nuevoEstado = fila[`${fecha}_estado`];

      if (nuevoEstado === "T") {
        if (!fila[`${fecha}_minutos`] || fila[`${fecha}_minutos`] === null) {
          fila[`${fecha}_minutos`] = 5;
        }
      } else {
        fila[`${fecha}_minutos`] = null;
      }

      fila[fecha] = nuevoEstado;
    }
  }

  // Método para manejar cambios en los minutos de tardanza
  onMinutosTardanzaChange(idAlumno: number, fecha: string): void {
    const clave = `${idAlumno}-${fecha}`;
    this.asistenciasModificadas.add(clave);
  }

  // Métodos para manejar recuperaciones
  onRecuperacionChange(element: any): void {
    // Actualizar el estado principal para sincronizar
    element.estado = element.fecha_estado;

    // Si es tardanza, establecer 5 minutos por defecto
    if (element.fecha_estado === "T") {
      if (!element.fecha_minutos || element.fecha_minutos === null) {
        element.fecha_minutos = 5;
      }
    } else {
      // Limpiar minutos si no es tardanza
      element.fecha_minutos = null;
    }
  }

  onRecuperacionMinutosChange(element: any): void {
    // Solo marcar que hay cambios - los minutos se manejan directamente en el ngModel
  }

  // Método para parsear el estado de asistencia
  parseEstadoAsistencia(estado: string): { estado: string; minutos?: number } {
    if (!estado || estado === "") {
      return { estado: "" };
    }

    if (estado.includes(" - ")) {
      const partes = estado.split(" - ");
      const estadoPrincipal = partes[0].trim();
      const minutos = parseInt(partes[1].trim());

      if (estadoPrincipal === "A" && minutos > 0) {
        return { estado: "T", minutos: minutos };
      }

      return { estado: estadoPrincipal, minutos: minutos };
    }

    return { estado: estado };
  }

  // Método para formatear el estado para mostrar en la tabla
  getDisplayEstado(estado: string): string {
    const parsed = this.parseEstadoAsistencia(estado);
    return parsed.estado;
  }

  // Método para obtener los minutos de tardanza si existen
  getMinutosTardanza(estado: string): number | null {
    const parsed = this.parseEstadoAsistencia(estado);
    return parsed.minutos || null;
  }

  // Método para verificar si tiene tardanza con minutos
  tieneTardanzaConMinutos(estado: string): boolean {
    const parsed = this.parseEstadoAsistencia(estado);
    return parsed.estado === "T" && parsed.minutos !== undefined;
  }

  // Método para determinar si debe mostrar el input de minutos
  deberMostrarInputMinutos(row: any, fecha: string): boolean {
    const estadoSelect = row[`${fecha}_estado`];
    if (estadoSelect === "T") {
      return true;
    }

    const valorOriginal = row[fecha];
    if (valorOriginal && this.tieneTardanzaConMinutos(valorOriginal)) {
      return true;
    }

    return false;
  }

  getCurrentDateColumn(): string | null {
    const today = this.getTodayString();
    let fechaActual = this.displayedColumns.find(
      (col) => this.isDateColumn(col) && col === today,
    );

    if (fechaActual) {
      return fechaActual;
    }

    const fechasEditables = this.displayedColumns.filter(
      (col) => this.isDateColumn(col) && this.isEditableDate(col),
    );

    if (fechasEditables.length > 0) {
      const fechasOrdenadas = fechasEditables.sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime(),
      );
      return fechasOrdenadas[0];
    }

    return null;
  }

  hasFechasEditables(): boolean {
    return this.displayedColumns.some(
      (col) => this.isDateColumn(col) && this.isEditableDate(col),
    );
  }

  existeFechaActual(): boolean {
    const todayString = this.getTodayString();
    return this.displayedColumns.some((col) => {
      if (!this.isDateColumn(col)) return false;
      return col === todayString;
    });
  }

  marcarTodosParaFechaActual(estado: "P" | "T" | "A"): void {
    const fechaActual = this.getCurrentDateColumn();

    if (!fechaActual) {
      this.snack.open("No se encontró ninguna fecha editable", "Cerrar", {
        duration: 3000,
        panelClass: ["snack-error"],
      });
      return;
    }

    const datosActualizados = this.dataSource.data.map((row) => {
      const clave = `${row.idAlumno}-${fechaActual}`;
      this.asistenciasModificadas.add(clave);

      row[`${fechaActual}_estado`] = estado;

      if (estado === "T") {
        row[`${fechaActual}_minutos`] = 5;
      } else {
        row[`${fechaActual}_minutos`] = null;
      }

      row[fechaActual] = estado;

      return row;
    });

    this.dataSource.data = datosActualizados;
    this.advertenciaAsistencia = true;

    const estadoTexto =
      estado === "P" ? "Presente" : estado === "T" ? "Tardanza" : "Falta";

    this.snack.open(
      `${datosActualizados.length} alumnos marcados como: ${estadoTexto}`,
      "Cerrar",
      {
        duration: 3000,
        panelClass: ["snack-success"],
      },
    );
  }

  verDetalleAlumno(idAlumno: any): void {
    if (idAlumno) {
      this.guardarEstadoActual();
      this.router.navigate(["/detalle-alumno", idAlumno]);
    }
  }

  // Métodos para código de plataforma
  obtenerCodigoPlataforma(): void {
    if (!this.turno?.idHorario) {
      return;
    }

    this.cargandoCodigoPlataforma = true;
    this.horarioService
      .obtenerCodigoPlataforma(this.turno.idHorario)
      .subscribe({
        next: (codigo) => {
          this.codigoPlataforma = codigo;
          this.cargandoCodigoPlataforma = false;
        },
        error: (error) => {
          // Si no existe código de plataforma, no es un error
          if (error.status === 400) {
            this.codigoPlataforma = null;
          } else {
            console.error("Error al obtener código de plataforma:", error);
          }
          this.cargandoCodigoPlataforma = false;
        },
      });
  }

  abrirModalCodigoPlataforma(): void {
    if (!this.turno?.idHorario || !this.turno?.idCurso) {
      this.snack.open("Seleccione un turno válido", "Cerrar", {
        duration: 3000,
        panelClass: ["snack-error"],
      });
      return;
    }

    const dialogRef = this.dialog.open(CodigoPlataformaModalComponent, {
      width: "500px",
      disableClose: true,
      data: {
        idHorario: this.turno.idHorario,
        idCurso: this.turno.idCurso,
        Curso: this.curso,
        codigoExistente: this.codigoPlataforma,
        esEdicion: !!this.codigoPlataforma,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Actualizar la información del código de plataforma
        this.obtenerCodigoPlataforma();
      }
    });
  }
}
