import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { Equipe, EquipePayload } from '../models/equipe.model';

@Injectable({
  providedIn: 'root'
})
export class EquipesStateService {
  private readonly api = inject(ApiRequestService);

  readonly equipes = signal<Equipe[]>([]);
  readonly loading = signal(false);
  readonly formSaving = signal(false);
  readonly updatingId = signal<number | null>(null);
  readonly deletingId = signal<number | null>(null);
  readonly error = signal<string | null>(null);

  async loadEquipes() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const equipes = await firstValueFrom(this.api.get<Equipe[]>('/equipes'));
      this.equipes.set(equipes);
    } catch {
      this.error.set('Não foi possível carregar as equipes.');
    } finally {
      this.loading.set(false);
    }
  }

  async createEquipe(payload: EquipePayload) {
    this.formSaving.set(true);
    this.error.set(null);

    try {
      const equipe = await firstValueFrom(this.api.post<Equipe, EquipePayload>('/equipes', payload));
      this.equipes.update((atual) => [equipe, ...atual]);
      return equipe;
    } catch {
      this.error.set('Não foi possível cadastrar a equipe.');
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
      this.equipes.update((atual) => atual.map((item) => item.id === equipeId ? equipe : item));
      return equipe;
    } catch {
      this.error.set('Não foi possível atualizar a equipe.');
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
      this.equipes.update((atual) => atual.filter((item) => item.id !== equipeId));
      return true;
    } catch {
      this.error.set('Não foi possível remover a equipe.');
      return false;
    } finally {
      this.deletingId.set(null);
    }
  }
}
