import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { ContainerPrincipalComponent } from '../../components/container-principal/container-principal.component';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { EquipeFormDialogComponent } from '../../components/equipe-form-dialog/equipe-form-dialog.component';
import { EquipesStateService } from '../../services/equipes-state.service';
import { AuthStateService } from '../../services/auth-state.service';
import { Equipe, getModalidadeLabel, getModalidadesPorCategoria, modalidadeEhIndividual } from '../../models/equipe.model';

@Component({
  selector: 'app-esporte-detalhe',
  standalone: true,
  imports: [
    ContainerPrincipalComponent,
    LoadingIndicatorComponent,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './esporte-detalhe.component.html',
  styleUrl: './esporte-detalhe.component.css'
})
export class EsporteDetalheComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly equipesState = inject(EquipesStateService);
  private readonly authState = inject(AuthStateService);

  readonly equipe = this.equipesState.selectedEquipe.asReadonly();
  readonly detailLoading = this.equipesState.detailLoading.asReadonly();
  readonly detailError = this.equipesState.detailError.asReadonly();
  readonly deletingId = this.equipesState.deletingId.asReadonly();
  readonly podeEditar = computed(() => {
    const equipe = this.equipe();
    return !!equipe && this.podeEditarEquipe(equipe);
  });
  readonly podeExcluir = computed(() => {
    const equipe = this.equipe();
    return !!equipe && this.podeExcluirEquipe(equipe);
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const equipeId = Number(params.get('id'));
      if (!Number.isFinite(equipeId) || equipeId <= 0) {
        this.equipesState.detailError.set('Cadastro inválido.');
        this.equipesState.selectedEquipe.set(null);
        return;
      }

      void this.equipesState.loadEquipeById(equipeId);
    });
  }

  modalidadeLabel() {
    return getModalidadeLabel(this.equipe()?.modalidade);
  }

  categoriaLabel() {
    return modalidadeEhIndividual(this.equipe()?.modalidade) ? 'Esporte individual' : 'Esporte coletivo';
  }

  ehIndividual() {
    return modalidadeEhIndividual(this.equipe()?.modalidade);
  }

  async voltar() {
    await this.router.navigate(['/esportes']);
  }

  abrirModalEdicao() {
    const equipe = this.equipe();
    if (!equipe || !this.podeEditarEquipe(equipe)) {
      return;
    }

    this.dialog.open(EquipeFormDialogComponent, {
      width: '760px',
      maxWidth: '94vw',
      panelClass: 'dialog-sem-borda',
      data: {
        categoria: modalidadeEhIndividual(equipe.modalidade) ? 'individual' : 'coletivo',
        equipeEditando: equipe,
        modalidadesDisponiveis: getModalidadesPorCategoria(modalidadeEhIndividual(equipe.modalidade) ? 'individual' : 'coletivo'),
        usuarioAtual: this.authState.user(),
        individualAutopreenchido: modalidadeEhIndividual(equipe.modalidade) && this.authState.canCreateIndividualRegistration(),
        modalidadesIndividuaisBloqueadas: []
      }
    });
  }

  async removerEquipe() {
    const equipe = this.equipe();
    if (!equipe || !this.podeExcluirEquipe(equipe)) {
      return;
    }

    const removeu = await this.equipesState.deleteEquipe(equipe.id);
    if (removeu) {
      await this.router.navigate(['/esportes']);
    }
  }

  private podeEditarEquipe(equipe: Equipe) {
    const usuario = this.authState.user();

    if (modalidadeEhIndividual(equipe.modalidade)) {
      return usuario?.role === 'admin'
        || ((usuario?.role === 'visitante' || usuario?.role === 'capitao') && equipe.usuarioId === usuario.id);
    }

    return this.authState.canEditEquipe(equipe.id);
  }

  private podeExcluirEquipe(equipe: Equipe) {
    if (modalidadeEhIndividual(equipe.modalidade)) {
      return this.authState.canManageUsers();
    }

    return this.authState.canDeleteEquipe();
  }
}
