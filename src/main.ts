import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as _moment from 'moment';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
_moment.locale('es');
registerLocaleData(localeEsPe, 'es-PE');
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
