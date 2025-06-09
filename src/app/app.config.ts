import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { CalendarModule, DateAdapter, MOMENT } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SchedulerModule } from 'angular-calendar-scheduler';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorInterceptor } from './_interceptor/error.interceptor';
import { jwtInterceptor } from './_interceptor/jwt.interceptor';
import { LoadingInterceptor } from './_interceptor/loading.interceptor';
import { MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
const MY_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
     provideAnimationsAsync(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([ErrorInterceptor,jwtInterceptor , LoadingInterceptor]) ),
    { provide: LOCALE_ID, useValue: 'es-PE' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
      importProvidersFrom(CalendarModule.forRoot({
       provide: DateAdapter,
       useFactory: adapterFactory
      }),
      SchedulerModule.forRoot({locale: 'es-PE' , headerDateFormat: 'daysRange' , logEnabled: true}),
    ),   
    importProvidersFrom(MomentDateAdapter)
  ]
};
