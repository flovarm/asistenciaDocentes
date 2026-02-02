import { Component, inject, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from "@angular/material/dialog";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

import { CommonModule } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { HorarioService } from "../_services/horario.service";
import {
  CodigoPlataforma,
  CodigoPlataformaDto,
  CodigoPlataformaUpdateDto,
} from "../_models/codigoPlataforma";
import { Profesor } from "../_models/profesor";

export interface CodigoPlataformaDialogData {
  idHorario: number;
  idCurso: number;
  Curso?: string;
  codigoExistente?: CodigoPlataforma;
  esEdicion?: boolean;
}

@Component({
  selector: "app-codigo-plataforma-modal",
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,

    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
  ],
  template: `
    <div class="modal-container">
      <h2 mat-dialog-title class="d-flex align-items-center">
        <mat-icon class="me-2">code</mat-icon>
        {{
          data.esEdicion
            ? "Editar Código de Plataforma"
            : "Agregar Código de Plataforma"
        }}
      </h2>

      <mat-dialog-content class="mat-typography">
        <div class="dialog-subtitle mb-3">
          {{
            data.esEdicion
              ? "Modifica los datos del código de plataforma"
              : "Ingresa los datos del código de plataforma"
          }}
          @if (data.Curso) {
            <br />
            <strong>Curso:</strong> {{ data.Curso }}
          }
        </div>
        <form [formGroup]="codigoForm" class="mt-2">
          <div class="row">
            <div class="col-12">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Código de Plataforma</mat-label>
                <input
                  matInput
                  [placeholder]="getCodigoPlaceholder()"
                  formControlName="codigo"
                  [maxlength]="getCodigoMaxLength()"
                />
                <mat-hint>{{ getCodigoHint() }}</mat-hint>
                @if (
                  codigoForm.get("codigo")?.hasError("required") &&
                  codigoForm.get("codigo")?.touched
                ) {
                  <mat-error>El código es requerido</mat-error>
                }
                @if (
                  codigoForm.get("codigo")?.hasError("invalidFormat") &&
                  codigoForm.get("codigo")?.touched
                ) {
                  <mat-error>{{ getCodigoErrorMessage() }}</mat-error>
                }
              </mat-form-field>
            </div>
          </div>

          @if (showTeacherCode()) {
            <div class="row">
              <div class="col-12">
                <mat-form-field appearance="outline" class="w-100 mt-3">
                  <mat-label>Código de Profesor</mat-label>
                  <input
                    matInput
                    placeholder="A7PA-XAEU-X47"
                    formControlName="codigoTeacher"
                    maxlength="13"
                  />
                  <mat-hint
                    >Código de 11 caracteres separados de 4-4-3 (ej:
                    A7PA-XAEU-X47)</mat-hint
                  >
                  @if (
                    codigoForm
                      .get("codigoTeacher")
                      ?.hasError("invalidFormat") &&
                    codigoForm.get("codigoTeacher")?.touched
                  ) {
                    <mat-error
                      >El código de profesor debe tener el formato XXXX-XXXX-XXX
                      (11 caracteres alfanuméricos separados de
                      4-4-3)</mat-error
                    >
                  }
                </mat-form-field>
              </div>
            </div>
          }

          <!-- <div
            class="info-section mt-3 p-3"
            style="background-color: var(--mat-sys-surface); border-radius: 8px;"
          >
            <h6 class="mb-2">
              <mat-icon
                class="me-1"
                style="font-size: 18px; vertical-align: middle;"
                >info</mat-icon
              >
              Información del Horario
            </h6>
            <p class="mb-1">
              <strong>ID Horario:</strong> {{ data.idHorario }}
            </p>
            <p class="mb-1"><strong>ID Curso:</strong> {{ data.idCurso }}</p>
            @if (data.Curso) {
              <p class="mb-0">
                <strong>Tipo de validación:</strong> {{ getTipoValidacion() }}
              </p>
            }
          </div> -->
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="d-flex justify-content-between">
        <button
          matButton="outlined"
          class="btn-cancelar"
          (click)="onCancel()"
          type="button"
        >
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button
          mat-flat-button
          (click)="onSave()"
          [disabled]="!codigoForm.valid || guardando"
          type="button"
        >
          @if (guardando) {
            <mat-icon class="spinning">refresh</mat-icon>
          } @else {
            <mat-icon>save</mat-icon>
          }
          {{ data.esEdicion ? "Actualizar" : "Guardar" }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .modal-container {
        max-width: 500px;
        width: 100%;
      }

      .w-100 {
        width: 100%;
      }

      .info-section {
        border-left: 4px solid #2196f3;
      }

      .spinning {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .dialog-subtitle {
        color: var(--mat-sys-on-surface-variant);
        font-size: 14px;
      }

      h2[mat-dialog-title] {
        margin-bottom: 1rem;
      }

      .d-flex {
        display: flex;
      }

      .align-items-center {
        align-items: center;
      }

      .justify-content-between {
        justify-content: space-between;
      }

      .me-1,
      .me-2 {
        margin-right: 0.5rem;
      }

      .me-2 {
        margin-right: 1rem;
      }

      .mb-0 {
        margin-bottom: 0;
      }

      .mb-1 {
        margin-bottom: 0.25rem;
      }

      .mb-2 {
        margin-bottom: 0.5rem;
      }

      .mb-3 {
        margin-bottom: 1rem;
      }

      .mt-3 {
        margin-top: 1rem;
      }

      .p-3 {
        padding: 1rem;
      }
    `,
  ],
})
export class CodigoPlataformaModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private horarioService = inject(HorarioService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CodigoPlataformaModalComponent>);
  codigoForm: FormGroup;
  guardando = false;
  profesor: Profesor = JSON.parse(localStorage.getItem("profesor") || "{}");

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CodigoPlataformaDialogData,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const codigoValidators = [Validators.required];
    const teacherValidators: any[] = [];

    // Agregar validador específico según el tipo de Curso
    const formatValidator = this.getCodigoFormatValidator();
    if (formatValidator) {
      codigoValidators.push(formatValidator);
    }

    // Si es curso básico, el código de teacher es requerido con el mismo formato
    if (this.showTeacherCode()) {
      teacherValidators.push(this.basicoFormatValidator());
    }

    this.codigoForm = this.fb.group({
      codigo: [this.data.codigoExistente?.codigo || "", codigoValidators],
      codigoTeacher: [
        this.data.codigoExistente?.codigoTeacher || "",
        teacherValidators,
      ],
    });
  }

  private getCourseType(): string {
    if (!this.data.Curso) return "unknown";

    const curso = this.data.Curso.toLowerCase().replace(/\s+/g, "");

    if (/^basico(0[1-9]|1[0-4])$/.test(curso)) {
      return "basico";
    } else if (/^intermedio/.test(curso)) {
      return "intermedio";
    } else if (/^advance0[1-5]$/.test(curso)) {
      return "advance";
    } else if (/^advanced0[6-8]$/.test(curso)) {
      return "advanced";
    }

    return "unknown";
  }

  private getCodigoFormatValidator(): ValidatorFn | null {
    const courseType = this.getCourseType();

    switch (courseType) {
      case "basico":
        return this.basicoFormatValidator();
      case "intermedio":
      case "advance":
        return this.advanceFormatValidator();
      case "advanced":
        return this.advancedFormatValidator();
      default:
        return null;
    }
  }

  private basicoFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      // Formato: XXXX-XXXX-XXX (11 caracteres alfanuméricos separados de 4-4-3)
      const pattern = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{3}$/;
      if (!pattern.test(control.value)) {
        return { invalidFormat: true };
      }
      return null;
    };
  }

  private advanceFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      // Formato: XXXX-XXXX (8 caracteres alfanuméricos separados de 4-4)
      const pattern = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;
      if (!pattern.test(control.value)) {
        return { invalidFormat: true };
      }
      return null;
    };
  }

  private advancedFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      // Formato: XXXXXXXX (8 caracteres alfanuméricos sin separación)
      const pattern = /^[A-Za-z0-9]{8}$/;
      if (!pattern.test(control.value)) {
        return { invalidFormat: true };
      }
      return null;
    };
  }

  showTeacherCode(): boolean {
    return this.getCourseType() === "basico";
  }

  getCodigoPlaceholder(): string {
    const courseType = this.getCourseType();

    switch (courseType) {
      case "basico":
        return "A7PA-XAEU-X47";
      case "intermedio":
      case "advance":
        return "A7PA-XAEU";
      case "advanced":
        return "A7PAXAEU";
      default:
        return "Ingrese el código de plataforma";
    }
  }

  getCodigoHint(): string {
    const courseType = this.getCourseType();

    switch (courseType) {
      case "basico":
        return "Código de 11 caracteres separados de 4-4-3 (ej: A7PA-XAEU-X47)";
      case "intermedio":
      case "advance":
        return "Código de 8 caracteres separados de 4-4 (ej: A7PA-XAEU)";
      case "advanced":
        return "Código de 8 caracteres sin separación (ej: A7PAXAEU)";
      default:
        return "Código principal de la plataforma virtual";
    }
  }

  getCodigoMaxLength(): number {
    const courseType = this.getCourseType();

    switch (courseType) {
      case "basico":
        return 13; // 11 caracteres + 2 guiones
      case "intermedio":
      case "advance":
        return 9; // 8 caracteres + 1 guión
      case "advanced":
        return 8; // 8 caracteres sin guiones
      default:
        return 100;
    }
  }

  getCodigoErrorMessage(): string {
    const courseType = this.getCourseType();

    switch (courseType) {
      case "basico":
        return "El código debe tener el formato XXXX-XXXX-XXX (11 caracteres alfanuméricos separados de 4-4-3)";
      case "intermedio":
      case "advance":
        return "El código debe tener el formato XXXX-XXXX (8 caracteres alfanuméricos separados de 4-4)";
      case "advanced":
        return "El código debe tener 8 caracteres alfanuméricos sin separación";
      default:
        return "Formato de código inválido";
    }
  }

  getTipoValidacion(): string {
    const courseType = this.getCourseType();

    switch (courseType) {
      case "basico":
        return "Básico (11 caracteres: XXXX-XXXX-XXX + código teacher)";
      case "intermedio":
        return "Intermedio (8 caracteres: XXXX-XXXX)";
      case "advance":
        return "Advance (8 caracteres: XXXX-XXXX)";
      case "advanced":
        return "Advanced (8 caracteres: XXXXXXXX)";
      default:
        return "Estándar";
    }
  }

  onSave(): void {
    if (this.codigoForm.valid && !this.guardando) {
      this.guardando = true;

      const formValue = this.codigoForm.value;

      if (this.data.esEdicion && this.data.codigoExistente) {
        // Actualizar código existente
        const updateDto: CodigoPlataformaUpdateDto = {
          id: this.data.codigoExistente.id,
          idHorario: this.data.idHorario,
          idCurso: this.data.idCurso,
          codigo: formValue.codigo,
          codigoTeacher: formValue.codigoTeacher,
          idUsuarioModificacion: this.profesor.idProfesor,
        };

        this.horarioService.actualizarCodigoPlataforma(updateDto).subscribe({
          next: (response) => {
            this.snackBar.open(
              "Código de plataforma actualizado exitosamente",
              "Cerrar",
              {
                duration: 3000,
                panelClass: ["snack-success"],
              },
            );
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error("Error al actualizar código:", error);
            this.snackBar.open(
              error.error?.message ||
                "Error al actualizar el código de plataforma",
              "Cerrar",
              {
                duration: 5000,
                panelClass: ["snack-error"],
              },
            );
            this.guardando = false;
          },
        });
      } else {
        // Crear nuevo código
        const createDto: CodigoPlataformaDto = {
          idHorario: this.data.idHorario,
          idCurso: this.data.idCurso,
          codigo: formValue.codigo,
          codigoTeacher: formValue.codigoTeacher,
          idUsuarioCreacion: this.profesor.idProfesor,
        };

        this.horarioService.guardarCodigoPlataforma(createDto).subscribe({
          next: (response) => {
            this.snackBar.open(
              "Código de plataforma guardado exitosamente",
              "Cerrar",
              {
                duration: 3000,
                panelClass: ["snack-success"],
              },
            );
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error("Error al guardar código:", error);
            this.snackBar.open(
              error.error?.message ||
                "Error al guardar el código de plataforma",
              "Cerrar",
              {
                duration: 5000,
                panelClass: ["snack-error"],
              },
            );
            this.guardando = false;
          },
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
