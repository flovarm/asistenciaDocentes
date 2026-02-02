import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment.development";
import { ArchivoAcademico } from "../_models/archivoAcademico";

@Injectable({
  providedIn: "root",
})
export class ArchivoAcademicoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + "ArchivoAcademico/";

  // GET: Listar archivos académicos por estado
  listarArchivosAcademicos(estado: boolean): Observable<ArchivoAcademico[]> {
    return this.http.get<ArchivoAcademico[]>(
      `${this.apiUrl}ListarArchivosAcademicos/${estado}`,
    );
  }
}
