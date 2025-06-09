interface NotaHorarioDto {
  idRegistro: number;
  idHorario: number;
  idPeriodo: number;
  codigo: number;
  alumno: string;
  notas: { [key: string]: string };
}