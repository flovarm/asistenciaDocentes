import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { Observable, tap } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AlumnoFilter, PagedResult } from "../_models/alumno-filter.interface";


@Injectable({
    providedIn: 'root'
})export class AlumnoService {
     private http = inject(HttpClient); 
   private apiUrl = environment.apiUrl + 'alumno/';

    esAlumno(dni: string) {
        return this.http.get(`${this.apiUrl}es-alumno/${dni}`);
    }

    getAlumnosPorPeriodo(idPeriodo: number, tipoPrograma: string, id_sede: string) {
        return this.http.get(`${this.apiUrl}alumnos-por-periodo`, {
            params: {
                idPeriodo: idPeriodo.toString(),
                tipoPrograma: tipoPrograma,
                id_sede: id_sede
            }
        });
    }

    getAlumnosPaginados(filter: AlumnoFilter): Observable<PagedResult<any>> {
        const params = this.buildQueryParams(filter);
        const url = `${this.apiUrl}alumnos-paginados`;

        return this.http.get<PagedResult<any>>(url, { params }).pipe(
            tap(response => console.log('API Response:', response))
        );
    }

    getHistorialAcademico(filter: AlumnoFilter): Observable<PagedResult<any>> {
        const params = this.buildQueryParams(filter);
        const url = `${this.apiUrl}historial-academico`;

        return this.http.get<PagedResult<any>>(url, { params }).pipe(
            tap(response => console.log('Historial Academico Response:', response))
        );
    }

    private buildQueryParams(filter: AlumnoFilter): HttpParams {
        let params = new HttpParams()
            .set('PageNumber', filter.pageNumber.toString())
            .set('PageSize', filter.pageSize.toString());

        if (filter.nombre) params = params.set('Nombre', filter.nombre);
        if (filter.apellidos) params = params.set('Apellidos', filter.apellidos);
        if (filter.dni) params = params.set('Dni', filter.dni);
        if (filter.curso) params = params.set('Curso', filter.curso);
        if (filter.docente) params = params.set('Docente', filter.docente);
        if (filter.searchTerm) params = params.set('SearchTerm', filter.searchTerm);
        if (filter.modalidad) params = params.set('Modalidad', filter.modalidad);
        if (filter.estado && filter.estado !== '') params = params.set('Estado', filter.estado);
        
        if (filter.periodos && filter.periodos.length > 0) {
            filter.periodos.forEach(periodo => {
                params = params.append('Periodos', periodo.toString());
            });
        }
        
        // Add IdPeriodo parameter for single period queries
        if (filter.periodos && filter.periodos.length === 1) {
            params = params.set('IdPeriodo', filter.periodos[0].toString());
        }
        
        if (filter.idTurnos && filter.idTurnos.length > 0) {
            filter.idTurnos.forEach(turno => {
                params = params.append('IdTurnos', turno.toString());
            });
        }
        
        if (filter.idDocentes && filter.idDocentes.length > 0) {
            filter.idDocentes.forEach(docente => {
                params = params.append('IdDocentes', docente.toString());
            });
        }
        
        if (filter.idProfesores && filter.idProfesores.length > 0) {
            filter.idProfesores.forEach(profesor => {
                params = params.append('IdProfesores', profesor.toString());
            });
        }
        
        if (filter.idCursos && filter.idCursos.length > 0) {
            filter.idCursos.forEach(curso => {
                params = params.append('IdCursos', curso.toString());
            });
        }

        return params;
    }

    getAlumnoDetalle(codigo: number): Observable<any> {
        const url = `${this.apiUrl}detalle/${codigo}`;

        return this.http.get(url).pipe(
            tap(response => console.log('Detalle Response:', response))
        );
    }

    updateAlumno(codigo: number, alumnoData: any) {
        return this.http.patch(`${this.apiUrl}actualizar/${codigo}`, alumnoData);
    }

    agregarAlumno(alumnoData: any): Observable<any> {    
    return this.http.post(`${this.apiUrl}agregar`, alumnoData)
    }   
    
    obtenerHistorialAcademicoByCodigo(codigo: number): Observable<any[]> {
        const url = `${this.apiUrl}${codigo}/historial-academico`;
        return this.http.get<any[]>(url).pipe(
            tap(response => console.log('Historial por código Response:', response))
        );
    }   
    
    buscarAlumnosPaginasdos(filter: AlumnoFilter): Observable<PagedResult<any>> {
        const params = this.buildQueryParams(filter);
        const url = `${this.apiUrl}buscar-alumnos-paginados`;
        return this.http.get<PagedResult<any>>(url, { params }).pipe(
            tap(response => console.log('Buscar Alumnos Paginados Response:', response))
        );
    }

    verificarDNI(dni: string): Observable<{existe: boolean, codigo: number}> {
        const url = `${this.apiUrl}verificar-dni`;
        return this.http.get<{existe: boolean, codigo: number}>(url, {
            params: { dni: dni }
        });
    }

    // Método para inicializar el filtro con valores por defecto
    initializeFilter(): AlumnoFilter {
        return {
            pageNumber: 1,
            pageSize: 10,
            nombre: '',
            apellidos: '',
            dni: '',
            curso: '',
            docente: '',
            modalidad: '',
            searchTerm: '',
            estado: 'A',
            periodos: [],
            idTurnos: [],
            idDocentes: [],
            idProfesores: []
        };
    }
}