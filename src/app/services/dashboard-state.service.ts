import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { ResumoDashboard } from '../models/dashboard.model';
import { Confronto } from '../models/confronto.model';
import { DEFAULT_PAGINATION_STATE, PaginationState } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  private readonly api = inject(ApiRequestService);
  private lastLoadedAt = 0;
  private readonly allProximosConfrontos = signal<Confronto[]>([]);

  readonly resumo = signal<ResumoDashboard | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pagination = signal<PaginationState>(DEFAULT_PAGINATION_STATE);
  readonly proximosConfrontos = computed<Confronto[]>(() => {
    const page = this.pagination().page;
    const pageSize = this.pagination().pageSize;
    const start = (page - 1) * pageSize;
    return this.allProximosConfrontos().slice(start, start + pageSize);
  });

  async changePage(page: number) {
    const totalPages = this.pagination().totalPages;
    const nextPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
    this.pagination.update((state) => ({ ...state, page: nextPage }));
  }

  async loadResumo(force = false) {
    const agora = Date.now();
    if (!force && this.resumo() && agora - this.lastLoadedAt < 30_000) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const resumo = await firstValueFrom(this.api.get<ResumoDashboard>('/dashboard/resumo'));
      this.resumo.set(resumo);
      this.allProximosConfrontos.set(resumo.proximosConfrontos ?? []);
      this.pagination.set(this.toPaginationState(resumo.proximosConfrontos ?? []));
      this.lastLoadedAt = agora;
    } catch {
      this.error.set('Nao foi possivel carregar o dashboard.');
    } finally {
      this.loading.set(false);
    }
  }

  private toPaginationState(items: Confronto[]): PaginationState {
    const pageSize = this.pagination().pageSize;
    const total = items.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    return {
      page: 1,
      pageSize,
      total,
      totalPages
    };
  }
}
