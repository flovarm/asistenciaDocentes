export interface AlumnoFilter {
    pageNumber: number;
    pageSize: number;
    nombre?: string;
    apellidos?: string;
    dni?: string;
    curso?: string;
    docente?: string;
    modalidad?: string;
    searchTerm?: string;
    estado?: string;
    periodos?: number[];
    idTurnos?: number[];
    idDocentes?: number[];
    idProfesores?: number[];
    idCursos?: number[];
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}
