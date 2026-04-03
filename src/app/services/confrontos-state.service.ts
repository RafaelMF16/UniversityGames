import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { Confronto, ConfrontoPayload, ConfrontosFiltros } from '../models/confronto.model';
import { DEFAULT_PAGINATION_STATE, PaginatedResponse, PaginationState } from '../models/pagination.model';

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
  readonly pagination = signal<PaginationState>(DEFAULT_PAGINATION_STATE);

  constructor() {
    void this.loadConfrontos();
  }

  setFiltros(filtros: ConfrontosFiltros) {
    const novosFiltros = {
      busca: filtros.busca?.trim() || undefined,
      equipe: filtros.equipe || undefined,
      modalidade: filtros.modalidade || undefined,
      status: filtros.status || undefined
    };

    this.filtrosInternos.set(novosFiltros);
    this.pagination.update((state) => ({ ...state, page: 1 }));
    void this.loadConfrontos(novosFiltros, 1);
  }

  async changePage(page: number) {
    await this.loadConfrontos(this.filtrosInternos(), page);
  }

  async loadConfrontos(filtros: ConfrontosFiltros = this.filtrosInternos(), page = this.pagination().page) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.get<PaginatedResponse<Confronto>>('/confrontos', {
        params: {
          ...filtros,
          page,
          page_size: this.pagination().pageSize
        }
      }));

      this.confrontos.set(response.items);
      this.pagination.set(this.toPaginationState(response));

      if (!response.items.length && response.total > 0 && response.page > response.total_pages) {
        await this.loadConfrontos(filtros, response.total_pages);
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
      await this.loadConfrontos(this.filtrosInternos(), this.pagination().page);
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
      await this.loadConfrontos(this.filtrosInternos(), this.pagination().page);
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
      await this.loadConfrontos(this.filtrosInternos(), this.pagination().page);
      return true;
    } catch {
      this.error.set('Nao foi possivel remover o confronto.');
      return false;
    } finally {
      this.deletingId.set(null);
    }
  }

  private toPaginationState(response: PaginatedResponse<Confronto>): PaginationState {
    return {
      page: response.page,
      pageSize: response.page_size,
      total: response.total,
      totalPages: response.total_pages
    };
  }
}
