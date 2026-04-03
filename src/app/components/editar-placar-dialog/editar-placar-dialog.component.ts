import { Component, Inject, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Confronto } from '../../models/confronto.model';
import { modalidadeUsaPlacar } from '../../models/equipe.model';
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
  vencedor: string;
  readonly salvando = signal(false);
  readonly usaPlacar = computed(() => modalidadeUsaPlacar(this.data.modalidade));

  constructor(
    public dialogRef: MatDialogRef<EditarPlacarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Confronto
  ) {
    this.golsA = data.golsA ?? 0;
    this.golsB = data.golsB ?? 0;
    this.vencedor = data.vencedor ?? '';
  }

  async salvar() {
    if (this.salvando()) {
      return;
    }

    if (!this.usaPlacar() && !this.vencedor) {
      return;
    }

    this.salvando.set(true);

    const confrontoAtualizado = await this.confrontosState.updateConfronto(
      this.data.id,
      {
        equipeA: this.data.equipeA,
        equipeB: this.data.equipeB,
        participanteAId: this.data.participanteAId ?? null,
        participanteBId: this.data.participanteBId ?? null,
        data: this.data.data,
        horario: this.data.horario,
        local: this.data.local,
        modalidade: this.data.modalidade,
        status: 'encerrado',
        golsA: this.usaPlacar() ? this.golsA : null,
        golsB: this.usaPlacar() ? this.golsB : null,
        vencedor: this.usaPlacar() ? null : this.vencedor,
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
