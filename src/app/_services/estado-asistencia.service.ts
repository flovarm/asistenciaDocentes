import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoAsistenciaService {
  private estadoAsistencia = new BehaviorSubject<any>(null);
  private filtroActual = new BehaviorSubject<string>('');
  private turnoSeleccionado = new BehaviorSubject<any>(null);
  private cursoSeleccionado = new BehaviorSubject<string>('');
  private paginaActual = new BehaviorSubject<number>(0);

  // Observables para suscribirse a los cambios
  estadoAsistencia$ = this.estadoAsistencia.asObservable();
  filtroActual$ = this.filtroActual.asObservable();
  turnoSeleccionado$ = this.turnoSeleccionado.asObservable();
  cursoSeleccionado$ = this.cursoSeleccionado.asObservable();

  // Métodos para guardar estado
  guardarEstadoAsistencia(datos: any[]): void {
    this.estadoAsistencia.next(datos);
  }

  guardarFiltro(filtro: string): void {
    this.filtroActual.next(filtro);
  }

  guardarTurno(turno: any): void {
    this.turnoSeleccionado.next(turno);
  }

  guardarCurso(curso: string): void {
    this.cursoSeleccionado.next(curso);
  }

  guardarPagina(pagina: number): void {
    this.paginaActual.next(pagina);
  }

  // Métodos para obtener estado actual
  obtenerEstadoAsistencia(): any {
    return this.estadoAsistencia.value;
  }

  obtenerFiltroActual(): string {
    return this.filtroActual.value;
  }

  obtenerTurnoSeleccionado(): any {
    return this.turnoSeleccionado.value;
  }

  obtenerCursoSeleccionado(): string {
    return this.cursoSeleccionado.value;
  }

  obtenerPaginaActual(): number {
    return this.paginaActual.value;
  }

  // Limpiar estado al salir completamente
  limpiarEstado(): void {
    this.estadoAsistencia.next(null);
    this.filtroActual.next('');
    this.turnoSeleccionado.next(null);
    this.cursoSeleccionado.next('');
    this.paginaActual.next(0);
  }
}
