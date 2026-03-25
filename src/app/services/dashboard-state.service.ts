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

  readonly resumo = signal<ResumoDashboard | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly proximosConfrontos = computed<Confronto[]>(() => this.resumo()?.proximosConfrontos ?? []);

  async loadResumo() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const resumo = await firstValueFrom(this.api.get<ResumoDashboard>('/dashboard/resumo'));
      this.resumo.set(resumo);
    } catch {
      this.error.set('Não foi possível carregar o dashboard.');
    } finally {
      this.loading.set(false);
    }
  }
}
