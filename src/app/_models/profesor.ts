export type Profesor = {
  idProfesor: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  celular: string;
  sexo: string;
  estado: boolean;
  coordinador: boolean;
  userName: string | null;
  userPass: string | null;
  accesoWeb: boolean;
  horarioSinProfesor: boolean;
  idSede: number | null;
  token: string;
};