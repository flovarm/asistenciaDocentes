import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NotificacionService } from '../../../_services/notificacion.service';

@Component({
  selector: 'app-detalle-notificacion',
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './detalle-notificacion.component.html',
  styleUrl: './detalle-notificacion.component.scss'
})
export class DetalleNotificacionComponent implements OnInit{
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<DetalleNotificacionComponent>);
  private notifiacionService = inject(NotificacionService);
  user: any = JSON.parse(localStorage.getItem('profesor') || '{}');
  ngOnInit(): void {
    if (!this.data.leido) {
      this.guardarNotificacion();
    }
  }
  cerrar() {
    this.dialogRef.close();
  }

  guardarNotificacion() {
    this.data.docenteId = this.user.idProfesor;
    this.notifiacionService.guardarNotificacionLeida(this.data).subscribe(() => {
      // Marcar como leída en la lista local inmediatamente
      this.notifiacionService.marcarComoLeida(this.data.id);
      // Cerrar SnackBar si está activo
      this.notifiacionService.cerrarSnackBarActivo();
      // Marcar como leída localmente para evitar actualizaciones duplicadas
      this.data.leido = true;
    });
  }
}
