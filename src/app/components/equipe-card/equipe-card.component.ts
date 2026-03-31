import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";
import { Equipe } from '../../models/equipe.model';
import { LinhaMembroEquipeComponent } from "../linha-membro-equipe/linha-membro-equipe.component";
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-equipe-card',
  standalone: true,
  imports: [FormsModule, MatIcon, LinhaMembroEquipeComponent, LoadingIndicatorComponent],
  templateUrl: './equipe-card.component.html',
  styleUrl: './equipe-card.component.css'
})
export class EquipeCardComponent {
  @Input() equipe!: Equipe;
  @Input() salvando = false;
  @Input() removendo = false;
  @Input() podeEditar = false;
  @Input() podeExcluir = false;
  @Input() podeGerenciarMembros = false;
  @Output() equipeEditada = new EventEmitter<Equipe>();
  @Output() equipeAtualizada = new EventEmitter<Equipe>();
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
    if (!this.novoNome || this.salvando || !this.podeGerenciarMembros) {
      return;
    }

    const membrosAtualizados = [
      ...this.equipe.membros,
      {
        id: Date.now(),
        nome: this.novoNome,
      funcao: this.equipe.membros.length === 0 ? 'Capitão' : 'Membro',
        habilidades: [...this.novasHabilidades]
      }
    ];

    this.equipeAtualizada.emit({ ...this.equipe, membros: membrosAtualizados });

    this.novoNome = '';
    this.novasHabilidades = [];
    this.adicionandoMembro = false;
  }

  onMembroRemovido(id: number) {
    if (!this.podeGerenciarMembros) {
      return;
    }

    this.equipeAtualizada.emit({
      ...this.equipe,
      membros: this.equipe.membros.filter((membro) => membro.id !== id)
    });
  }
}
