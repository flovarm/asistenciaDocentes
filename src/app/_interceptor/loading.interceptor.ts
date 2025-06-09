import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../_services/loading.service';


export const LoadingInterceptor:  HttpInterceptorFn = (req, next) => {
   const loadingService = inject(LoadingService);
    loadingService.show();

    return next(req).pipe(
      finalize(() => loadingService.hide())
    );
  }
