
export type AsistenciaProfesor = {
    idAsistenciaDocente: number;
    docente: string;
    idProfesor: number;
    curso: string;
    idCurso: number;
    entrada?: Date;
    entradaEstado?: string;
    entradaMinutosDiferencia?: number;
    salida?: Date;
    salidaEstado?: string;
    salidaMinutosDiferencia?: number;
    insertAplicationName?: string;
    docenteRemplazo?: string;
    idTurno?: number;
    idAula?: number;
    idPeriodo?: number;
  };