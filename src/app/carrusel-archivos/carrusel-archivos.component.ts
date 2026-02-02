import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ArchivoAcademicoService } from "../_services/archivoAcademico.service";
import { ArchivoAcademico } from "../_models/archivoAcademico";

@Component({
  selector: "app-carrusel-archivos",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="carrusel-container">
      <h2 class="carrusel-title">Archivos Académicos</h2>

      @if (archivos.length > 0) {
        <div class="carrusel-wrapper">
          <button
            class="nav-btn prev-btn"
            (click)="anterior()"
            [disabled]="currentIndex === 0"
          >
            &#8249;
          </button>

          <div class="carrusel-content">
            @for (archivo of archivosVisibles; track archivo.id) {
              <div class="archivo-card">
                <div class="archivo-info">
                  <h3 class="archivo-nombre">{{ archivo.nombre }}</h3>
                  <p class="archivo-descripcion">{{ archivo.descripcion }}</p>
                  <small class="archivo-fecha">
                    Creado: {{ formatearFecha(archivo.fechaCreacion) }}
                  </small>
                </div>
                <div class="archivo-acciones">
                  <button class="btn-ver" (click)="verArchivo(archivo)">
                    <i class="icon">📄</i>
                    Ver PDF
                  </button>
                </div>
              </div>
            }
          </div>

          <button
            class="nav-btn next-btn"
            (click)="siguiente()"
            [disabled]="currentIndex >= archivos.length - itemsPorPagina"
          >
            &#8250;
          </button>
        </div>

        @if (archivos.length > itemsPorPagina) {
          <div class="indicadores">
            @for (dot of dots; track $index) {
              <span
                class="indicador"
                [class.active]="$index === currentPage"
                (click)="irAPagina($index)"
              >
              </span>
            }
          </div>
        }
      } @else {
        <div class="no-archivos">
          <p>No hay archivos académicos disponibles</p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .carrusel-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .carrusel-title {
        text-align: center;
        color: #333;
        margin-bottom: 30px;
        font-size: 2rem;
        font-weight: 600;
      }

      .carrusel-wrapper {
        display: flex;
        align-items: center;
        position: relative;
        gap: 15px;
      }

      .nav-btn {
        background: #007bff;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
      }

      .nav-btn:hover:not(:disabled) {
        background: #0056b3;
        transform: scale(1.1);
      }

      .nav-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
      }

      .carrusel-content {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        min-height: 200px;
      }

      .archivo-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
        border: 1px solid #e9ecef;
      }

      .archivo-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .archivo-info {
        margin-bottom: 15px;
      }

      .archivo-nombre {
        color: #333;
        margin: 0 0 10px 0;
        font-size: 1.2rem;
        font-weight: 600;
        line-height: 1.4;
      }

      .archivo-descripcion {
        color: #666;
        margin: 0 0 10px 0;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .archivo-fecha {
        color: #888;
        font-size: 0.85rem;
      }

      .archivo-acciones {
        display: flex;
        justify-content: center;
      }

      .btn-ver {
        background: #28a745;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.3s ease;
        font-weight: 500;
      }

      .btn-ver:hover {
        background: #218838;
      }

      .icon {
        font-size: 1.2rem;
      }

      .indicadores {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 25px;
      }

      .indicador {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ddd;
        cursor: pointer;
        transition: background 0.3s ease;
      }

      .indicador.active {
        background: #007bff;
      }

      .indicador:hover {
        background: #0056b3;
      }

      .no-archivos {
        text-align: center;
        padding: 60px 20px;
        color: #666;
        font-size: 1.1rem;
      }

      @media (max-width: 768px) {
        .carrusel-content {
          grid-template-columns: 1fr;
        }

        .nav-btn {
          width: 40px;
          height: 40px;
          font-size: 18px;
        }

        .carrusel-title {
          font-size: 1.5rem;
        }

        .archivo-card {
          padding: 15px;
        }
      }

      @media (max-width: 480px) {
        .carrusel-wrapper {
          flex-direction: column;
          gap: 10px;
        }

        .nav-btn {
          position: static;
        }

        .carrusel-container {
          padding: 10px;
        }
      }
    `,
  ],
})
export class CarruselArchivosComponent implements OnInit {
  private archivoService = inject(ArchivoAcademicoService);

  archivos: ArchivoAcademico[] = [];
  currentIndex = 0;
  itemsPorPagina = 2;

  ngOnInit() {
    this.cargarArchivos();
  }

  cargarArchivos() {
    this.archivoService.listarArchivosAcademicos(true).subscribe({
      next: (archivos) => {
        this.archivos = archivos;
      },
      error: (error) => {
        console.error("Error al cargar archivos:", error);
      },
    });
  }

  get archivosVisibles(): ArchivoAcademico[] {
    return this.archivos.slice(
      this.currentIndex,
      this.currentIndex + this.itemsPorPagina,
    );
  }

  get currentPage(): number {
    return Math.floor(this.currentIndex / this.itemsPorPagina);
  }

  get dots(): any[] {
    const totalPages = Math.ceil(this.archivos.length / this.itemsPorPagina);
    return Array(totalPages).fill(0);
  }

  anterior() {
    if (this.currentIndex > 0) {
      this.currentIndex = Math.max(0, this.currentIndex - this.itemsPorPagina);
    }
  }

  siguiente() {
    if (this.currentIndex < this.archivos.length - this.itemsPorPagina) {
      this.currentIndex = Math.min(
        this.archivos.length - this.itemsPorPagina,
        this.currentIndex + this.itemsPorPagina,
      );
    }
  }

  irAPagina(page: number) {
    this.currentIndex = page * this.itemsPorPagina;
  }

  verArchivo(archivo: ArchivoAcademico) {
    if (archivo.urlPdf) {
      window.open(archivo.urlPdf, "_blank");
    } else {
      alert("URL del archivo no disponible");
    }
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString("es-ES");
  }
}
