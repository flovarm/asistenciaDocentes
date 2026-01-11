import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProfesorService } from '../_services/profesor.service';
import { Profesor } from '../_models/profesor';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ConsultaDniService } from '../_services/consultadni.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-actualizar-profesor-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './actualizar-profesor-dialog.component.html'
})
export class ActualizarProfesorDialogComponent {
  form: FormGroup;
private consultaDniService = inject(ConsultaDniService);
private snack = inject(MatSnackBar);
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { profesor: Profesor },
    private dialogRef: MatDialogRef<ActualizarProfesorDialogComponent>,
    private profesorService: ProfesorService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nombreReniec: [{ value: data.profesor.nombreReniec, disabled: true }],
      nroDoc: [data.profesor.nroDoc],
      id_tipodoc: [data.profesor.id_tipodoc, Validators.required],
      apellidos: [data.profesor.apellidos, Validators.required],
      nombres: [data.profesor.nombres],
      direccion: [data.profesor.direccion],
      fechaNacimiento: [{ value: data.profesor.fechaNacimiento, disabled: true }],
      email: [data.profesor.email, [Validators.email]],
      telefono: [data.profesor.telefono],
      celular: [data.profesor.celular]
    });
  }


    consultarDni() {
     const dni = this.form.get('nroDoc')?.value;
      if (!dni || dni.length < 8) {
        return;
      } else {
        this.consultaDniService.consultarDni(dni).subscribe({
          next: (data: any) => {
            // Convertir la fecha de string "dd/MM/yyyy" a "yyyy-MM-dd"
            let fechaNacimiento = '';
            if (data.resultado.fecha_nacimiento) {
              const fechaParts = data.resultado.fecha_nacimiento.split('/');
              if (fechaParts.length === 3) {
                const dia = fechaParts[0].padStart(2, '0');
                const mes = fechaParts[1].padStart(2, '0');
                const año = fechaParts[2];
                fechaNacimiento = `${año}-${mes}-${dia}`; // formato yyyy-MM-dd
              }
            }
            this.form.patchValue({
              nombreReniec: (data.resultado.apellido_paterno + ' ' +  data.resultado.apellido_materno + ' ' +  data.resultado.nombres) || '',
              fechaNacimiento: fechaNacimiento
            });
            this.form.get('nombreReniec')?.disable();
            this.form.get('fechaNacimiento')?.disable();
          },
        });
      }
    }

  guardar() {
    if (this.form.invalid) return;
    const profesorActualizado: Profesor = {
      ...this.data.profesor,
      ...this.form.getRawValue() // <-- incluye campos deshabilitados
    };
    this.profesorService.actualizarProfesor(profesorActualizado.idProfesor, profesorActualizado)
      .subscribe({
        next: (profesorActualizadoResp) => {
          this.snack.open('Datos actualizados correctamente', 'Cerrar', { duration: 3000 , panelClass: ['snack-success']});
          // this.mensajeActualizacion = 'Datos actualizados correctamente';
          setTimeout(() => this.dialogRef.close(profesorActualizadoResp), 1000);
        },
        error: () => {
           this.snack.open('Ocurrio un error al actualizar', 'Cerrar', { duration: 3000 , panelClass: ['snack-error']});
        }
      });
  }

  cancelar() {
    this.dialogRef.close();
  }
}

