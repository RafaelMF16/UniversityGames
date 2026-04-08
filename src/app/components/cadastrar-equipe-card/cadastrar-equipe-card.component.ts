import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CURSOS_DISPONIVEIS, PERIODOS_DISPONIVEIS } from '../../models/academic-options.model';
import {
  CategoriaEsporte,
  Equipe,
  EquipePayload,
  ModalidadeEquipe,
  ModalidadeEsporteConfig
} from '../../models/equipe.model';
import { Usuario } from '../../models/usuario.model';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-cadastrar-equipe-card',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingIndicatorComponent],
  templateUrl: './cadastrar-equipe-card.component.html',
  styleUrl: './cadastrar-equipe-card.component.css'
})
export class CadastrarEquipeCardComponent implements OnChanges {
  @Input() equipeEditando: Equipe | null = null;
  @Input() salvando = false;
  @Input() categoria: CategoriaEsporte = 'coletivo';
  @Input() modalidadesDisponiveis: ModalidadeEsporteConfig[] = [];
  @Input() usuarioAtual: Usuario | null = null;
  @Input() individualAutopreenchido = false;
  @Input() modalidadesIndividuaisBloqueadas: ModalidadeEquipe[] = [];
  @Output() equipeAdicionada = new EventEmitter<EquipePayload>();
  @Output() equipeAtualizada = new EventEmitter<EquipePayload>();
  @Output() cancelarEdicao = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);
  readonly periodosDisponiveis = PERIODOS_DISPONIVEIS;
  readonly cursosDisponiveis = CURSOS_DISPONIVEIS;

  readonly form = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    curso: ['', [Validators.required, Validators.minLength(2)]],
    periodo: ['', [Validators.required, Validators.minLength(1)]],
    modalidade: ['' as '' | ModalidadeEquipe, Validators.required]
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modalidadesDisponiveis'] && !this.equipeEditando) {
      this.garantirModalidadeValida();
    }

    if (this.equipeEditando) {
      this.form.controls.periodo.enable({ emitEvent: false });
      this.form.patchValue({
        nome: this.equipeEditando.nome,
        curso: this.equipeEditando.curso,
        periodo: this.equipeEditando.periodo,
        modalidade: this.equipeEditando.modalidade
      });
      return;
    }

    if (this.periodoTravadoPeloCapitao) {
      this.form.controls.periodo.setValue(this.usuarioAtual?.periodo ?? '', { emitEvent: false });
      this.form.controls.periodo.disable({ emitEvent: false });
    } else {
      this.form.controls.periodo.enable({ emitEvent: false });
    }

    this.limparFormulario();
  }

  get titulo() {
    if (this.equipeEditando) {
      return this.ehColetivo ? 'Editar equipe' : 'Editar inscrição individual';
    }

    return this.ehColetivo ? 'Cadastrar equipe' : 'Confirmar inscrição individual';
  }

  get descricao() {
    if (this.ehColetivo) {
      return 'Preencha os dados principais da equipe para concluir o cadastro.';
    }

    if (this.individualAutopreenchido) {
      return 'Seus dados da conta serão usados automaticamente para concluir a inscrição.';
    }

    return 'Cadastre o atleta com os dados principais da inscrição individual.';
  }

  get ehColetivo() {
    return this.categoria === 'coletivo';
  }

  get individualUsaDadosDaConta() {
    return !this.ehColetivo && this.individualAutopreenchido && !!this.usuarioAtual;
  }

  get periodoTravadoPeloCapitao() {
    return this.ehColetivo && !this.equipeEditando && this.usuarioAtual?.role === 'capitao' && !!this.usuarioAtual?.periodo;
  }

  get modalidadeBloqueada() {
    const modalidade = this.form.controls.modalidade.value;
    if (!modalidade) {
      return false;
    }

    if (this.equipeEditando?.modalidade === modalidade) {
      return false;
    }

    return this.modalidadesIndividuaisBloqueadas.includes(modalidade);
  }

  salvar() {
    if (this.form.invalid || this.salvando || this.modalidadeBloqueada) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const payload: EquipePayload = {
      nome: this.individualUsaDadosDaConta ? this.usuarioAtual?.nome ?? '' : values.nome?.trim() ?? '',
      responsavel: this.ehColetivo ? this.equipeEditando?.responsavel ?? null : null,
      curso: this.individualUsaDadosDaConta ? this.usuarioAtual?.curso ?? '' : values.curso?.trim() ?? '',
      periodo: this.individualUsaDadosDaConta || this.periodoTravadoPeloCapitao
        ? this.usuarioAtual?.periodo ?? ''
        : values.periodo?.trim() ?? '',
      modalidade: values.modalidade as ModalidadeEquipe,
      usuarioId: !this.ehColetivo && (this.usuarioAtual?.role === 'visitante' || this.usuarioAtual?.role === 'capitao')
        ? this.usuarioAtual.id
        : this.equipeEditando?.usuarioId ?? null,
      membros: this.equipeEditando?.membros.map((membro) => ({
        id: membro.id,
        nome: membro.nome,
        habilidades: membro.habilidades,
        funcao: membro.funcao
      })) ?? []
    };

    if (this.equipeEditando) {
      this.equipeAtualizada.emit(payload);
      return;
    }

    this.equipeAdicionada.emit(payload);
    this.limparFormulario();
  }

  onCancelarEdicao() {
    if (this.salvando) {
      return;
    }

    this.limparFormulario();
    this.cancelarEdicao.emit();
  }

  isInvalid(controlName: 'nome' | 'curso' | 'periodo' | 'modalidade') {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: 'nome' | 'curso' | 'periodo' | 'modalidade') {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'Este campo é obrigatório.';
    }

    if (control.hasError('minlength')) {
      return controlName === 'periodo'
        ? 'Informe um período válido.'
        : 'Informe pelo menos 2 caracteres.';
    }

    return '';
  }

  private limparFormulario() {
    this.form.reset({
      nome: this.individualUsaDadosDaConta ? this.usuarioAtual?.nome ?? '' : '',
      curso: this.individualUsaDadosDaConta ? this.usuarioAtual?.curso ?? '' : '',
      periodo: this.individualUsaDadosDaConta || this.periodoTravadoPeloCapitao ? this.usuarioAtual?.periodo ?? '' : '',
      modalidade: ''
    });
  }

  private garantirModalidadeValida() {
    const modalidadeAtual = this.form.controls.modalidade.value;
    if (!modalidadeAtual) {
      return;
    }

    const existe = this.modalidadesDisponiveis.some((item) => item.valor === modalidadeAtual);
    if (!existe) {
      this.form.controls.modalidade.setValue('');
    }
  }
}
