import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { ThemeService } from './theme.service';
import { AuthResponse, LoginPayload, VisitorRegisterPayload } from '../models/auth.model';
import { TemaUsuario, Usuario, UserRole } from '../models/usuario.model';

const VISITOR_STORAGE_KEY = 'ug_visitor_mode';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly api = inject(ApiRequestService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private initPromise: Promise<void> | null = null;

  readonly user = signal<Usuario | null>(null);
  readonly visitorMode = signal(false);
  readonly loading = signal(false);
  readonly initialized = signal(false);
  readonly error = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.user());
  readonly isAnonymousVisitor = computed(() => !this.user() && this.visitorMode());
  readonly isAuthenticatedVisitor = computed(() => this.user()?.role === 'visitante');
  readonly canAccessShell = computed(() => this.isAuthenticated() || this.isAnonymousVisitor());
  readonly currentRole = computed<UserRole>(() => this.user()?.role ?? 'visitante');
  readonly displayName = computed(() => this.user()?.nome ?? 'Visitante');

  async ensureInitialized() {
    if (this.initialized()) {
      return;
    }

    if (!this.initPromise) {
      this.initPromise = this.restoreSession();
    }

    await this.initPromise;
  }

  async login(payload: LoginPayload) {
    return this.authenticate('/auth/login', payload, 'Nao foi possivel fazer login com as credenciais informadas.');
  }

  async registerVisitor(payload: VisitorRegisterPayload) {
    return this.authenticate('/auth/register-visitor', payload, 'Nao foi possivel concluir o cadastro de visitante.');
  }

  async refreshCurrentUser() {
    try {
      const user = await firstValueFrom(this.api.get<Usuario>('/auth/me'));
      this.user.set(user);
      this.themeService.aplicarTemaDoUsuario(user.tema);
      this.visitorMode.set(false);
      localStorage.removeItem(VISITOR_STORAGE_KEY);
      return user;
    } catch {
      this.user.set(null);
      return null;
    }
  }

  async enterAsVisitor() {
    this.user.set(null);
    this.visitorMode.set(true);
    localStorage.setItem(VISITOR_STORAGE_KEY, '1');
    this.themeService.aplicarTemaLocal(this.themeService.preferencia());
    this.error.set(null);
    this.initialized.set(true);
    await this.router.navigateByUrl('/dashboard');
  }

  async goToLogin() {
    this.clearSession(false);
    await this.router.navigateByUrl('/login');
  }

  async logout() {
    try {
      await firstValueFrom(this.api.post<void, Record<string, never>>('/auth/logout', {}));
    } catch {
      // Ignore logout transport errors and clear local state anyway.
    }

    this.clearSession(false);
    await this.router.navigateByUrl('/login');
  }

  async updateTheme(tema: TemaUsuario) {
    const usuario = this.user();

    if (!usuario) {
      this.themeService.aplicarTemaLocal(tema);
      return true;
    }

    this.themeService.aplicarTemaDoUsuario(tema);

    try {
      const user = await firstValueFrom(this.api.put<Usuario, { tema: TemaUsuario }>('/auth/me/tema', { tema }));
      this.user.set(user);
      this.themeService.aplicarTemaDoUsuario(user.tema);
      return true;
    } catch {
      this.themeService.aplicarTemaDoUsuario(usuario.tema);
      return false;
    }
  }

  displayRole(role: UserRole) {
    if (role === 'admin') {
      return 'Admin';
    }

    if (role === 'juiz') {
      return 'Juiz';
    }

    if (role === 'capitao') {
      return 'Capitao';
    }

    return 'Visitante';
  }

  canManageUsers() {
    return this.user()?.role === 'admin';
  }

  canCreateEquipe() {
    const user = this.user();
    return user?.role === 'admin' || (user?.role === 'capitao' && !user.equipeId);
  }

  canCreateIndividualRegistration() {
    const role = this.user()?.role;
    return role === 'admin' || role === 'visitante' || role === 'capitao';
  }

  canDeleteEquipe() {
    return this.user()?.role === 'admin';
  }

  canEditEquipe(equipeId: number) {
    const user = this.user();
    return user?.role === 'admin' || (user?.role === 'capitao' && user.equipeId === equipeId);
  }

  canManageMembers(equipeId: number) {
    return this.canEditEquipe(equipeId);
  }

  canManageConfrontos() {
    const role = this.user()?.role;
    return role === 'admin' || role === 'juiz';
  }

  private async restoreSession() {
    this.visitorMode.set(localStorage.getItem(VISITOR_STORAGE_KEY) === '1');

    if (!this.visitorMode()) {
      await this.refreshCurrentUser();
    }

    this.initialized.set(true);
    this.initPromise = null;
  }

  private async authenticate(endpoint: string, payload: LoginPayload | VisitorRegisterPayload, errorMessage: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.post<AuthResponse, typeof payload>(endpoint, payload));
      this.setSession(response);
      await this.router.navigateByUrl('/dashboard');
      return true;
    } catch {
      this.error.set(errorMessage);
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  private setSession(response: AuthResponse) {
    this.user.set(response.user);
    this.themeService.aplicarTemaDoUsuario(response.user.tema);
    this.visitorMode.set(false);
    localStorage.removeItem(VISITOR_STORAGE_KEY);
    this.initialized.set(true);
  }

  clearSession(markInitialized = true) {
    this.user.set(null);
    this.visitorMode.set(false);
    this.error.set(null);
    localStorage.removeItem(VISITOR_STORAGE_KEY);

    if (markInitialized) {
      this.initialized.set(true);
    }
  }
}
