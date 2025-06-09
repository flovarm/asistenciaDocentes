import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { Turno } from "../_models/turno";

@Injectable({
    providedIn: 'root'
})export class TurnoService{
    http =  inject(HttpClient);
    apiUrl = environment.apiUrl + 'Turno/'
    

    obtenerTurno(idTurno: number){
        return this.http.get(this.apiUrl + idTurno );
    }

    listaTurnoTipoPrograma(idTipoPrograma: number, fecha: Date) {
        const fechaFormateada = fecha.toISOString().split('T')[0];
        return this.http.get(this.apiUrl + 'ListaTurno/' + idTipoPrograma + '/' + fechaFormateada);
    }

    listarTurnosActivos() {
        return this.http.get<Turno[]>(this.apiUrl);
    }
    listarTurnosDocente(idProfesor: number, idPeriodo: number){
        return this.http.get(this.apiUrl + 'TurnoCurso/' +  idProfesor + '/' + idPeriodo);
    }
}