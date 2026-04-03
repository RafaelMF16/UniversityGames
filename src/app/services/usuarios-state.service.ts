import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { Usuario, UsuarioPayload } from '../models/usuario.model';
import { DEFAULT_PAGINATION_STATE, PaginatedResponse, PaginationState } from '../models/pagination.model';

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
  readonly pagination = signal<PaginationState>(DEFAULT_PAGINATION_STATE);

  async loadUsuarios(page = this.pagination().page) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.get<PaginatedResponse<Usuario>>('/usuarios', {
        params: {
          page,
          page_size: this.pagination().pageSize
        }
      }));

      this.usuarios.set(response.items);
      this.pagination.set(this.toPaginationState(response));

      if (!response.items.length && response.total > 0 && response.page > response.total_pages) {
        await this.loadUsuarios(response.total_pages);
      }
    } catch {
      this.error.set('Não foi possível carregar os usuários.');
    } finally {
      this.loading.set(false);
    }
  }

  async changePage(page: number) {
    await this.loadUsuarios(page);
  }

  async createUsuario(payload: UsuarioPayload) {
    this.formSaving.set(true);
    this.error.set(null);

    try {
      const usuario = await firstValueFrom(this.api.post<Usuario, UsuarioPayload>('/usuarios', payload));
      await this.loadUsuarios(this.pagination().page);
      return usuario;
    } catch {
      this.error.set('Não foi possível cadastrar o usuário.');
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
      await this.loadUsuarios(this.pagination().page);
      return usuario;
    } catch {
      this.error.set('Não foi possível atualizar o usuário.');
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
      await this.loadUsuarios(this.pagination().page);
      return true;
    } catch {
      this.error.set('Não foi possível remover o usuário.');
      return false;
    } finally {
      this.deletingId.set(null);
    }
  }

  private toPaginationState(response: PaginatedResponse<Usuario>): PaginationState {
    return {
      page: response.page,
      pageSize: response.page_size,
      total: response.total,
      totalPages: response.total_pages
    };
  }
}
