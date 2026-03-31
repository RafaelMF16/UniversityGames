import { Component, Inject, Optional, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Confronto, ConfrontoPayload } from '../../models/confronto.model';
import { Equipe, MODALIDADES_EQUIPE } from '../../models/equipe.model';
import { ConfrontosStateService } from '../../services/confrontos-state.service';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

interface ConfrontoFormDialogData {
  equipes: Equipe[];
  confronto?: Confronto | null;
}

@Component({
  selector: 'app-confronto-form-card',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingIndicatorComponent],
  templateUrl: './confronto-form-card.component.html',
  styleUrl: './confronto-form-card.component.css'
})
export class ConfrontoFormCardComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly confrontosState = inject(ConfrontosStateService);

  readonly equipes: Equipe[];
  readonly confrontoEditando: Confronto | null;
  readonly modalidadesDisponiveis = MODALIDADES_EQUIPE;
  readonly salvando = signal(false);

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
        modalidade: this.confrontoEditando.modalidade,
        status: this.confrontoEditando.status
      });
    }
  }

  async salvar() {
    if (this.form.invalid || this.salvando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);

    const values = this.form.getRawValue();
    const payload: ConfrontoPayload = {
      equipeA: values.equipeA,
      equipeB: values.equipeB,
      data: values.data,
      horario: values.horario,
      local: values.local,
      modalidade: values.modalidade as NonNullable<Confronto['modalidade']>,
      status: values.status as NonNullable<Confronto['status']>,
      golsA: this.confrontoEditando?.golsA,
      golsB: this.confrontoEditando?.golsB,
      destaque: this.confrontoEditando?.destaque,
      periodoAtual: this.confrontoEditando?.periodoAtual,
      duracao: this.confrontoEditando?.duracao,
      fase: this.confrontoEditando?.fase
    };

    const resultado = this.confrontoEditando
      ? await this.confrontosState.updateConfronto(this.confrontoEditando.id, payload)
      : await this.confrontosState.createConfronto(payload);

    this.salvando.set(false);

    if (resultado) {
      this.dialogRef.close(resultado);
    }
  }

  cancelar() {
    if (!this.salvando()) {
      this.dialogRef.close();
    }
  }

  isInvalid(controlName: 'equipeA' | 'equipeB' | 'data' | 'horario' | 'local' | 'modalidade' | 'status') {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: 'equipeA' | 'equipeB' | 'data' | 'horario' | 'local' | 'modalidade' | 'status') {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'Este campo é obrigatório.';
    }

    if (control.hasError('minlength')) {
      return 'Informe pelo menos 3 caracteres.';
    }

    return '';
  }
}
