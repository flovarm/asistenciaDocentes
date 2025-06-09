import { IMAGE_LOADER } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { routes } from '../app.routes';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { NavbarComponent } from '../Shared/navbar/navbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    MatSidenavModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    RouterModule,
    MatTooltipModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  optimizedImage = inject(IMAGE_LOADER);
  opened = true;
  protected readonly isMobile = signal(true);
  public menuItems = routes
  .map(route => route.children ?? [])
  .flat()
  .filter(route => route &&  route.path)
  .filter(route => !route.path?.includes(':'));
  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;
  @ViewChild('drawer')
  sidenav!: MatSidenav;
  abrirSidenav(event: any) {
    this.opened = !this.opened;
    event.toggle();
  }

  
  constructor() {
    const media = inject(MediaMatcher);
    
    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);
    const rutas =routes
    .map(route => route.children ?? [])
    .flat()
    .filter(route => route &&  route.path)
    .filter(route => !route.path?.includes(':'));
  }
  ngOnInit(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
