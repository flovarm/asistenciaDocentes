import { Inject, inject, Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
const router = inject(Router);    
const snackBar = inject(MatSnackBar);    
  
      return next(req).pipe(
      catchError(error => {
        if (error) {
          switch (error.status) {
            case 400:
                if (error.error.errors) {
                    const modalStateErrors = [];
                    for (const key in error.error.errors) {
                        if (error.error.errors[key]) {
                            modalStateErrors.push(error.error.errors[key]);
                        }
                    }
                    
                    throw modalStateErrors.flat();
                } else {
                    snackBar.open(error.error , 'X' , {
                        panelClass: ['snack-error'],
                        duration: 5000
                    }
                    );
              }
              break;
            case 401:
              router.navigateByUrl('/login'); 
              break;
            case 404:
              snackBar.open('Error interno del servidor' , 'X' , {
                panelClass: ['snack-error'],
                duration: 5000
            });
              break;
            case 500:
                snackBar.open('Error interno del servidor' , 'X' , {
                    panelClass: ['snack-error'],
                    duration: 5000
                });
              break;
            default:
                snackBar.open('Ocurrio un error por favor vuelva a intentarlo' , 'X' , {
                   panelClass: ['snack-error'],
                   duration: 5000
                });
              break;
          }
        }
        throw error;
      })
    );
  }
