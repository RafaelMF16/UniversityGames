import { Component, computed, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContainerPrincipalComponent } from '../../components/container-principal/container-principal.component';
import { ConfrontoFormCardComponent } from '../../components/confronto-form-card/confronto-form-card.component';
import { ConfrontosListaCardComponent } from '../../components/confrontos-lista-card/confrontos-lista-card.component';
import { EditarPlacarDialogComponent } from '../../components/editar-placar-dialog/editar-placar-dialog.component';
import { Confronto, ConfrontosFiltros } from '../../models/confronto.model';
import { MODALIDADES_EQUIPE } from '../../models/equipe.model';
import { ConfrontosStateService } from '../../services/confrontos-state.service';
import { EquipesStateService } from '../../services/equipes-state.service';

@Component({
  selector: 'app-confrontos',
  standalone: true,
  imports: [
    ContainerPrincipalComponent,
    ConfrontosListaCardComponent,
    MatDialogModule
  ],
  templateUrl: './confrontos.component.html',
  styleUrl: './confrontos.component.css'
})
export class ConfrontosComponent {
  private readonly dialog = inject(MatDialog);
  private readonly confrontosState = inject(ConfrontosStateService);
  private readonly equipesState = inject(EquipesStateService);

  readonly confrontos = this.confrontosState.confrontos.asReadonly();
  readonly equipes = this.equipesState.equipes.asReadonly();
  readonly loading = computed(() => this.confrontosState.loading() || this.equipesState.loading());
  readonly error = computed(() => this.confrontosState.error() ?? this.equipesState.error());
  readonly nomesEquipes = computed(() => this.equipes().map((equipe) => equipe.nome));
  readonly modalidades = MODALIDADES_EQUIPE;
  readonly removendoId = this.confrontosState.deletingId.asReadonly();
  readonly placarSalvandoId = this.confrontosState.placarSavingId.asReadonly();

  constructor() {
    void this.equipesState.loadEquipes();
  }

  abrirModalConfronto(confronto?: Confronto) {
    this.dialog.open(ConfrontoFormCardComponent, {
      width: '720px',
      maxWidth: '94vw',
      panelClass: 'dialog-sem-borda',
      data: {
        equipes: this.equipes(),
        confronto: confronto ?? null
      }
    });
  }

  abrirDialogPlacar(confronto: Confronto) {
    this.dialog.open(EditarPlacarDialogComponent, {
      data: confronto,
      width: '540px',
      panelClass: 'dialog-sem-borda'
    });
  }

  async onConfrontoRemovido(id: number) {
    await this.confrontosState.deleteConfronto(id);
  }

  onFiltrosAlterados(filtros: ConfrontosFiltros) {
    this.confrontosState.setFiltros(filtros);
  }
}
