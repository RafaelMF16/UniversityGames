import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { CategoriaEsporte, Equipe, EquipePayload, ModalidadeEquipe } from '../models/equipe.model';
import { CursorPaginatedResponse, CursorPaginationState, DEFAULT_CURSOR_PAGINATION_STATE } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class EquipesStateService {
  private readonly api = inject(ApiRequestService);
  private readonly categoriaAtual = signal<CategoriaEsporte>('coletivo');
  private readonly nomeExatoAtual = signal('');

  readonly equipes = signal<Equipe[]>([]);
  readonly participantesReferencia = signal<Record<string, Equipe[]>>({});
  readonly inscricoesIndividuaisUsuario = signal<Equipe[]>([]);
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
  readonly nomeExato = this.nomeExatoAtual.asReadonly();

  async loadEquipes(cursor = this.pagination().currentCursor, page = this.pagination().page) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.get<CursorPaginatedResponse<Equipe>>('/equipes', {
        params: {
          categoria: this.categoriaAtual(),
          nome_exato: this.nomeExatoAtual() || undefined,
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
      this.error.set('Não foi possível carregar os esportes.');
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
      this.detailError.set('Não foi possível carregar os detalhes do esporte.');
      return null;
    } finally {
      this.detailLoading.set(false);
    }
  }

  async loadParticipantesPorModalidade(modalidade: ModalidadeEquipe, force = false) {
    if (this.participantesReferencia()[modalidade] && !force) {
      return;
    }

    try {
      const itens = await this.collectAllPages({
        modalidade,
        page_size: 50
      });

      this.participantesReferencia.update((current) => ({
        ...current,
        [modalidade]: itens
      }));
    } catch {
      this.error.set('Não foi possível carregar os participantes da modalidade selecionada.');
    }
  }

  async loadInscricoesIndividuaisUsuario(usuarioId: number, force = false) {
    if (!force && this.inscricoesIndividuaisUsuario().length) {
      return;
    }

    try {
      const itens = await this.collectAllPages({
        categoria: 'individual',
        usuario_id: usuarioId,
        page_size: 10
      });

      this.inscricoesIndividuaisUsuario.set(itens);
    } catch {
      this.error.set('Não foi possível carregar as inscrições individuais do usuário.');
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

  async setNomeExatoFilter(nome: string) {
    const valorNormalizado = nome.trim();
    if (this.nomeExatoAtual() === valorNormalizado) {
      return;
    }

    this.nomeExatoAtual.set(valorNormalizado);
    this.resetPagination();
    await this.loadEquipes();
  }

  async createEquipe(payload: EquipePayload) {
    this.formSaving.set(true);
    this.error.set(null);

    try {
      const equipe = await firstValueFrom(this.api.post<Equipe, EquipePayload>('/equipes', payload));
      this.atualizarCachesAposMutacao(equipe);
      this.resetPagination();
      await this.loadEquipes();
      return equipe;
    } catch (error: any) {
      this.error.set(error?.error?.detail ?? 'Não foi possível cadastrar o esporte.');
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
      this.atualizarCachesAposMutacao(equipe);
      if (this.selectedEquipe()?.id === equipeId) {
        this.selectedEquipe.set(equipe);
      }
      await this.loadEquipes(this.pagination().currentCursor, this.pagination().page);
      return equipe;
    } catch (error: any) {
      this.error.set(error?.error?.detail ?? 'Não foi possível atualizar o esporte.');
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
      this.removerDosCaches(equipeId);
      if (this.selectedEquipe()?.id === equipeId) {
        this.selectedEquipe.set(null);
      }
      await this.loadEquipes(this.pagination().currentCursor, this.pagination().page);
      return true;
    } catch (error: any) {
      this.error.set(error?.error?.detail ?? 'Não foi possível remover o esporte.');
      return false;
    } finally {
      this.deletingId.set(null);
    }
  }

  private resetPagination() {
    this.pagination.set(DEFAULT_CURSOR_PAGINATION_STATE);
  }

  private async collectAllPages(params: Record<string, string | number | undefined>) {
    const itens: Equipe[] = [];
    let cursor: string | null = null;
    let hasNext = true;

    while (hasNext) {
      const response: CursorPaginatedResponse<Equipe> = await firstValueFrom(this.api.get<CursorPaginatedResponse<Equipe>>('/equipes', {
        params: {
          ...params,
          cursor: cursor ?? undefined
        }
      }));

      itens.push(...response.items);
      cursor = response.next_cursor;
      hasNext = response.has_next;
    }

    return itens;
  }

  private atualizarCachesAposMutacao(equipeAtualizada: Equipe) {
    this.participantesReferencia.update((current) => {
      const proximo = { ...current };
      const modalidadeAtual = equipeAtualizada.modalidade;
      const listaAtual = proximo[modalidadeAtual];

      if (listaAtual) {
        const indice = listaAtual.findIndex((equipe) => equipe.id === equipeAtualizada.id);
        proximo[modalidadeAtual] = indice === -1
          ? [...listaAtual, equipeAtualizada].sort((a, b) => a.id - b.id)
          : listaAtual.map((equipe) => (equipe.id === equipeAtualizada.id ? equipeAtualizada : equipe));
      }

      return proximo;
    });

    if (equipeAtualizada.usuarioId != null) {
      const listaAtual = this.inscricoesIndividuaisUsuario();
      const indice = listaAtual.findIndex((equipe) => equipe.id === equipeAtualizada.id);
      this.inscricoesIndividuaisUsuario.set(
        indice === -1
          ? [...listaAtual, equipeAtualizada].sort((a, b) => a.id - b.id)
          : listaAtual.map((equipe) => (equipe.id === equipeAtualizada.id ? equipeAtualizada : equipe))
      );
    }
  }

  private removerDosCaches(equipeId: number) {
    this.participantesReferencia.update((current) => {
      const proximo: Record<string, Equipe[]> = {};
      for (const [modalidade, equipes] of Object.entries(current)) {
        proximo[modalidade] = equipes.filter((equipe) => equipe.id !== equipeId);
      }
      return proximo;
    });

    this.inscricoesIndividuaisUsuario.update((equipes) => equipes.filter((equipe) => equipe.id !== equipeId));
  }
}
