import { Injectable } from '@angular/core';

declare global {
  interface Window {
    require: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private ipcRenderer: any;
  private isElectron: boolean = false;

  constructor() {
    // Verificar si estamos en Electron
    if (this.isRunningInElectron()) {
      this.isElectron = true;
      this.ipcRenderer = window.require('electron').ipcRenderer;
    }
  }

  private isRunningInElectron(): boolean {
    return typeof window !== 'undefined' && window.require;
  }

  /**
   * Verificar si las notificaciones están soportadas en el sistema
   */
  async isNotificationSupported(): Promise<boolean> {
    if (!this.isElectron) {
      return 'Notification' in window;
    }
    
    try {
      return await this.ipcRenderer.invoke('is-notification-supported');
    } catch (error) {
      console.error('Error verificando soporte de notificaciones:', error);
      return false;
    }
  }

  /**
   * Mostrar notificación nativa del sistema
   */
  async showNativeNotification(title: string, body: string, tag?: string): Promise<boolean> {
    if (!this.isElectron) {
      // Fallback para navegador
      return this.showBrowserNotification(title, body);
    }

    try {
      await this.ipcRenderer.invoke('show-notification', { title, body, tag });
      return true;
    } catch (error) {
      console.error('Error mostrando notificación nativa:', error);
      return false;
    }
  }

  /**
   * Fallback para notificaciones en navegador
   */
  private async showBrowserNotification(title: string, body: string): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, { body });
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body });
        return true;
      }
    }

    return false;
  }

  /**
   * Escuchar eventos desde el proceso principal
   */
  onNotificationClicked(callback: (tag: string) => void): void {
    if (this.isElectron) {
      this.ipcRenderer.on('notification-clicked', (event: any, tag: string) => {
        callback(tag);
      });
    }
  }

  /**
   * Remover listeners
   */
  removeAllListeners(channel: string): void {
    if (this.isElectron) {
      this.ipcRenderer.removeAllListeners(channel);
    }
  }

  /**
   * Verificar si estamos ejecutando en Electron
   */
  get isElectronApp(): boolean {
    return this.isElectron;
  }
}