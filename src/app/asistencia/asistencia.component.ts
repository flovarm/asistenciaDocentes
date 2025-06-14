import { Component } from '@angular/core';
import { TituloComponent } from '../Shared/titulo/titulo.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { AsistComponent } from './asist/asist.component';
import { ReemplazoComponent } from './reemplazo/reemplazo.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-asistencia',
  imports: [
    TituloComponent,
    MatTabsModule,
    MatCardModule,
    AsistComponent,
    ReemplazoComponent,
    RouterModule
  ],
  templateUrl: './asistencia.component.html',
  styleUrl: './asistencia.component.scss'
})
export class AsistenciaComponent {

}
