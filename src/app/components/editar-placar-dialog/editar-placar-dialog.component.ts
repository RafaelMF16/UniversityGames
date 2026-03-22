import { Component, Inject, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Confronto } from '../../models/confronto.model';
import { ConfrontosStateService } from '../../services/confrontos-state.service';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-editar-placar-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon,
    LoadingIndicatorComponent
  ],
  templateUrl: './editar-placar-dialog.component.html',
  styleUrl: './editar-placar-dialog.component.css'
})
export class EditarPlacarDialogComponent {
  private readonly confrontosState = inject(ConfrontosStateService);

  golsA: number;
  golsB: number;
  readonly salvando = signal(false);

  constructor(
    public dialogRef: MatDialogRef<EditarPlacarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Confronto
  ) {
    this.golsA = data.golsA ?? 0;
    this.golsB = data.golsB ?? 0;
  }

  async salvar() {
    if (this.salvando()) {
      return;
    }

    this.salvando.set(true);

    const confrontoAtualizado = await this.confrontosState.updateConfronto(
      this.data.id,
      {
        equipeA: this.data.equipeA,
        equipeB: this.data.equipeB,
        data: this.data.data,
        horario: this.data.horario,
        local: this.data.local,
        modalidade: this.data.modalidade,
        status: 'encerrado',
        golsA: this.golsA,
        golsB: this.golsB,
        destaque: this.data.destaque,
        periodoAtual: this.data.periodoAtual,
        duracao: this.data.duracao,
        fase: this.data.fase
      },
      true
    );

    this.salvando.set(false);

    if (confrontoAtualizado) {
      this.dialogRef.close(confrontoAtualizado);
    }
  }

  fechar() {
    if (!this.salvando()) {
      this.dialogRef.close();
    }
  }
}
