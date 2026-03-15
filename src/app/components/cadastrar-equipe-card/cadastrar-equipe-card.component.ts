import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Equipe } from '../../models/equipe.model';

@Component({
  selector: 'app-cadastrar-equipe-card',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cadastrar-equipe-card.component.html',
  styleUrl: './cadastrar-equipe-card.component.css'
})
export class CadastrarEquipeCardComponent {
  @Input() equipeEditando: Equipe | null = null;
  @Output() equipeAdicionada = new EventEmitter<Equipe>();
  @Output() equipeAtualizada = new EventEmitter<Equipe>();
  @Output() cancelarEdicao = new EventEmitter<void>();

  nome = '';
  responsavel = '';
  email = '';

  ngOnChanges() {
    if (this.equipeEditando) {
      this.nome = this.equipeEditando.nome;
      this.responsavel = this.equipeEditando.responsavel;
      this.email = this.equipeEditando.email;
      return;
    }

    this.limparFormulario();
  }

  salvar() {
    if (!this.nome || !this.responsavel || !this.email) {
      return;
    }

    if (this.equipeEditando) {
      this.equipeAtualizada.emit({
        ...this.equipeEditando,
        nome: this.nome,
        responsavel: this.responsavel,
        email: this.email
      });
      return;
    }

    this.equipeAdicionada.emit({
      id: Date.now(),
      nome: this.nome,
      responsavel: this.responsavel,
      email: this.email,
      membros: []
    });

    this.limparFormulario();
  }

  onCancelarEdicao() {
    this.limparFormulario();
    this.cancelarEdicao.emit();
  }

  private limparFormulario() {
    this.nome = '';
    this.responsavel = '';
    this.email = '';
  }
}
