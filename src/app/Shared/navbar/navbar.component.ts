import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, inject, output } from '@angular/core';
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
    CommonModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  public themeService = inject(ThemeService);
  public authService = inject(ProfesorService);
  public loading = inject(LoadingService);
  profesor: Profesor = JSON.parse(localStorage.getItem('profesor')!);
  readonly toggleSidenav = output();
  onToggleSidenav() {
    this.toggleSidenav.emit();
  }

   isDarkTheme(): boolean {
  return this.themeService.selectedTheme()?.name === 'dark';
}
}
