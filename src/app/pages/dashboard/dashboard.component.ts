import { Component, computed, inject } from '@angular/core';
import { ContainerPrincipalComponent } from '../../components/container-principal/container-principal.component';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { DashboardMetricsStripComponent } from '../../components/dashboard-metrics-strip/dashboard-metrics-strip.component';
import { DashboardUpcomingTableComponent } from '../../components/dashboard-upcoming-table/dashboard-upcoming-table.component';
import { PaginationControlsComponent } from '../../components/pagination-controls/pagination-controls.component';
import { DashboardStateService } from '../../services/dashboard-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ContainerPrincipalComponent,
    LoadingIndicatorComponent,
    DashboardMetricsStripComponent,
    DashboardUpcomingTableComponent,
    PaginationControlsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly dashboardState = inject(DashboardStateService);

  readonly loading = this.dashboardState.loading.asReadonly();
  readonly error = this.dashboardState.error.asReadonly();
  readonly proximosJogos = this.dashboardState.proximosConfrontos;
  readonly pagination = this.dashboardState.pagination.asReadonly();
  readonly metricas = computed(() => {
    const resumo = this.dashboardState.resumo();

    return [
      {
        titulo: 'Total de inscrições',
        valor: String(resumo?.totalEquipes ?? 0),
        icone: 'groups',
        descricao: 'Inscrições cadastradas nas modalidades do evento.'
      },
      {
        titulo: 'Total de confrontos',
        valor: String(resumo?.totalConfrontos ?? 0),
        icone: 'sports_soccer',
        descricao: 'Partidas registradas no cronograma atual.'
      }
    ];
  });

  constructor() {
    void this.dashboardState.loadResumo();
  }

  async onPageChange(page: number) {
    await this.dashboardState.changePage(page);
  }
}
