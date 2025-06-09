import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AuthService } from "../_services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";

export const roleGuard: CanActivateFn = (route , state) => {
    const authService = inject(AuthService);
    const snackBar = inject(MatSnackBar);
    const allowedRoles = route.data['roles'] as Array<string>;
    if (authService.hasRole(allowedRoles)){
        return true;
    }else {
        snackBar.open('Permiso denegados' , 'X' , {
            duration: 5000,
            panelClass: ['error']
        })
        return false;
    }

} 