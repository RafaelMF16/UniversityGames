import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Confronto } from '../../models/confronto.model';
import { getModalidadeLabel } from '../../models/equipe.model';

@Component({
  selector: 'app-dashboard-upcoming-table',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-upcoming-table.component.html',
  styleUrl: './dashboard-upcoming-table.component.css'
})
export class DashboardUpcomingTableComponent {
  readonly confrontos = input.required<Confronto[]>();

  modalidadeLabel(modalidade: string) {
    return getModalidadeLabel(modalidade);
  }

  formatarData(data: string) {
    if (!data) {
      return '';
    }

    const [ano, mes, dia] = data.split('-');
    if (!ano || !mes || !dia) {
      return data;
    }

    return `${dia}/${mes}/${ano}`;
  }
}
