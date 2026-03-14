import { Component, EventEmitter, Output } from '@angular/core';
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
  @Output() equipeAdicionada = new EventEmitter<Equipe>();

  nome = '';
  responsavel = '';
  email = '';

  cadastrar() {
    if (!this.nome || !this.responsavel || !this.email) {
      return;
    }

    this.equipeAdicionada.emit({
      id: Date.now(),
      nome: this.nome,
      responsavel: this.responsavel,
      email: this.email,
      membros: []
    });

    this.nome = '';
    this.responsavel = '';
    this.email = '';
  }
}
