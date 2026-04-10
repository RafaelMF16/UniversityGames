import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, computed, signal } from '@angular/core';
import { TemaUsuario } from '../models/usuario.model';

const THEME_STORAGE_KEY = 'ug_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly preferencia = signal<TemaUsuario>(this.getStoredTheme());
  readonly temaAplicado = computed(() => this.resolveTheme(this.preferencia()));

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    this.applyTheme(this.preferencia());
  }

  aplicarTemaDoUsuario(tema: TemaUsuario | null | undefined) {
    this.setPreference(tema ?? 'dark', false);
  }

  aplicarTemaLocal(tema: TemaUsuario) {
    this.setPreference(tema, true);
  }

  proximoTema() {
    return this.temaAplicado() === 'dark' ? 'light' : 'dark';
  }

  labelTemaAtual() {
    const aplicado = this.temaAplicado();
    return aplicado === 'dark' ? 'Tema escuro' : 'Tema claro';
  }

  private setPreference(tema: TemaUsuario, persistirLocalmente: boolean) {
    this.preferencia.set(tema);

    if (persistirLocalmente) {
      localStorage.setItem(THEME_STORAGE_KEY, tema);
    }

    this.applyTheme(tema);
  }

  private applyTheme(tema: TemaUsuario) {
    const aplicado = this.resolveTheme(tema);
    const root = this.document.documentElement;
    root.classList.toggle('theme-dark', aplicado === 'dark');
    root.classList.toggle('theme-light', aplicado === 'light');
    root.style.colorScheme = aplicado;
  }

  private resolveTheme(tema: TemaUsuario) {
    if (tema !== 'system') {
      return tema;
    }

    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  private getStoredTheme(): TemaUsuario {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'system' || stored === 'dark' ? stored : 'dark';
  }
}
