import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Confronto } from '../../models/confronto.model';

@Component({
  selector: 'app-confronto-card',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './confronto-card.component.html',
  styleUrl: './confronto-card.component.css'
})
export class ConfrontoCardComponent {
  @Input() confronto!: Confronto;

  get temPlacar(): boolean {
    return this.confronto.golsA !== undefined && this.confronto.golsB !== undefined;
  }

  get statusLabel(): string {
    if (this.confronto.status === 'ao-vivo') {
      return 'Live';
    }

    if (this.confronto.status === 'encerrado') {
      return 'Finished';
    }

    return 'Upcoming';
  }
}
