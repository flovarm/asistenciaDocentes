import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlumnoService } from '../_services/alumno.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TituloComponent } from '../Shared/titulo/titulo.component';
import { HistorialAcademicoComponent } from "./historial-academico/historial-academico.component";
import { DatosAdicionalesComponent } from './datos-adicionales/datos-adicionales.component';
import { Subject, takeUntil, catchError } from 'rxjs';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-detalle-alumno',
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TituloComponent,
    MatListModule,
    HistorialAcademicoComponent,
    MatButtonModule
],
  templateUrl: './detalle-alumno.component.html',
  styleUrl: './detalle-alumno.component.scss'
})
export class DetalleAlumnoComponent implements OnInit, OnDestroy {
  
  codigoAlumno: string = '';
  alumno: any = null;
  error: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private alumnoService: AlumnoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.codigoAlumno = params['codigo'];
        if (this.codigoAlumno) {
          this.obtenerDetalleAlumno();
        } else {
          this.error = 'No se proporcionó código de alumno';
          this.router.navigate(['/']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  obtenerDetalleAlumno(): void {
    this.error = '';
    
    // Convertir el código de string a number
    const codigo = parseInt(this.codigoAlumno);
    
    if (isNaN(codigo)) {
      this.error = 'Código de alumno inválido';
      return;
    }
    
    this.alumnoService.getAlumnoDetalle(codigo).subscribe({
      next: (data) => {
        this.alumno = data;
      },
      error: (error) => {
        this.error = 'Error al obtener los datos del alumno';
      }
    });
  }

  volver(): void {
    this.location.back();
  }

  volverConEstado(): void {
    this.location.back();
  }

  copiarTelefono(numero: string): void {
    if (numero && numero.trim() !== '' && numero !== 'No especificado') {
      navigator.clipboard.writeText(numero).then(() => {
        this.snackBar.open('Teléfono copiado al portapapeles', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }).catch(() => {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = numero;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        this.snackBar.open('Teléfono copiado al portapapeles', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      });
    }
  }

  /**
   * Verifica si fue registrado en el nuevo sistema
   * Si usuario o usuarioU empiezan con número, fue registrado en el nuevo sistema
   */
  fueRegistradoEnNuevoSistema(): boolean {
    if (!this.alumno?.alumno) return false;
    
    const usuario = this.alumno.alumno.usuario;
    const usuarioU = this.alumno.alumno.usuarioU;
    
    // Si usuario empieza con número, fue registrado en el nuevo sistema
    if (usuario && /^[0-9]/.test(usuario.toString())) return true;
    if (usuarioU && /^[0-9]/.test(usuarioU.toString())) return true;
    
    return false;
  }
}
 