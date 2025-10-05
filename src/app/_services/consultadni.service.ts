import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})export class ConsultaDniService {
    private http = inject(HttpClient);
    private apiUrl = 'https://api.perudevs.com/api/v1/dni/complete?document=';
    private token = 'cGVydWRldnMucHJvZHVjdGlvbi5maXRjb2RlcnMuNjUyMDQxNjFiMzEyMDcwMDhlODA5MmNm';
     consultarDni(dni: string) {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
    return this.http.get(`${this.apiUrl}${dni}&key=${this.token}`, { headers });
  }
}