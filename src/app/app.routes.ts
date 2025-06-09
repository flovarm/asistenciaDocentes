import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { BienvenidoComponent } from './bienvenido/bienvenido.component';
import { NotasComponent } from './notas/notas.component';
import { AsistenciaComponent } from './asistencia/asistencia.component';
import { AsistenciaAlumnosComponent } from './asistencia-alumnos/asistencia-alumnos.component';
import { authGuard } from './_guards/auth.guard';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                data: {
                    'icon': 'assignment_turned_in', 
                },
                component: BienvenidoComponent
            },
            {
                path: 'Asistencia',
                title: 'Asistencia',
                data: {
                    'icon': 'fingerprint', 
                },
                component: AsistenciaComponent
            },
            {
                path: 'Notas',
                title: 'Notas',
                data: {
                    'icon': 'edit_note', 
                },
                component: NotasComponent
            },
            {
                path: 'AsistenciaAlumnos',
                title: 'Asistencia de Alumnos',
                data: {
                    'icon': 'lists', 
                },
                component: AsistenciaAlumnosComponent
            }
        ]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    { path: '', redirectTo: '', pathMatch: 'full' },

];
