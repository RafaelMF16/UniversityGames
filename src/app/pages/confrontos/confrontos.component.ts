import { Component, computed, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ContainerPrincipalComponent } from '../../components/container-principal/container-principal.component';
import { ConfrontoFormCardComponent } from '../../components/confronto-form-card/confronto-form-card.component';
import { ConfrontosListaCardComponent } from '../../components/confrontos-lista-card/confrontos-lista-card.component';
import { EditarPlacarDialogComponent } from '../../components/editar-placar-dialog/editar-placar-dialog.component';
import { PaginationControlsComponent } from '../../components/pagination-controls/pagination-controls.component';
import { Confronto, ConfrontosFiltros } from '../../models/confronto.model';
import { MODALIDADES_CONFIG } from '../../models/equipe.model';
import { AuthStateService } from '../../services/auth-state.service';
import { ConfrontosStateService } from '../../services/confrontos-state.service';
import { EquipesStateService } from '../../services/equipes-state.service';

@Component({
  selector: 'app-confrontos',
  standalone: true,
  imports: [
    ContainerPrincipalComponent,
    ConfrontosListaCardComponent,
    PaginationControlsComponent,
    MatDialogModule
  ],
  templateUrl: './confrontos.component.html',
  styleUrl: './confrontos.component.css'
})
export class ConfrontosComponent {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly confrontosState = inject(ConfrontosStateService);
  private readonly equipesState = inject(EquipesStateService);
  private readonly authState = inject(AuthStateService);

  readonly confrontos = this.confrontosState.confrontos.asReadonly();
  readonly loading = computed(() => this.confrontosState.loading() || this.equipesState.loading());
  readonly error = computed(() => this.confrontosState.error() ?? this.equipesState.error());
  readonly modalidades = MODALIDADES_CONFIG;
  readonly pagination = this.confrontosState.pagination.asReadonly();
  readonly podeGerenciarConfrontos = computed(() => this.authState.canManageConfrontos());

  abrirModalConfronto(confronto?: Confronto) {
    if (!this.authState.canManageConfrontos()) {
      return;
    }

    this.dialog.open(ConfrontoFormCardComponent, {
      width: '720px',
      maxWidth: '94vw',
      panelClass: 'dialog-sem-borda',
      data: {
        confronto: confronto ?? null
      }
    });
  }

  abrirDialogPlacar(confronto: Confronto) {
    if (!this.authState.canManageConfrontos()) {
      return;
    }

    this.dialog.open(EditarPlacarDialogComponent, {
      data: confronto,
      width: '540px',
      panelClass: 'dialog-sem-borda'
    });
  }

  async onVerDetalhes(id: number) {
    await this.router.navigate(['/confrontos', id]);
  }

  onFiltrosAlterados(filtros: ConfrontosFiltros) {
    this.confrontosState.setFiltros(filtros);
  }

  async onPageChange(page: number) {
    await this.confrontosState.changePage(page);
  }
}
