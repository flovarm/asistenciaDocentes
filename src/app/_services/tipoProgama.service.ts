import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";

@Injectable({
    providedIn: 'root'
})export class TipoProgramaService{
    http =  inject(HttpClient);
    apiUrl = environment.apiUrl + 'TipoPrograma/'
    

    listarTipoProgram() {
        return this.http.get(this.apiUrl);
    }

    obtenerTipoPrograma(idTipoPrograma: number){
        return this.http.get(this.apiUrl + idTipoPrograma );
    }
}