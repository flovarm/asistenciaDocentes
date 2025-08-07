import { Injectable } from "@angular/core";
import * as XLSX from 'xlsx';
@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {
    exportarExcel(datos: any[], nombreArchivo: string = 'reporte.xlsx') {
    // Crea una hoja de cálculo a partir de los datos
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);
    // Crea un libro de trabajo y agrega la hoja
    const workbook: XLSX.WorkBook = { Sheets: { 'Datos': worksheet }, SheetNames: ['Datos'] };
    // Genera el archivo Excel y lo descarga
    XLSX.writeFile(workbook, nombreArchivo);
  }

  importarExcel(archivo: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Tomar la primera hoja
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsArrayBuffer(archivo);
    });
  }
}