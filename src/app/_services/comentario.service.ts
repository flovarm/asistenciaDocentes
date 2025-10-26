import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';




@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private baseUrl = `${environment.apiUrl}Comentario`;

  constructor(private http: HttpClient) { }

  getComentarioById(id: number) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  listarComentarios(idAlumno: number) {
    return this.http.get(`${this.baseUrl}/alumno/${idAlumno}`);
  }

  createComentario(model: any) {
    return this.http.post(this.baseUrl, model);
  }

  updateComentario(id: number, model: any) {
    return this.http.patch(`${this.baseUrl}/${id}`, model);
  }
}
