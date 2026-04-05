import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from "../../components/header/header.component";
import { AuthStateService } from '../../services/auth-state.service';
import { SidebarComponent, SidebarItem } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    MatSidenavModule
  ],
  templateUrl: './pagina-principal.component.html',
  styleUrl: './pagina-principal.component.css'
})
export class PaginaPrincipalComponent {
  private readonly authState = inject(AuthStateService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = signal(false);
  readonly sidebarDesktopOpen = signal(true);
  readonly sidebarMobileOpen = signal(false);
  readonly itensMenu = computed<SidebarItem[]>(() => {
    const itens: SidebarItem[] = [
      { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
      { label: 'Esportes', route: '/esportes', icon: 'sports_soccer' },
      { label: 'Confrontos', route: '/confrontos', icon: 'emoji_events' },
    ];

    if (this.authState.canManageUsers()) {
      itens.push({ label: 'Usuarios', route: '/usuarios', icon: 'group' });
    }

    return itens;
  });

  constructor() {
    void this.authState.ensureInitialized();

    this.breakpointObserver.observe('(max-width: 1100px)').subscribe((state) => {
      this.isMobile.set(state.matches);

      if (state.matches) {
        this.sidebarMobileOpen.set(false);
      } else {
        this.sidebarMobileOpen.set(false);
      }
    });
  }

  drawerMode() {
    return this.isMobile() ? 'over' : 'side';
  }

  drawerOpened() {
    return this.isMobile() ? this.sidebarMobileOpen() : this.sidebarDesktopOpen();
  }

  toggleSidebar() {
    if (this.isMobile()) {
      this.sidebarMobileOpen.update((aberta) => !aberta);
      return;
    }

    this.sidebarDesktopOpen.update((aberta) => !aberta);
  }

  closeSidebarOnMobile() {
    if (this.isMobile()) {
      this.sidebarMobileOpen.set(false);
    }
  }
}
