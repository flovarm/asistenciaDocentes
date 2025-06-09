import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";

@Injectable({
    providedIn: 'root'
})export class AsistenciaProfesorService{
    http =  inject(HttpClient);
    apiUrl = environment.apiUrl + 'AsistenciaDocente/'
    

    listarAsistenciaDocente(idTurno: number, fecha: any){
        const fechaFormateada = fecha.toISOString().split('T')[0];
        return this.http.get(this.apiUrl + idTurno + '/' + fechaFormateada);
    }

    guardarDocenteReemplazo(model: any) {
      return this.http.post(this.apiUrl + 'Reemplazo' , model);
    }

    horarioCruzado(model: any)  {
        return this.http.post(this.apiUrl + 'Cruce' , model);
    }

    Entrada(model: any){
        return this.http.post(this.apiUrl , model);
    }

    Salida(model: any){
        return this.http.patch(this.apiUrl , model);
    }
    EntradaReemplazo(model: any){
        return this.http.patch(this.apiUrl + 'EntradaReemplazo/' , model);
    }

    SalidaReemplazo(model: any){
        return this.http.patch(this.apiUrl + 'SalidaReemplazo/' , model);
    }
}