import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { CURSOS_DISPONIVEIS, PERIODOS_DISPONIVEIS } from '../../models/academic-options.model';
import { AuthStateService } from '../../services/auth-state.service';
import { profanityValidator } from '../../validators/profanity.validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingIndicatorComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);

  readonly loading = this.authState.loading.asReadonly();
  readonly error = this.authState.error.asReadonly();
  readonly cursos = CURSOS_DISPONIVEIS;
  readonly periodos = PERIODOS_DISPONIVEIS;
  readonly modo = signal<'login' | 'cadastro'>('login');

  readonly loginForm = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly cadastroForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), nomeCompletoValidator(), profanityValidator()]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9._-]+$/), profanityValidator()]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    curso: ['', Validators.required],
    periodo: ['', Validators.required]
  });

  selecionarModo(modo: 'login' | 'cadastro') {
    this.modo.set(modo);
    this.authState.error.set(null);
  }

  async entrar() {
    if (this.loginForm.invalid || this.loading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const values = this.loginForm.getRawValue();
    await this.authState.login({
      username: values.username,
      senha: values.senha
    });
  }

  async cadastrarVisitante() {
    if (this.cadastroForm.invalid || this.loading()) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const values = this.cadastroForm.getRawValue();
    await this.authState.registerVisitor({
      nome: values.nome.trim(),
      username: values.username.trim().toLowerCase(),
      senha: values.senha,
      curso: values.curso,
      periodo: values.periodo
    });
  }

  async entrarComoVisitante() {
    if (!this.loading()) {
      await this.authState.enterAsVisitor();
    }
  }

  isInvalid(formName: 'login' | 'cadastro', controlName: string) {
    const control = formName === 'login'
      ? this.loginForm.controls[controlName as 'username' | 'senha']
      : this.cadastroForm.controls[controlName as 'nome' | 'username' | 'senha' | 'curso' | 'periodo'];
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(formName: 'login' | 'cadastro', controlName: string) {
    const control = formName === 'login'
      ? this.loginForm.controls[controlName as 'username' | 'senha']
      : this.cadastroForm.controls[controlName as 'nome' | 'username' | 'senha' | 'curso' | 'periodo'];

    if (control.hasError('required')) {
      return 'Este campo é obrigatório.';
    }

    if (controlName === 'nome' && control.hasError('nomeCompleto')) {
      return 'Informe nome e sobrenome.';
    }

    if (control.hasError('palavrao')) {
      return 'Este campo contém conteúdo inapropriado.';
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

function nomeCompletoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = String(control.value ?? '').trim();
    if (!valor) {
      return null;
    }

    const partes = valor.split(/\s+/).filter(Boolean);
    return partes.length >= 2 ? null : { nomeCompleto: true };
  };
}
