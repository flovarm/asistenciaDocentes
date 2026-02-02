import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { AsistenciaAlumno } from "../_models/asistenciaAlumno";

@Injectable({
    providedIn: "root"
})export class AsistenciaAlumnoService {
    private http = inject(HttpClient);
    apiUrl = environment.apiUrl + "AsistenciaAlumno/";

    ObtenerLista(idHorario: number , Codigo?: number) {
        if (Codigo) {
            return this.http.get<AsistenciaAlumno[]>(this.apiUrl + "Detalle2/" + idHorario + "/" + Codigo);
        }
        return this.http.get(this.apiUrl + "Nuevo/" + idHorario);
    }

    GuardarAsistencias(asistencias: any[]) {
    return this.http.post(this.apiUrl , asistencias);
    }

    recuperacionClases(idHorario: number) {
        return this.http.get<AsistenciaAlumno[]>(this.apiUrl + "RecuperacionClase/" + idHorario);
    }

}