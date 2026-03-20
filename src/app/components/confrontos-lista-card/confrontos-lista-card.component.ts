import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Confronto } from '../../models/confronto.model';

@Component({
  selector: 'app-confrontos-lista-card',
  standalone: true,
  imports: [FormsModule, MatIcon],
  templateUrl: './confrontos-lista-card.component.html',
  styleUrl: './confrontos-lista-card.component.css'
})
export class ConfrontosListaCardComponent {
  @Input() confrontos: Confronto[] = [];
  @Input() equipes: string[] = [];
  @Input() locais: string[] = [];
  @Input() modalidades: string[] = [];
  @Output() editarConfrontoClicado = new EventEmitter<Confronto>();
  @Output() editarPlacarClicado = new EventEmitter<Confronto>();
  @Output() confrontoRemovido = new EventEmitter<number>();

  busca = '';
  equipeSelecionada = '';
  modalidadeSelecionada = '';
  localSelecionado = '';
  statusSelecionado = '';

  get confrontosFiltrados(): Confronto[] {
    const termo = this.busca.trim().toLowerCase();

    return this.confrontos.filter((confronto) => {
      const bateBusca = !termo || `${confronto.equipeA} ${confronto.equipeB}`.toLowerCase().includes(termo);
      const bateEquipe = !this.equipeSelecionada || confronto.equipeA === this.equipeSelecionada || confronto.equipeB === this.equipeSelecionada;
      const bateModalidade = !this.modalidadeSelecionada || confronto.modalidade === this.modalidadeSelecionada;
      const bateLocal = !this.localSelecionado || confronto.local === this.localSelecionado;
      const bateStatus = !this.statusSelecionado || confronto.status === this.statusSelecionado;

      return bateBusca && bateEquipe && bateModalidade && bateLocal && bateStatus;
    });
  }

  placar(confronto: Confronto) {
    if (confronto.golsA === undefined || confronto.golsB === undefined) {
      return '- : -';
    }

    return `${confronto.golsA} : ${confronto.golsB}`;
  }

  statusLabel(confronto: Confronto) {
    if (confronto.status === 'encerrado') {
      return 'Finalizado';
    }

    if (confronto.status === 'ao-vivo') {
      return 'Ao vivo';
    }

    return 'Agendado';
  }
}
