import { HttpClient } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";

import { map } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment.development";
import { User } from "../_models/User";


@Injectable({   providedIn: 'root' })
export class AuthService {
   apiUrl = environment.apiUrl + 'Account/';
   private http = inject(HttpClient);
   currentUser = signal<User | null>(null);
   roles = computed(() => {
    const user = this.currentUser();
    if (user && user.token){
      const role = JSON.parse(atob(user.token.split('.')[1])).role
      return Array.isArray(role) ? role : [role];
    }
    return [];
   })
   private router = inject(Router);
  constructor() {}

  login(model: any) {
    return this.http.post<User>(this.apiUrl + 'Login', model).pipe(
      map((response: any) => {
        const user = response; 
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser.set(user);
          this.router.navigateByUrl('/');
        }
      }));
  }

  //metodo para obtener los datos del usuario 

  getUser(username: string){
    return this.http.get<User>(this.apiUrl + 'Usuario/' + username);
  }

  // Método para verificar si el usuario tiene al menos uno de los roles permitidos
  hasRole(allowedRoles: string[]): boolean {
    const userRoles = this.roles();
    return allowedRoles.some((role) => userRoles.includes(role));
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigateByUrl('/login');
  }
}