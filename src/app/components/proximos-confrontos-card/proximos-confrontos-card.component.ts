import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { getModalidadeLabel } from '../../models/equipe.model';

@Component({
  selector: 'app-proximos-confrontos-card',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './proximos-confrontos-card.component.html',
  styleUrl: './proximos-confrontos-card.component.css'
})
export class ProximosConfrontosCardComponent {
  @Input({ required: true }) confronto!: {
    equipeA: string;
    equipeB: string;
    horario: string;
    data: string;
    local: string;
    modalidade: string;
  };

  modalidadeLabel() {
    return getModalidadeLabel(this.confronto.modalidade);
  }
}
