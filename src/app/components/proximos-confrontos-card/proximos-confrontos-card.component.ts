import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

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
}
