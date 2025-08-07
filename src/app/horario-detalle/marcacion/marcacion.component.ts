import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { ProfesorService } from '../../_services/profesor.service';
import { HorarioService } from '../../_services/horario.service';
import { AsistenciaProfesorService } from '../../_services/asistenciaProfesor.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Profesor } from '../../_models/profesor';
import moment from 'moment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TituloComponent } from '../../Shared/titulo/titulo.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AsistComponent } from '../../asistencia/asist/asist.component';

import { ProfesorComponent } from "./profesor/profesor.component";
import { ReemplazoComponent } from './reemplazo/reemplazo.component';

@Component({
  selector: 'app-marcacion',
  imports: [
    MatTabsModule,
    MatCardModule,
  ProfesorComponent,
    MatDialogModule,
    MatButtonModule,
    CommonModule
],
  templateUrl: './marcacion.component.html',
  styleUrl: './marcacion.component.scss'
})
export class MarcacionComponent implements OnInit {
  readonly data = inject<any>(MAT_DIALOG_DATA);
  
  ngOnInit(): void {
  }

  



}

