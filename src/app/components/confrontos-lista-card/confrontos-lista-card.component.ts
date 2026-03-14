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
  @Output() editarConfrontoClicado = new EventEmitter<Confronto>();
  @Output() editarPlacarClicado = new EventEmitter<Confronto>();
  @Output() confrontoRemovido = new EventEmitter<number>();

  busca = '';

  get confrontosFiltrados(): Confronto[] {
    const termo = this.busca.trim().toLowerCase();
    if (!termo) {
      return this.confrontos;
    }

    return this.confrontos.filter((confronto) =>
      `${confronto.equipeA} ${confronto.equipeB}`.toLowerCase().includes(termo)
    );
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
