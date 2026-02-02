import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import * as signalR from '@microsoft/signalr';
import { User } from "../_models/User";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs";
import { DetalleNotificacionComponent } from "../Shared/notificaciones/detalle-notificacion/detalle-notificacion.component";
import { ElectronService } from "./electron.service";
@Injectable({
    providedIn: 'root'
})
export class NotificacionService {
    private hubUrl = environment.hubUrl;
    private apiUrl = environment.apiUrl + 'Notificacion/';
    private http = inject(HttpClient);
    noLeidas = signal<number>(0);
    listaNotificaciones = signal<any[]>([]);
    private SnackBar  = inject(MatSnackBar);
    private dialog = inject(MatDialog);
    private electronService = inject(ElectronService);
    private hubConnection!: signalR.HubConnection;
    private snackBarActivo: MatSnackBarRef<any> | null = null;
    private notificacionesNativasHabilitadas = false;
    user: User = JSON.parse(localStorage.getItem('profesor') || '{}');

    constructor() {
        this.inicializarNotificacionesNativas();
    }

    iniciarConexion() {
        if(!this.hubConnection || this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
            this.hubConnection = new signalR.HubConnectionBuilder()
                .withUrl(this.hubUrl + 'notificacion', {
                    accessTokenFactory: () => this.user.token
                })
                .withAutomaticReconnect()
                .build();
        
            this.hubConnection
                .start()
                .then(() => {
                    console.log('Conexión SignalR establecida');
                    this.mostrarNotificacion();
                    // Verificar notificaciones nativas después de establecer conexión
                    if (!this.notificacionesNativasHabilitadas) {
                        this.inicializarNotificacionesNativas();
                    }
                })
                .catch(err => console.log('Error al conectar SignalR:', err));

             this.hubConnection.onreconnected(() => {
             this.mostrarNotificacion();
      });
    }
}

 private async mostrarNotificacion() {
        this.hubConnection.off('EnviarNotificacion');
        this.hubConnection.on('EnviarNotificacion', async (mensaje: any) => {
            this.listaNotificaciones.update(notifs => [mensaje, ...notifs]);
            
            const titulo = `Nuevo mensaje de ${mensaje.usuario}`;
            const cuerpo = mensaje.mensaje || 'Tienes un nuevo mensaje';
            const tag = `notificacion-${mensaje.id}`;
            
            // Intentar mostrar notificación nativa
            let notificacionMostrada = false;
            if (this.notificacionesNativasHabilitadas) {
                notificacionMostrada = await this.electronService.showNativeNotification(
                    titulo,
                    cuerpo,
                    tag
                );
            }
            
            // Mostrar SnackBar como fallback o complemento
            if (!notificacionMostrada || !this.electronService.isElectronApp) {
                this.snackBarActivo = this.SnackBar.open(titulo, 'VER MENSAJE', {
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    panelClass: ['snack-success']
                });
                
                this.snackBarActivo.onAction().subscribe(() => {
                    this.mostrarDetalleNotificacion(mensaje);
                });
            }
            
            this.noLeidas.set(this.noLeidas() + 1);
        });
    }

    private async inicializarNotificacionesNativas() {
        try {
            this.notificacionesNativasHabilitadas = await this.electronService.isNotificationSupported();
            
            // Configurar listener para clicks en notificaciones nativas
            this.electronService.onNotificationClicked((tag: string) => {
                // Extraer ID de la notificación del tag
                const notificationId = tag.replace('notificacion-', '');
                const notificacion = this.listaNotificaciones().find(n => n.id.toString() === notificationId);
                
                if (notificacion) {
                    this.mostrarDetalleNotificacion(notificacion);
                }
            });
            
        } catch (error) {
            console.error('Error inicializando notificaciones nativas:', error);
            this.notificacionesNativasHabilitadas = false;
        }
    }

    private mostrarDetalleNotificacion(mensaje: any) {
        this.dialog.open(DetalleNotificacionComponent, {
            width: '500px',
            data: mensaje,
            disableClose: true
        }).afterClosed().subscribe(() => {
            this.snackBarActivo = null;
        });
    }

    listarNotificacionDocente(idDocente: number) {
        return this.http.get(this.apiUrl + 'docente/' + idDocente).pipe(
            map((response: any) => {
                this.noLeidas.set(response[0].noLeidas);
                this.listaNotificaciones.set(response);
                return this.listaNotificaciones();
            })
        );
    }

    guardarNotificacionLeida(model: any) {
        return this.http.post(this.apiUrl + 'Detalle', model);
    }

    marcarComoLeida(notificacionId: any) {
        // Actualizar la notificación en la lista como leída
        this.listaNotificaciones.update(notificaciones => 
            notificaciones.map(notif => 
                notif.id === notificacionId 
                    ? { ...notif, leido: true }
                    : notif
            )
        );
        
        // Reducir contador de no leídas
        this.noLeidas.update(count => Math.max(0, count - 1));
    }

    cerrarSnackBarActivo() {
        if (this.snackBarActivo) {
            this.snackBarActivo.dismiss();
            this.snackBarActivo = null;
        }
    }

    /**
     * Enviar notificación nativa manual
     */
    async enviarNotificacionNativa(titulo: string, mensaje: string, tag?: string): Promise<boolean> {
        if (this.notificacionesNativasHabilitadas) {
            return await this.electronService.showNativeNotification(titulo, mensaje, tag);
        }
        return false;
    }

    /**
     * Verificar si las notificaciones nativas están habilitadas
     */
    get notificacionesNativasDisponibles(): boolean {
        return this.notificacionesNativasHabilitadas;
    }

    /**
     * Obtener información sobre el entorno de ejecución
     */
    get infoEntorno() {
        return {
            isElectron: this.electronService.isElectronApp,
            notificacionesNativas: this.notificacionesNativasHabilitadas,
            snackBarActivo: !!this.snackBarActivo
        };
    }

    /**
     * Limpiar recursos al destruir el servicio
     */
    destruir() {
        this.electronService.removeAllListeners('notification-clicked');
        this.cerrarSnackBarActivo();
    }
}