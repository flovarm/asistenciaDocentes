import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { HttpClient } from "@angular/common/http";


@Injectable({
    providedIn: 'root'
}) export class CursoService {
    private apiUrl = `${environment.apiUrl}Curso/`;
    private http = inject(HttpClient);

       obtenerCursos(estado: boolean) {
        return this.http.get(this.apiUrl + 'listar-cursos/' + estado);
    }

    obtenerCursoPorId(idCurso: number) {
        return this.http.get(this.apiUrl + idCurso);
    }
}