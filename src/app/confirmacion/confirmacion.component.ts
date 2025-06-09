import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirmacion',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle
  ],
  templateUrl: './confirmacion.component.html',
  styleUrl: './confirmacion.component.scss'
})
export class ConfirmacionComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmacionComponent>);
  readonly data = inject<string>(MAT_DIALOG_DATA);

   onNoClick() {
    this.dialogRef.close(true);
  }
}
