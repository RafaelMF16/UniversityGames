import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCard, MatCardModule } from "@angular/material/card";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { LinhaMembroEquipeComponent } from "../linha-membro-equipe/linha-membro-equipe.component";
import { Equipe } from '../../models/equipe.model';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-equipe-card',
  imports: [
    MatCard,
    MatIcon,
    LinhaMembroEquipeComponent,
    MatButton,
    MatIconModule,
    MatCardModule,
    FormsModule
  ],
  templateUrl: './equipe-card.component.html',
  styleUrl: './equipe-card.component.css'
})
export class EquipeCardComponent {
  @Input() equipe!: Equipe;
  @Output() equipeEditada = new EventEmitter();
  @Output() equipeRemovida = new EventEmitter();

  expandido = false;
  adicionandoMembro = false;
  novoNome = '';
  novasHabilidades: string[] = [];

  habilidadesDisponiveis = [
    'Ataque', 'Defesa', 'Velocidade', 'Liderança', 'Goleiro',
    'Reflexo', 'Passe', 'Drible', 'Finalização', 'Resistência',
    'Tática', 'Comunicação'
  ];

  toggleHabilidade(hab: string) {
    if (this.novasHabilidades.includes(hab)) {
      this.novasHabilidades = this.novasHabilidades.filter(h => h !== hab);
    } else {
      this.novasHabilidades.push(hab);
    }
  }

  confirmarMembro() {
    if (!this.novoNome) return;

    this.equipe.membros.push({
      id: Date.now(),
      nome: this.novoNome,
      habilidades: [...this.novasHabilidades]
    });

    this.novoNome = '';
    this.novasHabilidades = [];
    this.adicionandoMembro = false;
  }

  onMembroRemovido(id: number) {
    this.equipe.membros = this.equipe.membros.filter(m => m.id !== id);
  }

  adicionarMembro() {

  }
}
