import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Confronto } from '../../models/confronto.model';
import { getModalidadeLabel } from '../../models/equipe.model';

@Component({
  selector: 'app-confronto-list-item',
  standalone: true,
  imports: [],
  templateUrl: './confronto-list-item.component.html',
  styleUrl: './confronto-list-item.component.css'
})
export class ConfrontoListItemComponent {
  @Input({ required: true }) confronto!: Confronto;
  @Output() verDetalhes = new EventEmitter<number>();

  modalidadeLabel() {
    return getModalidadeLabel(this.confronto.modalidade);
  }

  statusLabel() {
    if (this.confronto.status === 'encerrado') {
      return 'Finalizado';
    }

    if (this.confronto.status === 'ao-vivo') {
      return 'Ao vivo';
    }

    return 'Agendado';
  }
}
