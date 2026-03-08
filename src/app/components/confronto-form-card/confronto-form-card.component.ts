import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Confronto } from '../../models/confronto.model';
import { Equipe } from '../../models/equipe.model';
import { MatButton, MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confronto-form-card',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatButtonModule
  ],
  templateUrl: './confronto-form-card.component.html',
  styleUrl: './confronto-form-card.component.css'
})
export class ConfrontoFormCardComponent {
  @Input() equipes: Equipe[] = [];
  @Input() confrontoEditando: Confronto | null = null;
  @Output() confrontoCriado = new EventEmitter<Confronto>();
  @Output() confrontoAtualizado = new EventEmitter<Confronto>();
  @Output() cancelarEdicao = new EventEmitter();

  form: Partial<Confronto> = {};

  ngOnChanges() {
    if (this.confrontoEditando) {
      this.form = { ...this.confrontoEditando };
    } else {
      this.resetForm();
    }
  }

  criar() {
    if (!this.form.equipeA || !this.form.equipeB) return;
    this.confrontoCriado.emit({ ...this.form, id: Date.now() } as Confronto);
    this.resetForm();
  }

  salvar() {
    this.confrontoAtualizado.emit(this.form as Confronto);
  }

  resetForm() {
    this.form
  }
}