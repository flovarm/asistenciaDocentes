import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoNotasService {
  private estadoNotas = new BehaviorSubject<any>(null);
  private estadoNotasRecuperacion = new BehaviorSubject<any>(null);
  private filtroActual = new BehaviorSubject<string>('');
  private turnoSeleccionado = new BehaviorSubject<any>(null);
  private cursoSeleccionado = new BehaviorSubject<string>('');
  private paginaActual = new BehaviorSubject<number>(0);
  private columnasDisplayed = new BehaviorSubject<string[]>([]);
  private columnasRecuperacion = new BehaviorSubject<string[]>([]);

  // Observables
  estadoNotas$ = this.estadoNotas.asObservable();
  estadoNotasRecuperacion$ = this.estadoNotasRecuperacion.asObservable();
  filtroActual$ = this.filtroActual.asObservable();
  turnoSeleccionado$ = this.turnoSeleccionado.asObservable();
  cursoSeleccionado$ = this.cursoSeleccionado.asObservable();

  // Métodos para guardar estado
  guardarEstadoNotas(datos: any[]): void {
    this.estadoNotas.next(datos);
  }

  guardarEstadoNotasRecuperacion(datos: any[]): void {
    this.estadoNotasRecuperacion.next(datos);
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

  guardarColumnas(columnas: string[]): void {
    this.columnasDisplayed.next(columnas);
  }

  guardarColumnasRecuperacion(columnas: string[]): void {
    this.columnasRecuperacion.next(columnas);
  }

  // Métodos para obtener estado actual
  obtenerEstadoNotas(): any {
    return this.estadoNotas.value;
  }

  obtenerEstadoNotasRecuperacion(): any {
    return this.estadoNotasRecuperacion.value;
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

  obtenerColumnas(): string[] {
    return this.columnasDisplayed.value;
  }

  obtenerColumnasRecuperacion(): string[] {
    return this.columnasRecuperacion.value;
  }

  // Limpiar estado
  limpiarEstado(): void {
    this.estadoNotas.next(null);
    this.estadoNotasRecuperacion.next(null);
    this.filtroActual.next('');
    this.turnoSeleccionado.next(null);
    this.cursoSeleccionado.next('');
    this.paginaActual.next(0);
    this.columnasDisplayed.next([]);
    this.columnasRecuperacion.next([]);
  }
}
