import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmacaoExclusaoDialogData {
  titulo: string;
  mensagem: string;
  confirmarTexto?: string;
  cancelarTexto?: string;
}

@Component({
  selector: 'app-confirmacao-exclusao-dialog',
  standalone: true,
  templateUrl: './confirmacao-exclusao-dialog.component.html',
  styleUrl: './confirmacao-exclusao-dialog.component.css'
})
export class ConfirmacaoExclusaoDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmacaoExclusaoDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: ConfirmacaoExclusaoDialogData
  ) {}

  cancelar() {
    this.dialogRef.close(false);
  }

  confirmar() {
    this.dialogRef.close(true);
  }
}
