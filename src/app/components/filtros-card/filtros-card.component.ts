import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface VisualizacaoFiltros {
  data: string;
  equipe: string;
  modalidade: string;
  local: string;
}

@Component({
  selector: 'app-filtros-card',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filtros-card.component.html',
  styleUrl: './filtros-card.component.css'
})
export class FiltrosCardComponent {
  @Input() equipes: string[] = [];
  @Input() modalidades: string[] = [];
  @Input() locais: string[] = [];
  @Output() filtrosChange = new EventEmitter<VisualizacaoFiltros>();

  filtros: VisualizacaoFiltros = {
    data: 'Oct 24, 2023',
    equipe: '',
    modalidade: '',
    local: ''
  };

  emitirFiltros() {
    this.filtrosChange.emit({ ...this.filtros });
  }
}
