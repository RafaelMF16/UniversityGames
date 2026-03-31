import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { AuthStateService } from '../../services/auth-state.service';

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
  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  async entrar() {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    await this.authState.login({
      username: values.username,
      senha: values.senha
    });
  }

  async entrarComoVisitante() {
    if (!this.loading()) {
      await this.authState.enterAsVisitor();
    }
  }

  isInvalid(controlName: 'username' | 'senha') {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: 'username' | 'senha') {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'Este campo é obrigatório.';
    }

    if (controlName === 'username' && control.hasError('minlength')) {
      return 'Informe pelo menos 3 caracteres.';
    }

    if (controlName === 'username' && control.hasError('pattern')) {
      return 'Use apenas letras, números, ponto, hífen ou sublinhado.';
    }

    if (control.hasError('minlength')) {
      return 'Informe pelo menos 6 caracteres.';
    }

    return '';
  }
}
