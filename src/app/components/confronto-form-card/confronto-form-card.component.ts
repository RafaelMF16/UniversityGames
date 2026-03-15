import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Confronto } from '../../models/confronto.model';
import { Equipe } from '../../models/equipe.model';

@Component({
  selector: 'app-confronto-form-card',
  standalone: true,
  imports: [FormsModule, MatIcon],
  templateUrl: './confronto-form-card.component.html',
  styleUrl: './confronto-form-card.component.css'
})
export class ConfrontoFormCardComponent {
  @Input() equipes: Equipe[] = [];
  @Input() confrontoEditando: Confronto | null = null;
  @Output() confrontoCriado = new EventEmitter<Confronto>();
  @Output() confrontoAtualizado = new EventEmitter<Confronto>();
  @Output() cancelarEdicao = new EventEmitter<void>();

  form: Partial<Confronto> = {};

  ngOnChanges() {
    if (this.confrontoEditando) {
      this.form = { ...this.confrontoEditando };
      return;
    }

    this.resetForm();
  }

  criar() {
    if (!this.form.equipeA || !this.form.equipeB || !this.form.data || !this.form.horario || !this.form.local) {
      return;
    }

    this.confrontoCriado.emit({
      ...this.form,
      id: Date.now(),
      modalidade: 'Futsal',
      status: 'agendado'
    } as Confronto);
    this.resetForm();
  }

  salvar() {
    if (!this.form.id) {
      return;
    }

    this.confrontoAtualizado.emit({
      ...this.form
    } as Confronto);
    this.resetForm();
  }

  resetForm() {
    this.form = {
      equipeA: '',
      equipeB: '',
      data: '',
      horario: '',
      local: ''
    };
  }
}
