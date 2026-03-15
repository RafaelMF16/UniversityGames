import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";
import { Equipe } from '../../models/equipe.model';
import { LinhaMembroEquipeComponent } from "../linha-membro-equipe/linha-membro-equipe.component";

@Component({
  selector: 'app-equipe-card',
  standalone: true,
  imports: [FormsModule, MatIcon, LinhaMembroEquipeComponent],
  templateUrl: './equipe-card.component.html',
  styleUrl: './equipe-card.component.css'
})
export class EquipeCardComponent {
  @Input() equipe!: Equipe;
  @Output() equipeEditada = new EventEmitter<Equipe>();
  @Output() equipeRemovida = new EventEmitter<number>();

  expandido = false;
  adicionandoMembro = false;
  novoNome = '';
  novasHabilidades: string[] = [];

  habilidadesDisponiveis = [
    'Ataque', 'Defesa', 'Velocidade', 'Lideranca', 'Passe', 'Resistencia',
    'Tatica', 'Comunicacao', 'Drible', 'Finalizacao'
  ];

  toggleHabilidade(habilidade: string) {
    if (this.novasHabilidades.includes(habilidade)) {
      this.novasHabilidades = this.novasHabilidades.filter((item) => item !== habilidade);
      return;
    }

    this.novasHabilidades.push(habilidade);
  }

  confirmarMembro() {
    if (!this.novoNome) {
      return;
    }

    this.equipe.membros.push({
      id: Date.now(),
      nome: this.novoNome,
      funcao: this.equipe.membros.length === 0 ? 'Capitao' : 'Membro',
      habilidades: [...this.novasHabilidades]
    });

    this.novoNome = '';
    this.novasHabilidades = [];
    this.adicionandoMembro = false;
  }

  onMembroRemovido(id: number) {
    this.equipe.membros = this.equipe.membros.filter((membro) => membro.id !== id);
  }
}
