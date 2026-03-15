import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './dashboard-card.component.html',
  styleUrl: './dashboard-card.component.css'
})
export class DashboardCardComponent {
  @Input() titulo: string = '';
  @Input() valor: string = '';
  @Input() icone: string = '';
  @Input() descricao: string = '';
  @Input() destaque: string = '';
  @Input() destaqueTipo: 'primary' | 'success' | 'warning' = 'primary';
}
