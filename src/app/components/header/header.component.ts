import { Component, ElementRef, EventEmitter, HostListener, Output, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly authState = inject(AuthStateService);
  private readonly themeService = inject(ThemeService);

  @Output() menuToggle = new EventEmitter<void>();
  readonly menuAberto = signal(false);
  readonly nomeUsuario = this.authState.displayName;
  readonly roleAtual = this.authState.currentRole;
  readonly isVisitor = this.authState.isAnonymousVisitor;
  readonly temaLabel = this.themeService.labelTemaAtual.bind(this.themeService);
  readonly temaAplicado = this.themeService.temaAplicado;

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuAberto.update((aberto) => !aberto);
  }

  abrirMenuLateral() {
    this.menuToggle.emit();
  }

  async entrar() {
    this.menuAberto.set(false);
    await this.authState.goToLogin();
  }

  async sair() {
    this.menuAberto.set(false);
    await this.authState.logout();
  }

  async alternarTema() {
    await this.authState.updateTheme(this.themeService.proximoTema());
  }

  fecharMenu() {
    this.menuAberto.set(false);
  }

  perfilLabel() {
    return this.authState.displayRole(this.roleAtual());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.menuAberto.set(false);
    }
  }
}
