import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Equipe, EquipePayload, ModalidadeEquipe } from '../../models/equipe.model';
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
  @Output() equipeAdicionada = new EventEmitter<EquipePayload>();
  @Output() equipeAtualizada = new EventEmitter<EquipePayload>();
  @Output() cancelarEdicao = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);

  readonly modalidades: ModalidadeEquipe[] = ['Futsal', 'Volei', 'Basquete', 'Natacao', 'Atletismo'];

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    responsavel: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    modalidade: ['' as '' | ModalidadeEquipe, Validators.required]
  });

  ngOnChanges(_: SimpleChanges) {
    if (this.equipeEditando) {
      this.form.patchValue({
        nome: this.equipeEditando.nome,
        responsavel: this.equipeEditando.responsavel,
        email: this.equipeEditando.email,
        modalidade: this.equipeEditando.modalidade
      });
      return;
    }

    this.limparFormulario();
  }

  salvar() {
    if (this.form.invalid || this.salvando) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const payload: EquipePayload = {
      nome: values.nome,
      responsavel: values.responsavel,
      email: values.email,
      modalidade: values.modalidade as ModalidadeEquipe,
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

  isInvalid(controlName: 'nome' | 'responsavel' | 'email' | 'modalidade') {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: 'nome' | 'responsavel' | 'email' | 'modalidade') {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'Este campo e obrigatorio.';
    }

    if (control.hasError('email')) {
      return 'Informe um e-mail valido.';
    }

    if (control.hasError('minlength')) {
      return 'Informe pelo menos 3 caracteres.';
    }

    return '';
  }

  private limparFormulario() {
    this.form.reset({
      nome: '',
      responsavel: '',
      email: '',
      modalidade: ''
    });
  }
}
