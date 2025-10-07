import { Component } from '@angular/core';
import { TituloComponent } from '../Shared/titulo/titulo.component';
import { MatCard, MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-agente-virtual',
  imports: [
    TituloComponent,
    MatCardModule
  ],
  templateUrl: './agente-virtual.component.html',
  styleUrl: './agente-virtual.component.scss'
})
export class AgenteVirtualComponent {

}
