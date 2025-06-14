import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { CalendarSchedulerEventAction } from "angular-calendar-scheduler";
import { map } from "rxjs";

@Injectable({
    providedIn: 'root'
})export class HorarioService{
    http = inject(HttpClient);
    apiUrl = environment.apiUrl + 'Horario/';

    obtenerTurno(idProfesor: number) {
        return this.http.get<any[]>(this.apiUrl + 'HorarioDetalle/' + idProfesor);
    }
    obtenerReemplazo(idProfesor: number) {
        return this.http.get<any[]>(this.apiUrl + 'Reemplazo/' + idProfesor);
    }

    cerrarActa(idHorario:number) {
        return this.http.patch(this.apiUrl + 'CerrarActa/' + idHorario, null);
    }

    obtenerHorarioDetalleByDocente(idHorario: number, idDocente: number) {
        return this.http.get<any[]>(this.apiUrl + `HorarioDetalleByDocente/${idHorario}/${idDocente}`);
    }

    obtenerHorarioDetalleByDocenteReemplazo(idHorario: number, idDocenteReemplazo: number) {
        return this.http.get<any[]>(this.apiUrl + `HorarioDetalleByDocenteReemplazo/${idHorario}/${idDocenteReemplazo}`);
    }

    obtenerHorario(actions: CalendarSchedulerEventAction[] ,idProfesor: number) {
        debugger;
        return this.http.get<any[]>(this.apiUrl + 'ObtenerHorarioDocente/' + idProfesor).pipe(
            map(events => events.map(event => ({
                id: event.id,
                start: new Date(event.start),
                end: new Date(event.end),
                title: event.title,
                content: event.content,
                color: {
                    primary: event.color, 
                    secondary: event.color
                },
                isClickable: true,
                isDisabled: false
            })))
          );
        }

 
}
        
