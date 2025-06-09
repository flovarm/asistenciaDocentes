import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";

@Injectable({
    providedIn: 'root'
})export class HorarioService{
    http = inject(HttpClient);
    apiUrl = environment.apiUrl + 'Horario/';

    obtenerTurno(idProfesor: number) {
        return this.http.get<any[]>(this.apiUrl + 'HorarioDetalle/' + idProfesor);
    }
    obtenerReemplazo(idProfesor: number) {
        return this.http.get<any[]>(this.apiUrl + 'Reemplazo/' + idProfesor);
    }

    cerrarActa(idHorario:number) {
        return this.http.patch(this.apiUrl + 'CerrarActa/' + idHorario, null);
    }
}