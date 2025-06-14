import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
    private ipc = (window as any).require?.('electron')?.ipcRenderer;
    private aula: string = '';
  
    async loadAula() {
      this.aula = await this.ipc?.invoke('get-aula');
    }
  
    getAula(): string {
      return this.aula;
    }
}