import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { CategoriaEsporte, Equipe, EquipePayload } from '../models/equipe.model';
import { DEFAULT_PAGINATION_STATE, PaginatedResponse, PaginationState } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class EquipesStateService {
  private readonly api = inject(ApiRequestService);
  private readonly categoriaAtual = signal<CategoriaEsporte>('coletivo');
  private readonly referenciaCarregada = signal(false);

  readonly equipes = signal<Equipe[]>([]);
  readonly equipesReferencia = signal<Equipe[]>([]);
  readonly loading = signal(false);
  readonly formSaving = signal(false);
  readonly updatingId = signal<number | null>(null);
  readonly deletingId = signal<number | null>(null);
  readonly error = signal<string | null>(null);
  readonly pagination = signal<PaginationState>(DEFAULT_PAGINATION_STATE);
  readonly categoria = this.categoriaAtual.asReadonly();

  async loadEquipes(page = this.pagination().page) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.get<PaginatedResponse<Equipe>>('/equipes', {
        params: {
          categoria: this.categoriaAtual(),
          page,
          page_size: this.pagination().pageSize
        }
      }));

      this.equipes.set(response.items);
      this.pagination.set(this.toPaginationState(response));

      if (!response.items.length && response.total > 0 && response.page > response.total_pages) {
        await this.loadEquipes(response.total_pages);
      }
    } catch {
      this.error.set('Nao foi possivel carregar os esportes.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadEquipesReferencia(force = false) {
    if (this.referenciaCarregada() && !force) {
      return;
    }

    try {
      const response = await firstValueFrom(this.api.get<PaginatedResponse<Equipe>>('/equipes', {
        params: {
          page: 1,
          page_size: 500
        }
      }));

      this.equipesReferencia.set(response.items);
      this.referenciaCarregada.set(true);
    } catch {
      this.error.set('Nao foi possivel carregar os cadastros de referencia.');
    }
  }

  async changePage(page: number) {
    await this.loadEquipes(page);
  }

  async setCategoria(categoria: CategoriaEsporte) {
    this.categoriaAtual.set(categoria);
    await this.loadEquipes(1);
  }

  async createEquipe(payload: EquipePayload) {
    this.formSaving.set(true);
    this.error.set(null);

    try {
      const equipe = await firstValueFrom(this.api.post<Equipe, EquipePayload>('/equipes', payload));
      this.equipesReferencia.update((equipes) => this.mergeEquipeReferencia(equipes, equipe));
      await this.loadEquipes(this.pagination().page);
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
      await this.loadEquipes(this.pagination().page);
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
      await this.loadEquipes(this.pagination().page);
      return true;
    } catch {
      this.error.set('Nao foi possivel remover o esporte.');
      return false;
    } finally {
      this.deletingId.set(null);
    }
  }

  private toPaginationState(response: PaginatedResponse<Equipe>): PaginationState {
    return {
      page: response.page,
      pageSize: response.page_size,
      total: response.total,
      totalPages: response.total_pages
    };
  }

  private mergeEquipeReferencia(equipes: Equipe[], equipeAtualizada: Equipe) {
    const indice = equipes.findIndex((equipe) => equipe.id === equipeAtualizada.id);

    if (indice === -1) {
      return [...equipes, equipeAtualizada].sort((a, b) => a.id - b.id);
    }

    return equipes.map((equipe) => (equipe.id === equipeAtualizada.id ? equipeAtualizada : equipe));
  }
}
