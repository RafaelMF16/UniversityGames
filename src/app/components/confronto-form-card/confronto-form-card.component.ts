import { Component, Inject, Optional, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Confronto, ConfrontoPayload } from '../../models/confronto.model';
import {
  CategoriaEsporte,
  Equipe,
  MODALIDADES_CONFIG,
  ModalidadeEquipe,
  getModalidadeConfig
} from '../../models/equipe.model';
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
  readonly salvando = signal(false);
  readonly categoriaSelecionada = signal<CategoriaEsporte>('coletivo');
  readonly modalidadesDisponiveis = computed(() =>
    MODALIDADES_CONFIG.filter((modalidade) => modalidade.categoria === this.categoriaSelecionada())
  );
  readonly participantesDisponiveis = computed(() => {
    const modalidade = this.form.controls.modalidade.value;
    const categoria = this.categoriaSelecionada();

    return this.equipes.filter((item) => {
      const config = getModalidadeConfig(item.modalidade);
      if (!config || config.categoria !== categoria) {
        return false;
      }

      if (modalidade) {
        return item.modalidade === modalidade;
      }

      return true;
    });
  });

  readonly form = this.formBuilder.nonNullable.group({
    equipeA: ['', Validators.required],
    equipeB: ['', Validators.required],
    data: ['', Validators.required],
    horario: ['', Validators.required],
    local: ['', [Validators.required, Validators.minLength(3)]],
    modalidade: ['' as '' | ModalidadeEquipe, Validators.required],
    status: ['' as '' | NonNullable<Confronto['status']>, Validators.required]
  });

  constructor(
    private readonly dialogRef: MatDialogRef<ConfrontoFormCardComponent, Confronto | undefined>,
    @Optional() @Inject(MAT_DIALOG_DATA) data: ConfrontoFormDialogData | null
  ) {
    this.equipes = data?.equipes ?? [];
    this.confrontoEditando = data?.confronto ?? null;

    if (this.confrontoEditando) {
      const config = getModalidadeConfig(this.confrontoEditando.modalidade);
      this.categoriaSelecionada.set(config?.categoria ?? 'coletivo');
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

    this.form.controls.modalidade.valueChanges.subscribe(() => {
      this.form.controls.equipeA.setValue('');
      this.form.controls.equipeB.setValue('');
    });
  }

  get titulo() {
    return this.confrontoEditando ? 'Editar confronto' : 'Cadastrar confronto';
  }

  get subtitulo() {
    return this.categoriaSelecionada() === 'coletivo'
      ? 'Defina equipes, horário, local e modalidade da partida coletiva.'
      : 'Defina atletas, horário, local e modalidade da disputa individual.';
  }

  get labelParticipanteA() {
    return this.categoriaSelecionada() === 'coletivo' ? 'Equipe A' : 'Atleta A';
  }

  get labelParticipanteB() {
    return this.categoriaSelecionada() === 'coletivo' ? 'Equipe B' : 'Atleta B';
  }

  selecionarCategoria(categoria: CategoriaEsporte) {
    if (this.categoriaSelecionada() === categoria) {
      return;
    }

    this.categoriaSelecionada.set(categoria);
    this.form.patchValue({
      equipeA: '',
      equipeB: '',
      modalidade: ''
    });
  }

  async salvar() {
    if (this.form.invalid || this.salvando()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    if (values.equipeA === values.equipeB) {
      this.form.controls.equipeB.setErrors({ duplicate: true });
      this.form.controls.equipeB.markAsTouched();
      return;
    }

    this.salvando.set(true);

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

    if (control.hasError('duplicate')) {
      return 'Selecione participantes diferentes.';
    }

    return '';
  }
}
