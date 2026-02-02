import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoRelativo',
  standalone: true
})
export class TiempoRelativoPipe implements PipeTransform {

  transform(value: string | Date): string {
    if (!value) return '';
    
    const fecha = new Date(value);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    
    // Convertir a segundos
    const segundos = Math.floor(diferencia / 1000);
    
    if (segundos < 60) {
      return 'Hace un momento';
    }
    
    // Convertir a minutos
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) {
      return minutos === 1 ? 'Hace 1 minuto' : `Hace ${minutos} minutos`;
    }
    
    // Convertir a horas
    const horas = Math.floor(minutos / 60);
    if (horas < 24) {
      return horas === 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
    }
    
    // Convertir a días
    const dias = Math.floor(horas / 24);
    if (dias < 7) {
      return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
    }
    
    // Convertir a semanas
    const semanas = Math.floor(dias / 7);
    if (semanas < 4) {
      return semanas === 1 ? 'Hace 1 semana' : `Hace ${semanas} semanas`;
    }
    
    // Convertir a meses
    const meses = Math.floor(dias / 30);
    if (meses < 12) {
      return meses === 1 ? 'Hace 1 mes' : `Hace ${meses} meses`;
    }
    
    // Convertir a años
    const años = Math.floor(dias / 365);
    return años === 1 ? 'Hace 1 año' : `Hace ${años} años`;
  }
}