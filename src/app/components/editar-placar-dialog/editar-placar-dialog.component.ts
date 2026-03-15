import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Confronto } from '../../models/confronto.model';

@Component({
  selector: 'app-editar-placar-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon
  ],
  templateUrl: './editar-placar-dialog.component.html',
  styleUrl: './editar-placar-dialog.component.css'
})
export class EditarPlacarDialogComponent {
  golsA: number;
    golsB: number;

    constructor(
        public dialogRef: MatDialogRef<EditarPlacarDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Confronto
    ) {
        this.golsA = data.golsA ?? 0;
        this.golsB = data.golsB ?? 0;
    }

    salvar() {
        this.dialogRef.close({ ...this.data, golsA: this.golsA, golsB: this.golsB });
    }

    fechar() {
        this.dialogRef.close();
    }
}
