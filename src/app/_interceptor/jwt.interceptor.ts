import { HttpInterceptor, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../_services/auth.service";
import { ProfesorService } from "../_services/profesor.service";

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(ProfesorService);
    if (authService.currentUser()) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${authService.currentUser()?.token}`
            }
        });
    }
    return next(req);
};