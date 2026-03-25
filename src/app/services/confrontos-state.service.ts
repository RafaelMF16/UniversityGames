import { Injectable, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { Confronto, ConfrontoPayload, ConfrontosFiltros } from '../models/confronto.model';

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
  readonly deletingId = signal<number | null>(null);
  readonly error = signal<string | null>(null);
  readonly filtros = this.filtrosInternos.asReadonly();

  constructor() {
    effect(() => {
      const filtros = this.filtrosInternos();
      void this.loadConfrontos(filtros);
    });
  }

  setFiltros(filtros: ConfrontosFiltros) {
    this.filtrosInternos.set({
      busca: filtros.busca?.trim() || undefined,
      equipe: filtros.equipe || undefined,
      modalidade: filtros.modalidade || undefined,
      status: filtros.status || undefined
    });
  }

  async loadConfrontos(filtros: ConfrontosFiltros = this.filtrosInternos()) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const confrontos = await firstValueFrom(this.api.get<Confronto[]>('/confrontos', { params: { ...filtros } }));
      this.confrontos.set(confrontos);
    } catch {
      this.error.set('Não foi possível carregar os confrontos.');
    } finally {
      this.loading.set(false);
    }
  }

  async createConfronto(payload: ConfrontoPayload) {
    this.formSaving.set(true);
    this.error.set(null);

    try {
      const confronto = await firstValueFrom(this.api.post<Confronto, ConfrontoPayload>('/confrontos', payload));
      await this.loadConfrontos();
      return confronto;
    } catch {
      this.error.set('Não foi possível cadastrar o confronto.');
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
      await this.loadConfrontos();
      return confronto;
    } catch {
      this.error.set(scoreOnly ? 'Não foi possível atualizar o placar.' : 'Não foi possível atualizar o confronto.');
      return null;
    } finally {
      if (scoreOnly) {
        this.placarSavingId.set(null);
      } else {
        this.formSaving.set(false);
      }
    }
  }

  async deleteConfronto(confrontoId: number) {
    this.deletingId.set(confrontoId);
    this.error.set(null);

    try {
      await firstValueFrom(this.api.delete<void>(`/confrontos/${confrontoId}`));
      await this.loadConfrontos();
      return true;
    } catch {
      this.error.set('Não foi possível remover o confronto.');
      return false;
    } finally {
      this.deletingId.set(null);
    }
  }
}
