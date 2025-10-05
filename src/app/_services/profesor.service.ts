import { inject, Injectable, signal } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Profesor } from "../_models/profesor";
import { Router } from "@angular/router";
import { map } from "rxjs";
import { environment } from "../../environments/environment.development";


@Injectable({providedIn: "root"})
export class ProfesorService {
    apiUrl = environment.apiUrl + 'Profesor/'
    private http = inject(HttpClient);
    currentUser = signal<Profesor | null>(null);
    private router = inject(Router);

    login(model: any) {
        return this.http.post<Profesor>(this.apiUrl , model).pipe(
          map((response: any) => {
            const user = response; 
            if (user) {
              localStorage.setItem('profesor', JSON.stringify(user));
              this.currentUser.set(user);
              this.router.navigateByUrl('/');
            }
          }));
      }

      logout() {
        localStorage.removeItem('profesor');
        this.currentUser.set(null);
        this.router.navigateByUrl('/login');
      }


      obtenerProfesor(id: number){
        return this.http.get(this.apiUrl + id);
      }

      actualizarProfesor(id: number, profesor: Profesor) {
        return this.http.put<Profesor>(this.apiUrl + id, profesor);
      }
}