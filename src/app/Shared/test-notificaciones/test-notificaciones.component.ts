import { Component, inject } from '@angular/core';
import { NotificacionService } from '../../_services/notificacion.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-notificaciones',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    CommonModule
  ],
  template: `
    <mat-card class="notif-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>notifications</mat-icon>
          Prueba de Notificaciones Nativas
        </mat-card-title>
        <mat-card-subtitle>
          Estado: {{ infoEntorno.isElectron ? 'Electron' : 'Navegador' }} - 
          Nativas: {{ infoEntorno.notificacionesNativas ? 'Habilitadas' : 'No disponibles' }}
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="botones-prueba">
          <button 
            mat-raised-button 
            color="primary" 
            (click)="probarNotificacionNativa()"
            [disabled]="!infoEntorno.notificacionesNativas">
            <mat-icon>desktop_windows</mat-icon>
            Probar Notificación Nativa
          </button>
          
          <button 
            mat-raised-button 
            color="accent" 
            (click)="probarNotificacionSnackBar()">
            <mat-icon>info</mat-icon>
            Probar SnackBar
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .notif-card {
      margin: 16px 0;
      max-width: 500px;
    }
    
    .botones-prueba {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .botones-prueba button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class TestNotificacionesComponent {
  private notificacionService = inject(NotificacionService);
  
  get infoEntorno() {
    return this.notificacionService.infoEntorno;
  }

  async probarNotificacionNativa() {
    const exito = await this.notificacionService.enviarNotificacionNativa(
      'Prueba de Notificación',
      'Esta es una notificación nativa de Windows desde tu aplicación Angular!',
      'test-notification'
    );
    
    if (!exito) {
      console.warn('No se pudo mostrar la notificación nativa');
    }
  }

  probarNotificacionSnackBar() {
    // Simular una notificación como si viniera de SignalR
    const mensajePrueba = {
      id: Date.now(),
      usuario: 'Sistema de Prueba',
      mensaje: 'Esta es una notificación de prueba del sistema',
      fechaRegistro: new Date().toISOString()
    };
    
    // Agregar a la lista de notificaciones
    this.notificacionService.listaNotificaciones.update(notifs => [mensajePrueba, ...notifs]);
    this.notificacionService.noLeidas.update(count => count + 1);
  }
}