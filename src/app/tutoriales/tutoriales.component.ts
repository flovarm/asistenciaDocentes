import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TituloComponent } from '../Shared/titulo/titulo.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-tutoriales',
  imports: [
    TituloComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './tutoriales.component.html',
  styleUrl: './tutoriales.component.scss'
})
export class TutorialesComponent {
  private sanitizer = inject(DomSanitizer);
  busquedaTexto: string = '';
  tutoriales = [
  {
    id: 1,
    nombre: "Encender pantalla interactiva",
    busqueda: ["pantalla", "monitor", "ops", "prender", "interactiva", "equipo", "encender", "cpu", "apagar", "no puedo eencender" , "no puedo prender"],
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    descripcion: "Como encender y apagar la pantalla interactiva y su CPU OPS."
  },
  {
    id: 2,
    nombre: "Uso de la pizarra open Board",
    busqueda: ["pizarra", "panel tactil", "borrar", "recortes", "imagen", "dibujos", "formas", "captura"],
    url: "https://www.youtube.com/watch?v=AaGBJHHh1P8",
    descripcion: ""
  },
  {
    id: 3,
    nombre: "Problema de audio y la camara en teams",
    busqueda: ["teams", "audio", "camara", "microfono","alumnos no me escuchan", "alumnos no me ven" , "filtros" , "segundo plano" , "clases virtuales" , "virtual" , "fondo de pantalla"],
    url: "https://www.youtube.com/watch?v=poLwD2H9qQ8",
    descripcion: "Fondo de pantalla y filtros en teams , audio y camara."
  },
  {
    id: 4,
    nombre: "Resolución de pantalla en windows 11",
    busqueda: ["pantalla descuadrada", "resolución de pantalla", "resolucion de pantalla", "escritorio descuadrado", "pantalla muy grande", "pantalla pequeña", "el tocuh no funciona" , "no puedo ajustar la pantalla" , "no aparece la barra de tareaas" , "el tactil no funciona" ],
    url: "https://www.youtube.com/watch?v=10AR_DExqOM",
    descripcion: "Cómo ajustar la resolución de pantalla en Windows 11 y solucionar problemas comunes."
  }
  
];
  tutorialesFiltrados = this.tutoriales;


  filtrarTutoriales(): void {
    if (!this.busquedaTexto.trim()) {
      this.tutorialesFiltrados = this.tutoriales;
      return;
    }

    const textoBusqueda = this.busquedaTexto.toLowerCase();
    this.tutorialesFiltrados = this.tutoriales.filter(tutorial =>
      tutorial.nombre.toLowerCase().includes(textoBusqueda) ||
      tutorial.descripcion.toLowerCase().includes(textoBusqueda) ||
      tutorial.busqueda.some(termino => termino.toLowerCase().includes(textoBusqueda))
    );
  }

  /**
   * Convierte una URL de YouTube a formato embed y la sanitiza
   */
  getEmbedUrl(url: string): SafeResourceUrl {
    let videoId = '';
    
    // Extraer el ID del video de diferentes formatos de URL de YouTube
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
