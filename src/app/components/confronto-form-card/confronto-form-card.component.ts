import { Component, Inject, Optional, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Confronto } from '../../models/confronto.model';
import { Equipe } from '../../models/equipe.model';

interface ConfrontoFormDialogData {
  equipes: Equipe[];
  confronto?: Confronto | null;
}

@Component({
  selector: 'app-confronto-form-card',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './confronto-form-card.component.html',
  styleUrl: './confronto-form-card.component.css'
})
export class ConfrontoFormCardComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly equipes: Equipe[];
  readonly confrontoEditando: Confronto | null;
  readonly modalidadesDisponiveis = ['Futsal', 'Volei', 'Basquete', 'Natacao', 'Atletismo'];

  readonly form = this.formBuilder.nonNullable.group({
    equipeA: ['', Validators.required],
    equipeB: ['', Validators.required],
    data: ['', Validators.required],
    horario: ['', Validators.required],
    local: ['', [Validators.required, Validators.minLength(3)]],
    modalidade: ['', Validators.required],
    status: ['' as '' | NonNullable<Confronto['status']>, Validators.required]
  });

  constructor(
    private readonly dialogRef: MatDialogRef<ConfrontoFormCardComponent, Confronto | undefined>,
    @Optional() @Inject(MAT_DIALOG_DATA) data: ConfrontoFormDialogData | null
  ) {
    this.equipes = data?.equipes ?? [];
    this.confrontoEditando = data?.confronto ?? null;

    if (this.confrontoEditando) {
      this.form.patchValue({
        equipeA: this.confrontoEditando.equipeA,
        equipeB: this.confrontoEditando.equipeB,
        data: this.confrontoEditando.data,
        horario: this.confrontoEditando.horario,
        local: this.confrontoEditando.local,
        modalidade: this.confrontoEditando.modalidade ?? 'Futsal',
        status: this.confrontoEditando.status ?? 'agendado'
      });
    }
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const modalidade = values.modalidade as NonNullable<Confronto['modalidade']>;
    const status = values.status as NonNullable<Confronto['status']>;

    this.dialogRef.close({
      ...this.confrontoEditando,
      ...values,
      modalidade,
      status,
      id: this.confrontoEditando?.id ?? Date.now()
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  isInvalid(controlName: 'equipeA' | 'equipeB' | 'data' | 'horario' | 'local' | 'modalidade' | 'status') {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: 'equipeA' | 'equipeB' | 'data' | 'horario' | 'local' | 'modalidade' | 'status') {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'Este campo e obrigatorio.';
    }

    if (control.hasError('minlength')) {
      return 'Informe pelo menos 3 caracteres.';
    }

    return '';
  }
}
