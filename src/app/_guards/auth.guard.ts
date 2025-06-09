import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfesorService } from '../_services/profesor.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(ProfesorService);
  const snack = inject(MatSnackBar);
  const router = inject(Router);
  if (authService.currentUser()){
    return true; 
  }else {
    router.navigateByUrl('/login');
    snack.open('Es necesario iniciar sesión', 'OK', {
      duration: 3000
    });
    return false;
  }
};
