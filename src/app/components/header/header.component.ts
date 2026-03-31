import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly authState = inject(AuthStateService);

  readonly menuAberto = signal(false);
  readonly nomeUsuario = this.authState.displayName;
  readonly roleAtual = this.authState.currentRole;
  readonly isVisitor = this.authState.isVisitor;

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuAberto.update((aberto) => !aberto);
  }

  async entrar() {
    this.menuAberto.set(false);
    await this.authState.goToLogin();
  }

  async sair() {
    this.menuAberto.set(false);
    await this.authState.logout();
  }

  fecharMenu() {
    this.menuAberto.set(false);
  }

  perfilLabel() {
    return this.authState.displayRole(this.roleAtual());
  }

  podeGerenciarUsuarios() {
    return this.authState.canManageUsers();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.menuAberto.set(false);
    }
  }
}
