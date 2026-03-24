import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { Usuario, UsuarioPayload } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosStateService {
  private readonly api = inject(ApiRequestService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(false);
  readonly formSaving = signal(false);
  readonly updatingId = signal<number | null>(null);
  readonly deletingId = signal<number | null>(null);
  readonly error = signal<string | null>(null);

  async loadUsuarios() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const usuarios = await firstValueFrom(this.api.get<Usuario[]>('/usuarios'));
      this.usuarios.set(usuarios);
    } catch {
      this.error.set('Nao foi possivel carregar os usuarios.');
    } finally {
      this.loading.set(false);
    }
  }

  async createUsuario(payload: UsuarioPayload) {
    this.formSaving.set(true);
    this.error.set(null);

    try {
      const usuario = await firstValueFrom(this.api.post<Usuario, UsuarioPayload>('/usuarios', payload));
      this.usuarios.update((atual) => [usuario, ...atual]);
      return usuario;
    } catch {
      this.error.set('Nao foi possivel cadastrar o usuario.');
      return null;
    } finally {
      this.formSaving.set(false);
    }
  }

  async updateUsuario(usuarioId: number, payload: UsuarioPayload) {
    this.updatingId.set(usuarioId);
    this.error.set(null);

    try {
      const usuario = await firstValueFrom(this.api.put<Usuario, UsuarioPayload>(`/usuarios/${usuarioId}`, payload));
      this.usuarios.update((atual) => atual.map((item) => item.id === usuarioId ? usuario : item));
      return usuario;
    } catch {
      this.error.set('Nao foi possivel atualizar o usuario.');
      return null;
    } finally {
      this.updatingId.set(null);
    }
  }

  async deleteUsuario(usuarioId: number) {
    this.deletingId.set(usuarioId);
    this.error.set(null);

    try {
      await firstValueFrom(this.api.delete<void>(`/usuarios/${usuarioId}`));
      this.usuarios.update((atual) => atual.filter((item) => item.id !== usuarioId));
      return true;
    } catch {
      this.error.set('Nao foi possivel remover o usuario.');
      return false;
    } finally {
      this.deletingId.set(null);
    }
  }
}
