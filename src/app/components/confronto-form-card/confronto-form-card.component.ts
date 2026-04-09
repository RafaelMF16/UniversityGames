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
import { formatarHorarioConfronto, normalizarHorarioConfrontoParaEnvio } from '../../utils/horario-confronto.util';
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
  readonly modalidadeSelecionada = signal<ModalidadeEquipe | ''>('');
  readonly modalidadesDisponiveis = computed(() =>
    MODALIDADES_CONFIG.filter((modalidade) => modalidade.categoria === this.categoriaSelecionada())
  );
  readonly categoriaTravada = computed(() => !!this.confrontoEditando);
  readonly participantesDisponiveis = computed(() => {
    const modalidade = this.modalidadeSelecionada();
    if (!modalidade) {
      return [];
    }

    return this.equipes.filter((item) => {
      const config = getModalidadeConfig(item.modalidade);
      return !!config && config.categoria === this.categoriaSelecionada() && item.modalidade === modalidade;
    });
  });

  readonly form = this.formBuilder.nonNullable.group({
    participanteAId: [{ value: 0, disabled: true }, [Validators.required, Validators.min(1)]],
    participanteBId: [{ value: 0, disabled: true }, [Validators.required, Validators.min(1)]],
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
      this.modalidadeSelecionada.set(this.confrontoEditando.modalidade);
      this.form.patchValue({
        participanteAId: this.findParticipanteId(this.confrontoEditando.participanteAId, this.confrontoEditando.equipeA),
        participanteBId: this.findParticipanteId(this.confrontoEditando.participanteBId, this.confrontoEditando.equipeB),
        data: this.confrontoEditando.data,
        horario: this.normalizarHorarioParaInput(this.confrontoEditando.horario),
        local: this.confrontoEditando.local,
        modalidade: this.confrontoEditando.modalidade,
        status: this.confrontoEditando.status
      });
    }

    this.form.controls.modalidade.valueChanges.subscribe((modalidade) => {
      this.modalidadeSelecionada.set(modalidade ?? '');
      this.atualizarEstadoParticipantes(!!modalidade);
    });

    this.atualizarEstadoParticipantes(!!this.form.controls.modalidade.value, !this.confrontoEditando);
  }

  get titulo() {
    return this.confrontoEditando ? 'Editar confronto' : 'Cadastrar confronto';
  }

  get subtitulo() {
    return this.categoriaSelecionada() === 'coletivo'
      ? 'Defina equipes, horario, local e modalidade da partida coletiva.'
      : 'Defina atletas, horario, local e modalidade da disputa individual.';
  }

  get labelParticipanteA() {
    return this.categoriaSelecionada() === 'coletivo' ? 'Equipe A' : 'Atleta A';
  }

  get labelParticipanteB() {
    return this.categoriaSelecionada() === 'coletivo' ? 'Equipe B' : 'Atleta B';
  }

  selecionarCategoria(categoria: CategoriaEsporte) {
    if (this.categoriaTravada()) {
      return;
    }

    if (this.categoriaSelecionada() === categoria) {
      return;
    }

    this.categoriaSelecionada.set(categoria);
    this.modalidadeSelecionada.set('');
    this.form.patchValue({
      participanteAId: 0,
      participanteBId: 0,
      modalidade: ''
    });
    this.atualizarEstadoParticipantes(false);
  }

  async salvar() {
    if (this.form.invalid || this.salvando()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    if (values.participanteAId === values.participanteBId) {
      this.form.controls.participanteBId.setErrors({ duplicate: true });
      this.form.controls.participanteBId.markAsTouched();
      return;
    }

    const participanteA = this.participantesDisponiveis().find((item) => item.id === values.participanteAId);
    const participanteB = this.participantesDisponiveis().find((item) => item.id === values.participanteBId);

    if (!participanteA || !participanteB) {
      this.form.controls.participanteAId.setErrors({ required: true });
      this.form.controls.participanteBId.setErrors({ required: true });
      return;
    }

    this.salvando.set(true);

    const payload: ConfrontoPayload = {
      equipeA: participanteA.nome,
      equipeB: participanteB.nome,
      participanteAId: participanteA.id,
      participanteBId: participanteB.id,
      data: values.data,
      horario: normalizarHorarioConfrontoParaEnvio(values.horario),
      local: values.local,
      modalidade: values.modalidade as NonNullable<Confronto['modalidade']>,
      status: values.status as NonNullable<Confronto['status']>,
      golsA: this.confrontoEditando?.golsA,
      golsB: this.confrontoEditando?.golsB,
      vencedor: this.confrontoEditando?.vencedor ?? null,
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

  isInvalid(controlName: 'participanteAId' | 'participanteBId' | 'data' | 'horario' | 'local' | 'modalidade' | 'status') {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: 'participanteAId' | 'participanteBId' | 'data' | 'horario' | 'local' | 'modalidade' | 'status') {
    const control = this.form.controls[controlName];

    if (control.hasError('required') || control.hasError('min')) {
      return 'Este campo e obrigatorio.';
    }

    if (control.hasError('minlength')) {
      return 'Informe pelo menos 3 caracteres.';
    }

    if (control.hasError('duplicate')) {
      return 'Selecione participantes diferentes.';
    }

    return '';
  }

  private findParticipanteId(id: number | null | undefined, nome: string) {
    if (id) {
      return id;
    }

    return this.equipes.find((item) => item.nome === nome)?.id ?? 0;
  }

  private normalizarHorarioParaInput(horario: string | null | undefined) {
    return formatarHorarioConfronto(horario);
  }

  private atualizarEstadoParticipantes(habilitado: boolean, resetarParticipantes = true) {
    const participanteAControl = this.form.controls.participanteAId;
    const participanteBControl = this.form.controls.participanteBId;

    if (resetarParticipantes) {
      participanteAControl.setValue(0, { emitEvent: false });
      participanteBControl.setValue(0, { emitEvent: false });
    }

    if (habilitado) {
      participanteAControl.enable({ emitEvent: false });
      participanteBControl.enable({ emitEvent: false });
      return;
    }

    participanteAControl.disable({ emitEvent: false });
    participanteBControl.disable({ emitEvent: false });
  }
}
