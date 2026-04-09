import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAX_HABILIDADES_POR_MEMBRO, MembroPayload, ModalidadeEquipe, getFuncoesPorModalidade } from '../../models/equipe.model';
import { HabilidadesSelectorComponent } from '../habilidades-selector/habilidades-selector.component';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

interface MembroFormDialogData {
  salvando: boolean;
  modalidade: ModalidadeEquipe;
}

@Component({
  selector: 'app-membro-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, HabilidadesSelectorComponent, LoadingIndicatorComponent],
  templateUrl: './membro-form-dialog.component.html',
  styleUrl: './membro-form-dialog.component.css'
})
export class MembroFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<MembroFormDialogComponent>);
  readonly data = inject<MembroFormDialogData>(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    funcao: ['', Validators.required],
    habilidades: this.formBuilder.nonNullable.control<string[]>([])
  });

  readonly maxHabilidades = MAX_HABILIDADES_POR_MEMBRO;
  readonly funcoesDisponiveis = getFuncoesPorModalidade(this.data.modalidade);

  get habilidadesSelecionadas() {
    return this.lerHabilidadesSelecionadas(this.form.getRawValue().habilidades);
  }

  salvar() {
    if (this.form.invalid || this.data.salvando || this.habilidadesSelecionadas.length > this.maxHabilidades) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const payload: MembroPayload = {
      nome: values.nome?.trim() ?? '',
      funcao: values.funcao?.trim() || undefined,
      habilidades: this.habilidadesSelecionadas,
      usuarioId: null
    };

    this.dialogRef.close(payload);
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  onHabilidadesChange(habilidades: string[]) {
    this.form.controls.habilidades.setValue(this.lerHabilidadesSelecionadas(habilidades));
    this.form.controls.habilidades.markAsDirty();
  }

  isInvalid(controlName: 'nome') {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  isFuncaoInvalid() {
    const control = this.form.controls.funcao;
    return control.invalid && (control.touched || control.dirty);
  }

  private lerHabilidadesSelecionadas(habilidades: string[] | null | undefined) {
    return (habilidades ?? [])
      .map((habilidade) => habilidade?.trim() ?? '')
      .filter((habilidade): habilidade is string => !!habilidade)
      .slice(0, MAX_HABILIDADES_POR_MEMBRO);
  }
}
