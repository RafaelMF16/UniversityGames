import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { Confronto, ConfrontoPayload, ConfrontosFiltros } from '../models/confronto.model';
import { CursorPaginatedResponse, CursorPaginationState, DEFAULT_CURSOR_PAGINATION_STATE } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class ConfrontosStateService {
  private readonly api = inject(ApiRequestService);
  private readonly filtrosInternos = signal<ConfrontosFiltros>({});

  readonly confrontos = signal<Confronto[]>([]);
  readonly loading = signal(false);
  readonly formSaving = signal(false);
  readonly placarSavingId = signal<number | null>(null);
  readonly predictionSavingId = signal<number | null>(null);
  readonly deletingId = signal<number | null>(null);
  readonly error = signal<string | null>(null);
  readonly selectedConfronto = signal<Confronto | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly filtros = this.filtrosInternos.asReadonly();
  readonly pagination = signal<CursorPaginationState>(DEFAULT_CURSOR_PAGINATION_STATE);

  constructor() {
    void this.loadConfrontos();
  }

  setFiltros(filtros: ConfrontosFiltros) {
    const novosFiltros = {
      equipe: filtros.equipe || undefined,
      modalidade: filtros.modalidade || undefined,
      status: filtros.status || undefined
    };

    this.filtrosInternos.set(novosFiltros);
    this.resetPagination();
    void this.loadConfrontos(novosFiltros);
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
      await this.loadConfrontos(this.filtrosInternos(), state.nextCursor, page);
      return;
    }

    if (page === state.page - 1) {
      const previousCursor = state.cursorStack[state.cursorStack.length - 1] ?? null;
      this.pagination.update((current) => ({
        ...current,
        cursorStack: current.cursorStack.slice(0, -1)
      }));
      await this.loadConfrontos(this.filtrosInternos(), previousCursor, page);
    }
  }

  async loadConfrontos(
    filtros: ConfrontosFiltros = this.filtrosInternos(),
    cursor = this.pagination().currentCursor,
    page = this.pagination().page
  ) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.get<CursorPaginatedResponse<Confronto>>('/confrontos', {
        params: {
          ...filtros,
          cursor,
          page_size: this.pagination().pageSize
        }
      }));

      this.confrontos.set(response.items);
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
      this.error.set('Nao foi possivel carregar os confrontos.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadConfrontoById(confrontoId: number) {
    this.detailLoading.set(true);
    this.detailError.set(null);

    try {
      const confronto = await firstValueFrom(this.api.get<Confronto>(`/confrontos/${confrontoId}`));
      this.selectedConfronto.set(confronto);
      return confronto;
    } catch {
      this.selectedConfronto.set(null);
      this.detailError.set('Nao foi possivel carregar os detalhes do confronto.');
      return null;
    } finally {
      this.detailLoading.set(false);
    }
  }

  async createConfronto(payload: ConfrontoPayload) {
    this.formSaving.set(true);
    this.error.set(null);

    try {
      const confronto = await firstValueFrom(this.api.post<Confronto, ConfrontoPayload>('/confrontos', payload));
      this.resetPagination();
      await this.loadConfrontos(this.filtrosInternos());
      return confronto;
    } catch (error: any) {
      this.error.set(error?.error?.detail ?? 'Nao foi possivel cadastrar o confronto.');
      return null;
    } finally {
      this.formSaving.set(false);
    }
  }

  async updateConfronto(confrontoId: number, payload: ConfrontoPayload, scoreOnly = false) {
    if (scoreOnly) {
      this.placarSavingId.set(confrontoId);
    } else {
      this.formSaving.set(true);
    }
    this.error.set(null);

    try {
      const confronto = await firstValueFrom(this.api.put<Confronto, ConfrontoPayload>(`/confrontos/${confrontoId}`, payload));
      if (this.selectedConfronto()?.id === confrontoId) {
        this.selectedConfronto.set(confronto);
      }
      await this.loadConfrontos(this.filtrosInternos(), this.pagination().currentCursor, this.pagination().page);
      return confronto;
    } catch (error: any) {
      this.error.set(error?.error?.detail ?? (scoreOnly ? 'Nao foi possivel atualizar o resultado.' : 'Nao foi possivel atualizar o confronto.'));
      return null;
    } finally {
      if (scoreOnly) {
        this.placarSavingId.set(null);
      } else {
        this.formSaving.set(false);
      }
    }
  }

  async regeneratePrediction(confrontoId: number) {
    this.predictionSavingId.set(confrontoId);
    this.error.set(null);

    try {
      const confronto = await firstValueFrom(this.api.post<Confronto, Record<string, never>>(`/confrontos/${confrontoId}/previsao`, {}));
      if (this.selectedConfronto()?.id === confrontoId) {
        this.selectedConfronto.set(confronto);
      }
      this.confrontos.update((items) => items.map((item) => item.id === confrontoId ? confronto : item));
      return confronto;
    } catch (error: any) {
      this.error.set(error?.error?.detail ?? 'Nao foi possivel regerar a previsao.');
      return null;
    } finally {
      this.predictionSavingId.set(null);
    }
  }

  async deleteConfronto(confrontoId: number) {
    this.deletingId.set(confrontoId);
    this.error.set(null);

    try {
      await firstValueFrom(this.api.delete<void>(`/confrontos/${confrontoId}`));
      if (this.selectedConfronto()?.id === confrontoId) {
        this.selectedConfronto.set(null);
      }
      await this.loadConfrontos(this.filtrosInternos(), this.pagination().currentCursor, this.pagination().page);
      return true;
    } catch {
      this.error.set('Nao foi possivel remover o confronto.');
      return false;
    } finally {
      this.deletingId.set(null);
    }
  }

  private resetPagination() {
    this.pagination.set(DEFAULT_CURSOR_PAGINATION_STATE);
  }
}
