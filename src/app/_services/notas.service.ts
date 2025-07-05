import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";

@Injectable({
    providedIn: 'root'
})export class NotasService {
    private http = inject(HttpClient);
    apiUrl = environment.apiUrl + 'Nota/'

    listarNotas(idHorario: number, idFormatoNota: number){
        return this.http.get(this.apiUrl + idHorario + '/' + idFormatoNota );
    }
    listarNotasRecuperacion(idHorario: number, idFormatoNota: number){
        return this.http.get(this.apiUrl + 'Recuperacion/' + idHorario + '/' + idFormatoNota );
    }

    actualizarNota(nota: any) {
        return this.http.patch(this.apiUrl, nota);
    }

    guardarNota(nota: any) {
        return this.http.post(this.apiUrl, nota);
    }
    calcularPromedio(idNota: number, idFormatoNota: number) {
        return this.http.get(this.apiUrl + 'Promedio/' + idNota + '/' + idFormatoNota);
    }
}