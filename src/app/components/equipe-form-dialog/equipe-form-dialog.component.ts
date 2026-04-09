import { Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CadastrarEquipeCardComponent } from '../cadastrar-equipe-card/cadastrar-equipe-card.component';
import { CategoriaEsporte, Equipe, EquipePayload, ModalidadeEquipe, ModalidadeEsporteConfig } from '../../models/equipe.model';
import { Usuario } from '../../models/usuario.model';
import { EquipesStateService } from '../../services/equipes-state.service';
import { AuthStateService } from '../../services/auth-state.service';

interface EquipeFormDialogData {
  categoria: CategoriaEsporte;
  equipeEditando: Equipe | null;
  modalidadesDisponiveis: ModalidadeEsporteConfig[];
  usuarioAtual: Usuario | null;
  individualAutopreenchido: boolean;
  modalidadesIndividuaisBloqueadas: ModalidadeEquipe[];
  equipesReferencia: Equipe[];
}

@Component({
  selector: 'app-equipe-form-dialog',
  standalone: true,
  imports: [CadastrarEquipeCardComponent],
  templateUrl: './equipe-form-dialog.component.html'
})
export class EquipeFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<EquipeFormDialogComponent>);
  private readonly equipesState = inject(EquipesStateService);
  private readonly authState = inject(AuthStateService);

  readonly data = inject<EquipeFormDialogData>(MAT_DIALOG_DATA);
  readonly formSaving = computed(() => {
    const equipeId = this.data.equipeEditando?.id;
    return this.equipesState.formSaving() || (equipeId != null && this.equipesState.updatingId() === equipeId);
  });

  async onEquipeAdicionada(payload: EquipePayload) {
    const equipe = await this.equipesState.createEquipe(payload);
    if (!equipe) {
      return;
    }

    const usuario = this.data.usuarioAtual;
    if (payload.modalidade !== 'Natacao' && usuario?.role === 'capitao' && !usuario.equipeId) {
      await this.authState.refreshCurrentUser();
    }

    this.dialogRef.close(true);
  }

  async onEquipeAtualizada(payload: EquipePayload) {
    const equipeAtual = this.data.equipeEditando;
    if (!equipeAtual) {
      return;
    }

    const equipe = await this.equipesState.updateEquipe(equipeAtual.id, payload);
    if (equipe) {
      this.dialogRef.close(true);
    }
  }

  onCancelarEdicao() {
    this.dialogRef.close(false);
  }
}
