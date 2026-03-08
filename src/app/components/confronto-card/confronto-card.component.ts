import { Component, Input } from '@angular/core';
import { Confronto } from '../../models/confronto.model';

@Component({
  selector: 'app-confronto-card',
  standalone: true,
  imports: [],
  templateUrl: './confronto-card.component.html',
  styleUrl: './confronto-card.component.css'
})
export class ConfrontoCardComponent {
  @Input() confronto!: Confronto;

    get temPlacar(): boolean {
        return this.confronto.golsA !== undefined && this.confronto.golsB !== undefined;
    }
}
