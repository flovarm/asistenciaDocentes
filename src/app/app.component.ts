import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ProfesorService } from './_services/profesor.service';
import { IMAGE_LOADER } from '@angular/common';
import { NavbarComponent } from './Shared/navbar/navbar.component';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { routes } from './app.routes';
import { MediaMatcher } from '@angular/cdk/layout';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [
   RouterOutlet,
   NgxSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'El Cultural'
  private authService = inject(ProfesorService);
  optimizedImage = inject(IMAGE_LOADER);
  
  ngOnInit(): void {
    this.setCurrentUser();
   
  }

  setCurrentUser() {
    const user = JSON.parse(localStorage.getItem('profesor')!);
    if (!user) return;
    this.authService.currentUser.set(user);
  }
}