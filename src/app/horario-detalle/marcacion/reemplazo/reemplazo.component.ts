import { Component, inject, Input } from '@angular/core';
import moment from 'moment';
import { ProfesorService } from '../../../_services/profesor.service';
import { HorarioService } from '../../../_services/horario.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AsistenciaProfesorService } from '../../../_services/asistenciaProfesor.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Profesor } from '../../../_models/profesor';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CalendarSchedulerEvent } from 'angular-calendar-scheduler';
import { ConfigService } from '../../../_services/config.service';

@Component({
  selector: 'app-reemplazo',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './reemplazo.component.html',
  styleUrl: './reemplazo.component.scss'
})
export class ReemplazoComponent {
@Input() data: CalendarSchedulerEvent;
 profesorService = inject(ProfesorService);
  horarioService = inject(HorarioService);
  asistenciaDocenteService = inject(AsistenciaProfesorService);
   aulaService  = inject(ConfigService);
  snakBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  aula = 'Intranet Docentes';
  profesor: Profesor = JSON.parse(localStorage.getItem('profesor')!);
  asistenciaForm!: FormGroup;
  mostrarrefresh = true;
  ngOnInit(): void {
    this.initializeForm();
    this.obtenerHorario();
  }
  
  async getAula() {
    await this.aulaService.loadAula();
    this.aula = this.aulaService.getAula();
    this.initializeForm();
  }
  
  initializeForm() {
    this.asistenciaForm = this.fb.group({
      idHorarioDetalle: [0],
      aula: [{ value: '', disabled: true }],
      curso: [{ value: '', disabled: true }],
      turno: [{ value: '', disabled: true }],
      idCurso: 0,
      idTurno: 0,
      idPeriodo: 0,
      idHorario: 0,
      idAula: 0,
      fechaInicio: new Date(),
      fechaFin: new Date(),
      idAsistenciaProfesor: 0,
      horaEntradaReemplazo: [],
      horaSalidaReemplazo: [],
      idProfesor: [this.profesor.idProfesor],
      profesor: [{ value: '', disabled: true }],
      descripcion: [{ value: '', disabled: true }],
      insertApplicationName: this.aula == null ? 'Intranet Docentes' : this.aula ,
      horaEntrada: [],
      horaSalida: [],
      modalidad: ''
    })
  }

  obtenerHorario() {
    this.mostrarrefresh = true;
      this.horarioService.obtenerHorarioDetalleByDocenteReemplazo(+this.data.id, this.profesor.idProfesor).subscribe({
        next: (datos) => {
         if (datos.length > 0) {
           this.mostrarrefresh = false; 
           this.asistenciaForm.patchValue({
             idHorarioDetalle: datos[0].id,
             aula: datos[0].aula,
             curso: datos[0].curso,
             turno: datos[0].turno,
             idCurso: datos[0].idCurso,
             idTurno: datos[0].idTurno,
             idHorario: datos[0].idHorario,
             idPeriodo: datos[0].idPeriodo,
             idAula: datos[0].idAula,
             fechaInicio: datos[0].fechaInicio,          
             horaEntradaReemplazo: datos[0].horaEntradaReemplazo,
             horaSalidaReemplazo: datos[0].horaSalidaReemplazo,
             fechaFin: datos[0].fechaFinal,
             profesor: datos[0].profesor,
             descripcion: moment(datos[0].fechaInicio).format('hh:mm') + ' - ' + moment(datos[0].fechaFinal).format('hh:mm'),
             idAsistenciaProfesor: datos[0].idAsistenciaProfesor,
             horaEntrada: datos[0].horaEntrada,
             horaSalida: datos[0].horaSalida,
             modalidad: datos[0].modalidad
           });
         }
        },
        error: (err) => {
           console.log(err);
        }
      });
    
  }
  

  entrada() {
    let objentrada = Object.assign({} , this.asistenciaForm.getRawValue()); 
    // if (objentrada.modalidad == 'Presencial')
    // {
    //   this.snakBar.open('Es un horario presencial debes hacerlo desde la aplicación de escritorio' , 'OK' ,  {
    //      verticalPosition: 'top',
    //     panelClass: ['snack-error']
    //   });
    // }else {
      this.asistenciaDocenteService.EntradaReemplazo(objentrada).subscribe(() => {
        this.mostrarrefresh = false;
        this.obtenerHorario();
      })
    //}
  }

  salida() {
    let objsalida = Object.assign({} , this.asistenciaForm.getRawValue());
     if (objsalida.modalidad == 'Presencial') {
       this.snakBar.open('Es un horario presencial debes hacerlo desde la aplicación de escritorio' , 'OK' ,  {
          verticalPosition: 'top',
         panelClass: ['snack-error']
       });
    }else {
        this.asistenciaDocenteService.SalidaReemplazo(objsalida).subscribe(() => {
          this.mostrarrefresh = false;
          this.obtenerHorario();
        })
    }
  }

  isCurrentEvent(event: CalendarSchedulerEvent): boolean {
  const now = new Date();
  const start = new Date(new Date(event.start).getTime() - 5 * 60 * 1000); // 5 minutos antes del inicio
  const end = new Date(new Date(event.end).getTime() + 20 * 60 * 1000);   // 20 minutos después del fin
  return start <= now && now <= end;
}




}
