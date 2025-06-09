import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { Periodo } from "../_models/periodo";

@Injectable({
    providedIn: 'root'
})export class PeriodoService{
    http =  inject(HttpClient);
    apiUrl = environment.apiUrl + 'Periodo/'
    

    listarPeriodo() {
        return this.http.get(this.apiUrl);
    }

    obtenerPeriodo(idPeriodo: number){
        return this.http.get(this.apiUrl + idPeriodo );
    }

    listaPeriodosAño(año: number) {
        return this.http.get(this.apiUrl + 'Año/' + año);
    }

    obtenerUltimoPeriodo(){
        return this.http.get<Periodo>(this.apiUrl + "PeriodoActual");
    }
}