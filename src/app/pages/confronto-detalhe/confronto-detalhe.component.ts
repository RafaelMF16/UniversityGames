import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContainerPrincipalComponent } from '../../components/container-principal/container-principal.component';
import { ConfrontoFormCardComponent } from '../../components/confronto-form-card/confronto-form-card.component';
import { EditarPlacarDialogComponent } from '../../components/editar-placar-dialog/editar-placar-dialog.component';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { PredictionSummaryComponent } from '../../components/prediction-summary/prediction-summary.component';
import { getModalidadeLabel, modalidadeUsaPlacar } from '../../models/equipe.model';
import { AuthStateService } from '../../services/auth-state.service';
import { ConfrontosStateService } from '../../services/confrontos-state.service';
import { EquipesStateService } from '../../services/equipes-state.service';

@Component({
  selector: 'app-confronto-detalhe',
  standalone: true,
  imports: [
    ContainerPrincipalComponent,
    LoadingIndicatorComponent,
    PredictionSummaryComponent,
    MatDialogModule
  ],
  templateUrl: './confronto-detalhe.component.html',
  styleUrl: './confronto-detalhe.component.css'
})
export class ConfrontoDetalheComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly confrontosState = inject(ConfrontosStateService);
  private readonly equipesState = inject(EquipesStateService);
  private readonly authState = inject(AuthStateService);

  readonly confronto = this.confrontosState.selectedConfronto.asReadonly();
  readonly detailLoading = computed(() => this.confrontosState.detailLoading() || this.equipesState.loading());
  readonly detailError = computed(() => this.confrontosState.detailError() ?? this.equipesState.error());
  readonly removendoId = this.confrontosState.deletingId.asReadonly();
  readonly placarSalvandoId = this.confrontosState.placarSavingId.asReadonly();
  readonly previsaoSalvandoId = this.confrontosState.predictionSavingId.asReadonly();
  readonly equipes = this.equipesState.equipesReferencia.asReadonly();
  readonly podeGerenciar = computed(() => this.authState.canManageConfrontos());

  constructor() {
    void this.equipesState.loadEquipesReferencia();

    this.route.paramMap.subscribe((params) => {
      const confrontoId = Number(params.get('id'));
      if (!Number.isFinite(confrontoId) || confrontoId <= 0) {
        this.confrontosState.detailError.set('Confronto inválido.');
        this.confrontosState.selectedConfronto.set(null);
        return;
      }

      void this.confrontosState.loadConfrontoById(confrontoId);
    });
  }

  modalidadeLabel() {
    return getModalidadeLabel(this.confronto()?.modalidade);
  }

  statusLabel() {
    const status = this.confronto()?.status;
    if (status === 'encerrado') {
      return 'Finalizado';
    }

    if (status === 'ao-vivo') {
      return 'Ao vivo';
    }

    return 'Agendado';
  }

  resultadoLabel() {
    const confronto = this.confronto();
    if (!confronto) {
      return '-';
    }

    if (!modalidadeUsaPlacar(confronto.modalidade)) {
      return confronto.vencedor ? `Vencedor: ${confronto.vencedor}` : 'Vencedor não definido';
    }

    if (confronto.golsA == null || confronto.golsB == null) {
      return '- : -';
    }

    return `${confronto.golsA} : ${confronto.golsB}`;
  }

  formatarData(data: string | null | undefined) {
    if (!data) {
      return '';
    }

    const [ano, mes, dia] = data.split('-');
    if (!ano || !mes || !dia) {
      return data;
    }

    return `${dia}/${mes}/${ano}`;
  }

  async voltar() {
    await this.router.navigate(['/confrontos']);
  }

  abrirModalEdicao() {
    const confronto = this.confronto();
    if (!confronto || !this.podeGerenciar()) {
      return;
    }

    this.dialog.open(ConfrontoFormCardComponent, {
      width: '720px',
      maxWidth: '94vw',
      panelClass: 'dialog-sem-borda',
      data: {
        equipes: this.equipes(),
        confronto
      }
    });
  }

  abrirDialogPlacar() {
    const confronto = this.confronto();
    if (!confronto || !this.podeGerenciar()) {
      return;
    }

    this.dialog.open(EditarPlacarDialogComponent, {
      data: confronto,
      width: '540px',
      panelClass: 'dialog-sem-borda'
    });
  }

  async regerarPrevisao() {
    const confronto = this.confronto();
    if (!confronto || !this.podeGerenciar()) {
      return;
    }

    await this.confrontosState.regeneratePrediction(confronto.id);
  }

  async removerConfronto() {
    const confronto = this.confronto();
    if (!confronto || !this.podeGerenciar()) {
      return;
    }

    const removeu = await this.confrontosState.deleteConfronto(confronto.id);
    if (removeu) {
      await this.router.navigate(['/confrontos']);
    }
  }
}
