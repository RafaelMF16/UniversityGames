import { Component, computed, inject } from '@angular/core';
import { ContainerPrincipalComponent } from "../../components/container-principal/container-principal.component";
import { DashboardCardComponent } from "../../components/dashboard-card/dashboard-card.component";
import { ProximosConfrontosCardComponent } from "../../components/proximos-confrontos-card/proximos-confrontos-card.component";
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { DashboardStateService } from '../../services/dashboard-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ContainerPrincipalComponent, DashboardCardComponent, ProximosConfrontosCardComponent, LoadingIndicatorComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly dashboardState = inject(DashboardStateService);

  readonly loading = this.dashboardState.loading.asReadonly();
  readonly error = this.dashboardState.error.asReadonly();
  readonly proximosJogos = this.dashboardState.proximosConfrontos;
  readonly metricas = computed(() => {
    const resumo = this.dashboardState.resumo();

    return [
      {
        titulo: 'Total de inscrições',
        valor: String(resumo?.totalEquipes ?? 0),
        icone: 'groups',
        destaque: '',
        destaqueTipo: 'success' as const,
        descricao: ''
      },
      {
        titulo: 'Total de confrontos',
        valor: String(resumo?.totalConfrontos ?? 0),
        icone: 'sports_soccer',
        destaque: '',
        destaqueTipo: 'primary' as const,
        descricao: ''
      }
    ];
  });

  constructor() {
    void this.dashboardState.loadResumo();
  }
}
