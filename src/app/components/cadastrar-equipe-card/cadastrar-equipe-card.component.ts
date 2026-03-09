import { Component, EventEmitter, Output } from '@angular/core';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButton } from "@angular/material/button";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastrar-equipe-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './cadastrar-equipe-card.component.html',
  styleUrl: './cadastrar-equipe-card.component.css'
})
export class CadastrarEquipeCardComponent {
  @Output() equipeAdicionada = new EventEmitter();

  nome = '';
  responsavel = '';
  email = '';

  cadastrar() {
    if (!this.nome || !this.responsavel || !this.email) return;

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
