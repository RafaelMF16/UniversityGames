import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { CategoriaEsporte, Equipe, EquipePayload } from '../models/equipe.model';
import { CursorPaginatedResponse, CursorPaginationState, DEFAULT_CURSOR_PAGINATION_STATE } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class EquipesStateService {
  private readonly api = inject(ApiRequestService);
  private readonly categoriaAtual = signal<CategoriaEsporte>('coletivo');
  private readonly referenciaCarregada = signal(false);

  readonly equipes = signal<Equipe[]>([]);
  readonly equipesReferencia = signal<Equipe[]>([]);
  readonly selectedEquipe = signal<Equipe | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly loading = signal(false);
  readonly formSaving = signal(false);
  readonly updatingId = signal<number | null>(null);
  readonly deletingId = signal<number | null>(null);
  readonly error = signal<string | null>(null);
  readonly pagination = signal<CursorPaginationState>(DEFAULT_CURSOR_PAGINATION_STATE);
  readonly categoria = this.categoriaAtual.asReadonly();

  async loadEquipes(cursor = this.pagination().currentCursor, page = this.pagination().page) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.get<CursorPaginatedResponse<Equipe>>('/equipes', {
        params: {
          categoria: this.categoriaAtual(),
          cursor,
          page_size: this.pagination().pageSize
        }
      }));

      this.equipes.set(response.items);
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
      this.error.set('Nao foi possivel carregar os esportes.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadEquipeById(equipeId: number) {
    this.detailLoading.set(true);
    this.detailError.set(null);

    try {
      const equipe = await firstValueFrom(this.api.get<Equipe>(`/equipes/${equipeId}`));
      this.selectedEquipe.set(equipe);
      return equipe;
    } catch {
      this.selectedEquipe.set(null);
      this.detailError.set('Nao foi possivel carregar os detalhes do esporte.');
      return null;
    } finally {
      this.detailLoading.set(false);
    }
  }

  async loadEquipesReferencia(force = false) {
    if (this.referenciaCarregada() && !force) {
      return;
    }

    try {
      const response = await firstValueFrom(this.api.get<CursorPaginatedResponse<Equipe>>('/equipes', {
        params: {
          page_size: 50
        }
      }));

      this.equipesReferencia.set(response.items);
      this.referenciaCarregada.set(true);
    } catch {
      this.error.set('Nao foi possivel carregar os cadastros de referencia.');
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
      await this.loadEquipes(state.nextCursor, page);
      return;
    }

    if (page === state.page - 1) {
      const previousCursor = state.cursorStack[state.cursorStack.length - 1] ?? null;
      this.pagination.update((current) => ({
        ...current,
        cursorStack: current.cursorStack.slice(0, -1)
      }));
      await this.loadEquipes(previousCursor, page);
    }
  }

  async setCategoria(categoria: CategoriaEsporte) {
    this.categoriaAtual.set(categoria);
    this.resetPagination();
    await this.loadEquipes();
  }

  async createEquipe(payload: EquipePayload) {
    this.formSaving.set(true);
    this.error.set(null);

    try {
      const equipe = await firstValueFrom(this.api.post<Equipe, EquipePayload>('/equipes', payload));
      this.equipesReferencia.update((equipes) => this.mergeEquipeReferencia(equipes, equipe));
      this.resetPagination();
      await this.loadEquipes();
      return equipe;
    } catch (error: any) {
      this.error.set(error?.error?.detail ?? 'Nao foi possivel cadastrar o esporte.');
      return null;
    } finally {
      this.formSaving.set(false);
    }
  }

  async updateEquipe(equipeId: number, payload: EquipePayload) {
    this.updatingId.set(equipeId);
    this.error.set(null);

    try {
      const equipe = await firstValueFrom(this.api.put<Equipe, EquipePayload>(`/equipes/${equipeId}`, payload));
      this.equipesReferencia.update((equipes) => this.mergeEquipeReferencia(equipes, equipe));
      if (this.selectedEquipe()?.id === equipeId) {
        this.selectedEquipe.set(equipe);
      }
      await this.loadEquipes(this.pagination().currentCursor, this.pagination().page);
      return equipe;
    } catch (error: any) {
      this.error.set(error?.error?.detail ?? 'Nao foi possivel atualizar o esporte.');
      return null;
    } finally {
      this.updatingId.set(null);
    }
  }

  async deleteEquipe(equipeId: number) {
    this.deletingId.set(equipeId);
    this.error.set(null);

    try {
      await firstValueFrom(this.api.delete<void>(`/equipes/${equipeId}`));
      this.equipesReferencia.update((equipes) => equipes.filter((equipe) => equipe.id !== equipeId));
      if (this.selectedEquipe()?.id === equipeId) {
        this.selectedEquipe.set(null);
      }
      await this.loadEquipes(this.pagination().currentCursor, this.pagination().page);
      return true;
    } catch {
      this.error.set('Nao foi possivel remover o esporte.');
      return false;
    } finally {
      this.deletingId.set(null);
    }
  }

  private resetPagination() {
    this.pagination.set(DEFAULT_CURSOR_PAGINATION_STATE);
  }

  private mergeEquipeReferencia(equipes: Equipe[], equipeAtualizada: Equipe) {
    const indice = equipes.findIndex((equipe) => equipe.id === equipeAtualizada.id);

    if (indice === -1) {
      return [...equipes, equipeAtualizada].sort((a, b) => a.id - b.id);
    }

    return equipes.map((equipe) => (equipe.id === equipeAtualizada.id ? equipeAtualizada : equipe));
  }
}
