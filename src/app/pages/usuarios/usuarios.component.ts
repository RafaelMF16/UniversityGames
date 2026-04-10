import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmacaoExclusaoDialogComponent } from '../../components/confirmacao-exclusao-dialog/confirmacao-exclusao-dialog.component';
import { ContainerPrincipalComponent } from '../../components/container-principal/container-principal.component';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { PaginationControlsComponent } from '../../components/pagination-controls/pagination-controls.component';
import { CURSOS_DISPONIVEIS, PERIODOS_DISPONIVEIS } from '../../models/academic-options.model';
import { ManagedUserRole, TemaUsuario, Usuario, UsuarioPayload } from '../../models/usuario.model';
import { UsuariosStateService } from '../../services/usuarios-state.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ContainerPrincipalComponent, ReactiveFormsModule, LoadingIndicatorComponent, PaginationControlsComponent, MatDialogModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuariosState = inject(UsuariosStateService);
  private readonly dialog = inject(MatDialog);

  readonly usuarioEditando = signal<Usuario | null>(null);
  readonly usuarios = this.usuariosState.usuarios.asReadonly();
  readonly loading = this.usuariosState.loading.asReadonly();
  readonly pagination = this.usuariosState.pagination.asReadonly();
  readonly formSaving = computed(() => {
    const editando = this.usuarioEditando();
    return this.usuariosState.formSaving() || (editando !== null && this.usuariosState.updatingId() === editando.id);
  });
  readonly deletingId = this.usuariosState.deletingId.asReadonly();
  readonly error = this.usuariosState.error.asReadonly();
  readonly cursos = CURSOS_DISPONIVEIS;
  readonly periodos = PERIODOS_DISPONIVEIS;
  readonly roles: { value: ManagedUserRole; label: string; }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'juiz', label: 'Juiz' },
    { value: 'capitao', label: 'Capitão' },
    { value: 'visitante', label: 'Visitante' }
  ];
  readonly temas: { value: TemaUsuario; label: string; }[] = [
    { value: 'dark', label: 'Escuro' },
    { value: 'light', label: 'Claro' },
    { value: 'system', label: 'Sistema' }
  ];

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    senha: ['', [Validators.minLength(6)]],
    role: ['admin' as ManagedUserRole, Validators.required],
    curso: [''],
    periodo: [''],
    ativo: [true],
    tema: ['dark' as TemaUsuario]
  });

  constructor() {
    this.form.controls.role.valueChanges.subscribe((role) => {
      const precisaDadosAcademicos = role === 'visitante' || role === 'capitao';
      const curso = this.form.controls.curso;
      const periodo = this.form.controls.periodo;

      if (precisaDadosAcademicos) {
        curso.setValidators([Validators.required]);
        periodo.setValidators([Validators.required]);
      } else {
        curso.setValue('');
        periodo.setValue('');
        curso.clearValidators();
        periodo.clearValidators();
      }

      curso.updateValueAndValidity({ emitEvent: false });
      periodo.updateValueAndValidity({ emitEvent: false });
    });

    void this.usuariosState.loadUsuarios();
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

    const values = this.form.getRawValue();
    const payload: UsuarioPayload = {
      nome: values.nome,
      username: values.username.trim().toLowerCase(),
      role: values.role,
      curso: values.role === 'visitante' || values.role === 'capitao' ? values.curso : null,
      periodo: values.role === 'visitante' || values.role === 'capitao' ? values.periodo : null,
      ativo: values.ativo,
      tema: values.tema,
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
      username: usuario.username,
      senha: '',
      role: usuario.role,
      curso: usuario.curso ?? '',
      periodo: usuario.periodo ?? '',
      ativo: usuario.ativo,
      tema: usuario.tema ?? 'dark'
    });
  }

  async remover(usuarioId: number) {
    const usuario = this.usuarios().find((item) => item.id === usuarioId);
    const confirmou = await this.confirmarExclusao(
      'Remover usuario?',
      `O usuario ${usuario?.nome ?? 'selecionado'} sera removido. Se ainda existir vinculo com equipe ou inscricao, a API vai bloquear a remocao.`
    );
    if (!confirmou) {
      return;
    }

    await this.usuariosState.deleteUsuario(usuarioId);

    if (this.usuarioEditando()?.id === usuarioId) {
      this.cancelarEdicao();
    }
  }

  private async confirmarExclusao(titulo: string, mensagem: string) {
    const dialogRef = this.dialog.open(ConfirmacaoExclusaoDialogComponent, {
      width: '440px',
      maxWidth: '94vw',
      panelClass: 'dialog-sem-borda',
      data: {
        titulo,
        mensagem
      }
    });

    return (await firstValueFrom(dialogRef.afterClosed())) === true;
  }

  cancelarEdicao() {
    this.usuarioEditando.set(null);
    this.form.reset({
      nome: '',
      username: '',
      senha: '',
      role: 'admin',
      curso: '',
      periodo: '',
      ativo: true,
      tema: 'dark'
    });
  }

  async onPageChange(page: number) {
    await this.usuariosState.changePage(page);
  }

  roleLabel(role: ManagedUserRole) {
    if (role === 'admin') {
      return 'Admin';
    }

    if (role === 'juiz') {
      return 'Juiz';
    }

    if (role === 'capitao') {
      return 'Capitão';
    }

    return 'Visitante';
  }

  temaLabel(tema: TemaUsuario | undefined) {
    return this.temas.find((item) => item.value === (tema ?? 'dark'))?.label ?? 'Escuro';
  }

  isInvalid(controlName: 'nome' | 'username' | 'senha' | 'role' | 'curso' | 'periodo') {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: 'nome' | 'username' | 'senha' | 'role' | 'curso' | 'periodo') {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'Este campo é obrigatório.';
    }

    if (controlName === 'senha' && !this.usuarioEditando() && !control.value) {
      return 'Informe a senha inicial do usuário.';
    }

    if (controlName === 'username' && control.hasError('pattern')) {
      return 'Use apenas letras, números, ponto, hífen ou sublinhado.';
    }

    if (control.hasError('minlength')) {
      return controlName === 'senha' ? 'Informe pelo menos 6 caracteres.' : 'Informe pelo menos 3 caracteres.';
    }

    return '';
  }
}
