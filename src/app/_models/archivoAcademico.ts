export interface ArchivoAcademico {
  id: number;
  nombre: string;
  descripcion: string;
  urlPdf: string;
  estado: boolean;
  fechaCreacion: Date;
  usuarioCreacion: number;
  fechaModificacion?: Date;
  usuarioModificacion?: number;
}
