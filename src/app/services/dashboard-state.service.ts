import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiRequestService } from './api-request.service';
import { ResumoDashboard } from '../models/dashboard.model';
import { Confronto } from '../models/confronto.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  private readonly api = inject(ApiRequestService);
  private lastLoadedAt = 0;

  readonly resumo = signal<ResumoDashboard | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly proximosConfrontos = computed<Confronto[]>(() => this.resumo()?.proximosConfrontos ?? []);

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
      this.lastLoadedAt = agora;
    } catch {
      this.error.set('Nao foi possivel carregar o dashboard.');
    } finally {
      this.loading.set(false);
    }
  }
}
