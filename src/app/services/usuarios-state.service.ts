import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { Usuario, UsuarioPayload } from '../models/usuario.model';
import { CursorPaginatedResponse, CursorPaginationState, DEFAULT_CURSOR_PAGINATION_STATE } from '../models/pagination.model';

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
  readonly pagination = signal<CursorPaginationState>(DEFAULT_CURSOR_PAGINATION_STATE);

  async loadUsuarios(cursor = this.pagination().currentCursor, page = this.pagination().page) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.get<CursorPaginatedResponse<Usuario>>('/usuarios', {
        params: {
          cursor,
          page_size: this.pagination().pageSize
        }
      }));

      this.usuarios.set(response.items);
      this.pagination.set({
        ...this.pagination(),
        page,
        currentCursor: cursor,
        nextCursor: response.next_cursor,
        hasNext: response.has_next,
        pageSize: response.page_size
      });

      if (!response.items.length && page > 1) {
        await this.changePage(page - 1);
      }
    } catch {
      this.error.set('Nao foi possivel carregar os usuarios.');
    } finally {
      this.loading.set(false);
    }
  }

  async changePage(page: number) {
    const state = this.pagination();

    if (page === state.page) {
      return;
    }

    if (page === state.page + 1 && state.nextCursor) {
      this.pagination.update((current) => ({
        ...current,
        cursorStack: [...current.cursorStack, current.currentCursor]
      }));
      await this.loadUsuarios(state.nextCursor, page);
      return;
    }

    if (page === state.page - 1) {
      const previousCursor = state.cursorStack[state.cursorStack.length - 1] ?? null;
      this.pagination.update((current) => ({
        ...current,
        cursorStack: current.cursorStack.slice(0, -1)
      }));
      await this.loadUsuarios(previousCursor, page);
    }
  }

  async createUsuario(payload: UsuarioPayload) {
    this.formSaving.set(true);
    this.error.set(null);

    try {
      const usuario = await firstValueFrom(this.api.post<Usuario, UsuarioPayload>('/usuarios', payload));
      this.resetPagination();
      await this.loadUsuarios();
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
      await this.loadUsuarios(this.pagination().currentCursor, this.pagination().page);
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
      await this.loadUsuarios(this.pagination().currentCursor, this.pagination().page);
      return true;
    } catch (error: any) {
      this.error.set(error?.error?.detail ?? 'Nao foi possivel remover o usuario.');
      return false;
    } finally {
      this.deletingId.set(null);
    }
  }

  private resetPagination() {
    this.pagination.set(DEFAULT_CURSOR_PAGINATION_STATE);
  }
}
