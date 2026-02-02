import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { InitialsPipe } from '../../_pipes/Initials.pipe';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ThemeService } from '../../_services/theme.service';
import { AuthService } from '../../_services/auth.service';
import { LoadingService } from '../../_services/loading.service';
import { Profesor } from '../../_models/profesor';
import { ProfesorService } from '../../_services/profesor.service';
import { NotificacionService } from '../../_services/notificacion.service';
import {MatBadgeModule} from '@angular/material/badge';
@Component({
  selector: 'app-navbar',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TitleCasePipe,
    RouterModule,
    InitialsPipe,
    MatProgressBarModule,
    CommonModule,
    MatBadgeModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{
  public themeService = inject(ThemeService);
  public authService = inject(ProfesorService);
  public loading = inject(LoadingService);
  public notificacionService = inject(NotificacionService);
  profesor: Profesor = JSON.parse(localStorage.getItem('profesor')!);
  readonly toggleSidenav = output();
  ngOnInit(): void {
    this.notificacionService.iniciarConexion();
    this.listarNotificaciones();
  }
  onToggleSidenav() {
    this.toggleSidenav.emit();
  }

  listarNotificaciones() {
    this.notificacionService.listarNotificacionDocente(this.profesor.idProfesor).subscribe({
        next: () => {
        },
    });
  }

   isDarkTheme(): boolean {
  return this.themeService.selectedTheme()?.name === 'dark';
}
}
