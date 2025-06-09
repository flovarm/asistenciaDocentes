export type Periodo = {
  idPeriodo: number;
  descripcion?: number;
  mes: string;
  anio: number;
  iniciop?: Date;
  finp?: Date;
  activo: boolean;
  activoacademico?: boolean;
  adultosRegular?: boolean;
  inicioAdultos: Date;
  finAdultos: Date;
  ninosRegular?: boolean;
  inicioNinos?: Date;
  finNinos?: Date;
  adultosFds?: boolean;
  inicioFds?: Date;
  finFds?: Date;
  ninosFds?: boolean;
  inicioNinosFds?: Date;
  finNinosFds?: Date;
}