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
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  async entrar() {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    await this.authState.login({
      email: values.email,
      senha: values.senha
    });
  }

  async entrarComoVisitante() {
    if (!this.loading()) {
      await this.authState.enterAsVisitor();
    }
  }

  isInvalid(controlName: 'email' | 'senha') {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: 'email' | 'senha') {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'Este campo é obrigatório.';
    }

    if (control.hasError('email')) {
      return 'Informe um e-mail válido.';
    }

    if (control.hasError('minlength')) {
      return 'Informe pelo menos 6 caracteres.';
    }

    return '';
  }
}
