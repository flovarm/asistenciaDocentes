export type Turno = {
  idTurno: number;
  nombre: string;
  inicio: Date;
  fin: Date;
  idTipoPrograma: number;
  tipoTurno: string;
  lunes: boolean;
  martes: boolean;
  miercoles: boolean;
  jueves: boolean;
  viernes: boolean;
  sabado: boolean;
  domingo: boolean;
  estado: boolean;
  hreducido: boolean;
  secuencia: number;
  exportar?: boolean;
  nroHoras: number;
  idTurnoDomingo: number;
  restringirExtemporaneo: boolean;
  numeroHoras: number;
  numeroTurnos: number;
  numeroMaximoTardanzas: number;
  numeroMaximoFaltas: number;
  idSede?: string;
  description?: string;
}