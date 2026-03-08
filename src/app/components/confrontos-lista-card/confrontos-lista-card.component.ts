import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Confronto } from '../../models/confronto.model';
import { Equipe } from '../../models/equipe.model';

@Component({
  selector: 'app-confrontos-lista-card',
  standalone: true,
  imports: [],
  templateUrl: './confrontos-lista-card.component.html',
  styleUrl: './confrontos-lista-card.component.css'
})
export class ConfrontosListaCardComponent {
  @Input() confrontos: Confronto[] = [];
    @Input() equipes: Equipe[] = [];
    @Output() editarConfrontoClicado = new EventEmitter<Confronto>();
    @Output() editarPlacarClicado = new EventEmitter<Confronto>();
    @Output() confrontoRemovido = new EventEmitter<number>();

    placar(c: Confronto): string {
        if (c.golsA !== undefined && c.golsB !== undefined) {
            return `${c.golsA} × ${c.golsB}`;
        }
        return '—';
    }

    temPlacar(c: Confronto): boolean {
        return c.golsA !== undefined && c.golsB !== undefined;
    }
}
