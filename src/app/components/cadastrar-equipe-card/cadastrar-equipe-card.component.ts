import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CURSOS_DISPONIVEIS, PERIODOS_DISPONIVEIS } from '../../models/academic-options.model';
import {
  CAPITAO_FUNCAO,
  CategoriaEsporte,
  Equipe,
  EquipePayload,
  MAX_HABILIDADES_POR_MEMBRO,
  MembroPayload,
  ModalidadeEquipe,
  ModalidadeEsporteConfig,
  modalidadeEhIndividual,
  membroEhCapitao
} from '../../models/equipe.model';
import { Usuario } from '../../models/usuario.model';
import { HabilidadesSelectorComponent } from '../habilidades-selector/habilidades-selector.component';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-cadastrar-equipe-card',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingIndicatorComponent, HabilidadesSelectorComponent],
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
  @Input() equipesReferencia: Equipe[] = [];
  @Output() equipeAdicionada = new EventEmitter<EquipePayload>();
  @Output() equipeAtualizada = new EventEmitter<EquipePayload>();
  @Output() cancelarEdicao = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);
  readonly periodosDisponiveis = PERIODOS_DISPONIVEIS;
  readonly cursosDisponiveis = CURSOS_DISPONIVEIS;
  readonly maxHabilidades = MAX_HABILIDADES_POR_MEMBRO;

  readonly form = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    curso: ['', [Validators.required, Validators.minLength(2)]],
    periodo: ['', [Validators.required, Validators.minLength(1)]],
    modalidade: ['' as '' | ModalidadeEquipe, Validators.required]
  });

  readonly captainForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    habilidades: this.formBuilder.nonNullable.control<string[]>([])
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modalidadesDisponiveis'] && !this.equipeEditando) {
      this.garantirModalidadeValida();
    }

    if (
      changes['equipeEditando']
      || changes['categoria']
      || changes['usuarioAtual']
      || changes['individualAutopreenchido']
    ) {
      this.aplicarEstadoDoFormulario();
    }
  }

  get titulo() {
    if (this.equipeEditando) {
      return this.ehColetivo ? 'Editar equipe' : 'Editar inscricao individual';
    }

    return this.ehColetivo ? 'Cadastrar equipe' : 'Confirmar inscricao individual';
  }

  get descricao() {
    if (!this.ehColetivo) {
      return this.individualUsaDadosDaConta
        ? 'Seus dados da conta serao usados automaticamente para concluir a inscricao.'
        : 'Cadastre o atleta com os dados principais da inscricao individual.';
    }

    return 'Cadastre a equipe com os dados do capitao. Os demais integrantes serao adicionados depois, na tela de detalhes.';
  }

  get ehColetivo() {
    return this.categoria === 'coletivo';
  }

  get individualUsaDadosDaConta() {
    return !this.ehColetivo && this.individualAutopreenchido && !!this.usuarioAtual;
  }

  get usuarioEhCapitao() {
    return this.usuarioAtual?.role === 'capitao';
  }

  get dadosDaEquipeTravadosPeloCapitao() {
    return this.ehColetivo && this.usuarioEhCapitao && !!this.usuarioAtual?.curso && !!this.usuarioAtual?.periodo;
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

  get modalidadeSelecionada() {
    return this.form.controls.modalidade.value || this.equipeEditando?.modalidade || null;
  }

  get nomeDuplicado() {
    if (!this.ehColetivo) {
      return false;
    }

    const nome = this.form.controls.nome.value?.trim();
    const modalidade = this.modalidadeSelecionada;
    if (!nome || !modalidade || modalidadeEhIndividual(modalidade)) {
      return false;
    }

    const nomeNormalizado = this.normalizarNome(nome);
    return this.equipesReferencia.some((equipe) =>
      equipe.id !== this.equipeEditando?.id
      && equipe.modalidade === modalidade
      && this.normalizarNome(equipe.nome) === nomeNormalizado
    );
  }

  get membrosPayload() {
    if (!this.ehColetivo) {
      return [];
    }

    const capitao = this.capitaoPayload;
    return capitao ? [capitao] : [];
  }

  get capitaoPayload(): MembroPayload | null {
    if (!this.ehColetivo) {
      return null;
    }

    const nome = this.nomeCapitaoAtual;

    if (!nome) {
      return null;
    }

    const membroBase = this.obterMembroCapitaoExistente();
    return {
      id: membroBase?.id,
      nome,
      habilidades: this.habilidadesSelecionadasCapitao,
      funcao: CAPITAO_FUNCAO,
      usuarioId: this.usuarioEhCapitao ? this.usuarioAtual?.id ?? null : membroBase?.usuarioId ?? null
    };
  }

  get habilidadesSelecionadasCapitao() {
    return this.lerHabilidadesSelecionadas(this.captainForm.getRawValue().habilidades);
  }

  get nomeCapitaoAtual() {
    const capitaoExistente = this.obterMembroCapitaoExistente()?.nome?.trim();
    return this.usuarioAtual?.nome?.trim() || capitaoExistente || this.captainForm.getRawValue().nome?.trim() || '';
  }

  salvar() {
    if (this.form.invalid || this.salvando || this.modalidadeBloqueada || this.nomeDuplicado) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.ehColetivo && !this.validarFormularioColetivo()) {
      return;
    }

    const values = this.form.getRawValue();
    const payload: EquipePayload = {
      nome: this.individualUsaDadosDaConta ? this.usuarioAtual?.nome ?? '' : values.nome?.trim() ?? '',
      responsavel: this.ehColetivo ? this.capitaoPayload?.nome ?? null : null,
      curso: this.individualUsaDadosDaConta || this.dadosDaEquipeTravadosPeloCapitao
        ? this.usuarioAtual?.curso ?? ''
        : values.curso?.trim() ?? '',
      periodo: this.individualUsaDadosDaConta || this.dadosDaEquipeTravadosPeloCapitao
        ? this.usuarioAtual?.periodo ?? ''
        : values.periodo?.trim() ?? '',
      modalidade: values.modalidade as ModalidadeEquipe,
      usuarioId: !this.ehColetivo && (this.usuarioAtual?.role === 'visitante' || this.usuarioAtual?.role === 'capitao')
        ? this.usuarioAtual.id
        : this.equipeEditando?.usuarioId ?? null,
      membros: this.membrosPayload
    };

    if (this.equipeEditando) {
      this.equipeAtualizada.emit(payload);
      return;
    }

    this.equipeAdicionada.emit(payload);
    this.aplicarEstadoDoFormulario();
  }

  onCancelarEdicao() {
    if (this.salvando) {
      return;
    }

    this.aplicarEstadoDoFormulario();
    this.cancelarEdicao.emit();
  }

  isInvalid(controlName: 'nome' | 'curso' | 'periodo' | 'modalidade') {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: 'nome' | 'curso' | 'periodo' | 'modalidade') {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'Este campo e obrigatorio.';
    }

    if (control.hasError('minlength')) {
      return controlName === 'periodo'
        ? 'Informe um periodo valido.'
        : 'Informe pelo menos 2 caracteres.';
    }

    if (controlName === 'nome' && this.nomeDuplicado) {
      return 'Ja existe uma equipe cadastrada com esse nome nessa modalidade.';
    }

    return '';
  }

  private aplicarEstadoDoFormulario() {
    if (this.equipeEditando) {
      this.form.patchValue({
        nome: this.equipeEditando.nome,
        curso: this.equipeEditando.curso,
        periodo: this.equipeEditando.periodo,
        modalidade: this.equipeEditando.modalidade
      }, { emitEvent: false });

      if (this.dadosDaEquipeTravadosPeloCapitao) {
        this.travarDadosDoCapitao();
      } else {
        this.form.controls.curso.enable({ emitEvent: false });
        this.form.controls.periodo.enable({ emitEvent: false });
      }
      this.preencherCapitao(this.equipeEditando.membros.find((membro) => membroEhCapitao(membro)) ?? null);
      return;
    }

    this.form.reset({
      nome: this.individualUsaDadosDaConta ? this.usuarioAtual?.nome ?? '' : '',
      curso: this.individualUsaDadosDaConta || this.dadosDaEquipeTravadosPeloCapitao ? this.usuarioAtual?.curso ?? '' : '',
      periodo: this.individualUsaDadosDaConta || this.dadosDaEquipeTravadosPeloCapitao ? this.usuarioAtual?.periodo ?? '' : '',
      modalidade: ''
    }, { emitEvent: false });

    if (this.dadosDaEquipeTravadosPeloCapitao) {
      this.travarDadosDoCapitao();
    } else {
      this.form.controls.curso.enable({ emitEvent: false });
      this.form.controls.periodo.enable({ emitEvent: false });
    }

    this.preencherCapitao(null);
  }

  private travarDadosDoCapitao() {
    this.form.controls.curso.setValue(this.usuarioAtual?.curso ?? '', { emitEvent: false });
    this.form.controls.periodo.setValue(this.usuarioAtual?.periodo ?? '', { emitEvent: false });
    this.form.controls.curso.disable({ emitEvent: false });
    this.form.controls.periodo.disable({ emitEvent: false });
  }

  private preencherCapitao(capitao: Equipe['membros'][number] | null) {
    const habilidades = capitao?.habilidades ?? [];
    const nome = this.usuarioAtual?.nome ?? capitao?.nome ?? '';

    this.captainForm.reset({
      nome,
      habilidades
    }, { emitEvent: false });

    this.captainForm.controls.nome.disable({ emitEvent: false });
  }

  private validarFormularioColetivo() {
    if (!this.capitaoPayload) {
      this.captainForm.markAllAsTouched();
      return false;
    }

    if (this.usuarioEhCapitao && (!this.usuarioAtual?.curso || !this.usuarioAtual?.periodo)) {
      this.form.markAllAsTouched();
      return false;
    }

    return true;
  }

  onHabilidadesCapitaoChange(habilidades: string[]) {
    this.captainForm.controls.habilidades.setValue(this.lerHabilidadesSelecionadas(habilidades));
    this.captainForm.controls.habilidades.markAsDirty();
  }

  private lerHabilidadesSelecionadas(habilidades: string[] | null | undefined) {
    return (habilidades ?? [])
      .map((habilidade) => habilidade?.trim() ?? '')
      .filter((habilidade): habilidade is string => !!habilidade)
      .slice(0, MAX_HABILIDADES_POR_MEMBRO);
  }

  private obterMembroCapitaoExistente() {
    return this.equipeEditando?.membros.find((membro) => membroEhCapitao(membro));
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

  private normalizarNome(nome: string) {
    return nome.trim().toLowerCase().replace(/\s+/g, ' ');
  }
}
