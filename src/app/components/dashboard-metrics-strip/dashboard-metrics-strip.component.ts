import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

export interface DashboardMetricItem {
  titulo: string;
  valor: string;
  descricao?: string;
  icone?: string;
}

@Component({
  selector: 'app-dashboard-metrics-strip',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './dashboard-metrics-strip.component.html',
  styleUrl: './dashboard-metrics-strip.component.css'
})
export class DashboardMetricsStripComponent {
  readonly items = input.required<DashboardMetricItem[]>();
}
