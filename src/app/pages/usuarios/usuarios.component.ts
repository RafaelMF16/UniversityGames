import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContainerPrincipalComponent } from '../../components/container-principal/container-principal.component';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { EquipesStateService } from '../../services/equipes-state.service';
import { UsuariosStateService } from '../../services/usuarios-state.service';
import { ManagedUserRole, Usuario, UsuarioPayload } from '../../models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ContainerPrincipalComponent, ReactiveFormsModule, LoadingIndicatorComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuariosState = inject(UsuariosStateService);
  private readonly equipesState = inject(EquipesStateService);

  readonly usuarioEditando = signal<Usuario | null>(null);
  readonly usuarios = this.usuariosState.usuarios.asReadonly();
  readonly equipes = this.equipesState.equipes.asReadonly();
  readonly loading = computed(() => this.usuariosState.loading() || this.equipesState.loading());
  readonly formSaving = computed(() => {
    const editando = this.usuarioEditando();
    return this.usuariosState.formSaving() || (editando !== null && this.usuariosState.updatingId() === editando.id);
  });
  readonly deletingId = this.usuariosState.deletingId.asReadonly();
  readonly error = computed(() => this.usuariosState.error() ?? this.equipesState.error());
  readonly roles: { value: ManagedUserRole; label: string; }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'juiz', label: 'Juiz' },
    { value: 'capitao', label: 'Capitao' }
  ];

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.minLength(6)]],
    role: ['admin' as ManagedUserRole, Validators.required],
    equipeId: [''],
    ativo: [true]
  });

  constructor() {
    void this.usuariosState.loadUsuarios();
    void this.equipesState.loadEquipes();
  }

  get requerEquipe() {
    return this.form.controls.role.value === 'capitao';
  }

  async salvar() {
    if (this.form.invalid || this.formSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.usuarioEditando() && !this.form.controls.senha.value) {
      this.form.controls.senha.markAsTouched();
      return;
    }

    if (this.requerEquipe && !this.form.controls.equipeId.value) {
      this.form.controls.equipeId.markAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const payload: UsuarioPayload = {
      nome: values.nome,
      email: values.email,
      role: values.role,
      equipeId: values.role === 'capitao' ? Number(values.equipeId) : null,
      ativo: values.ativo,
      ...(values.senha ? { senha: values.senha } : {})
    };

    const usuarioAtual = this.usuarioEditando();
    const resultado = usuarioAtual
      ? await this.usuariosState.updateUsuario(usuarioAtual.id, payload)
      : await this.usuariosState.createUsuario(payload);

    if (resultado) {
      this.cancelarEdicao();
    }
  }

  iniciarEdicao(usuario: Usuario) {
    this.usuarioEditando.set(usuario);
    this.form.reset({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      role: usuario.role === 'visitante' ? 'admin' : usuario.role,
      equipeId: usuario.equipeId ? String(usuario.equipeId) : '',
      ativo: usuario.ativo
    });
  }

  async remover(usuarioId: number) {
    await this.usuariosState.deleteUsuario(usuarioId);

    if (this.usuarioEditando()?.id === usuarioId) {
      this.cancelarEdicao();
    }
  }

  cancelarEdicao() {
    this.usuarioEditando.set(null);
    this.form.reset({
      nome: '',
      email: '',
      senha: '',
      role: 'admin',
      equipeId: '',
      ativo: true
    });
  }

  roleLabel(role: ManagedUserRole | 'visitante') {
    if (role === 'admin') {
      return 'Admin';
    }

    if (role === 'juiz') {
      return 'Juiz';
    }

    if (role === 'capitao') {
      return 'Capitao';
    }

    return 'Visitante';
  }

  isInvalid(controlName: 'nome' | 'email' | 'senha' | 'role' | 'equipeId') {
    const control = this.form.controls[controlName];

    if (controlName === 'equipeId' && this.requerEquipe) {
      return !control.value && (control.touched || control.dirty);
    }

    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: 'nome' | 'email' | 'senha' | 'role' | 'equipeId') {
    const control = this.form.controls[controlName];

    if (controlName === 'equipeId' && this.requerEquipe && !control.value) {
      return 'Selecione a equipe do capitao.';
    }

    if (control.hasError('required')) {
      return 'Este campo e obrigatorio.';
    }

    if (controlName === 'senha' && !this.usuarioEditando() && !control.value) {
      return 'Informe a senha inicial do usuario.';
    }

    if (control.hasError('email')) {
      return 'Informe um e-mail valido.';
    }

    if (control.hasError('minlength')) {
      return controlName === 'senha' ? 'Informe pelo menos 6 caracteres.' : 'Informe pelo menos 3 caracteres.';
    }

    return '';
  }
}
