import { Component, inject } from '@angular/core';
import { Profesor } from '../_models/profesor';
import { ProfesorService } from '../_services/profesor.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bienvenido',
  imports: [
    MatCardModule,
    CommonModule
  ],
  templateUrl: './bienvenido.component.html',
  styleUrl: './bienvenido.component.scss'
})
export class BienvenidoComponent {
  usuarioService = inject(ProfesorService);
  usuario : Profesor = JSON.parse(localStorage.getItem('profesor'));
  usuarioLogeado: Profesor;
  ngOnInit(): void {
    this.obtenerUsuario();
  }

  obtenerUsuario() {
    this.usuarioService.obtenerProfesor(this.usuario.idProfesor).subscribe((result: any) => {
      this.usuarioLogeado =  result;
    });
  }
}
