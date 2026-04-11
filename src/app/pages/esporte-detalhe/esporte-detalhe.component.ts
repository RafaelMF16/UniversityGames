import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { firstValueFrom } from 'rxjs';
import { ContainerPrincipalComponent } from '../../components/container-principal/container-principal.component';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { EquipeFormDialogComponent } from '../../components/equipe-form-dialog/equipe-form-dialog.component';
import { MembroFormDialogComponent } from '../../components/membro-form-dialog/membro-form-dialog.component';
import { ConfirmacaoExclusaoDialogComponent } from '../../components/confirmacao-exclusao-dialog/confirmacao-exclusao-dialog.component';
import {
  Equipe,
  Membro,
  MembroPayload,
  getLimiteIntegrantes,
  getModalidadeLabel,
  getModalidadesPorCategoria,
  membroEhCapitao,
  modalidadeEhIndividual
} from '../../models/equipe.model';
import { EquipesStateService } from '../../services/equipes-state.service';
import { AuthStateService } from '../../services/auth-state.service';

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
  readonly updatingId = this.equipesState.updatingId.asReadonly();
  readonly formError = this.equipesState.error.asReadonly();

  readonly podeEditar = computed(() => {
    const equipe = this.equipe();
    return !!equipe && this.podeEditarEquipe(equipe);
  });
  readonly podeExcluir = computed(() => {
    const equipe = this.equipe();
    return !!equipe && this.podeExcluirEquipe(equipe);
  });
  readonly podeGerenciarMembros = computed(() => {
    const equipe = this.equipe();
    return !!equipe && !modalidadeEhIndividual(equipe.modalidade) && this.podeEditarEquipe(equipe);
  });
  readonly capitao = computed(() => this.equipe()?.membros.find((membro) => membroEhCapitao(membro)) ?? null);
  readonly demaisMembros = computed(() => (this.equipe()?.membros ?? []).filter((membro) => !membroEhCapitao(membro)));
  readonly limiteIntegrantes = computed(() => getLimiteIntegrantes(this.equipe()?.modalidade));
  readonly totalIntegrantes = computed(() => this.equipe()?.membros.length ?? 0);
  readonly podeAdicionarMembro = computed(() => {
    const limite = this.limiteIntegrantes();
    return !this.savingMembers() && (!limite || this.totalIntegrantes() < limite);
  });
  readonly savingMembers = computed(() => {
    const equipe = this.equipe();
    return !!equipe && this.updatingId() === equipe.id;
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const equipeId = Number(params.get('id'));
      if (!Number.isFinite(equipeId) || equipeId <= 0) {
        this.equipesState.detailError.set('Cadastro invalido.');
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
        modalidadesIndividuaisBloqueadas: [],
        equipesReferencia: []
      }
    });
  }

  async abrirModalNovoMembro() {
    const equipe = this.equipe();
    if (!equipe || !this.podeGerenciarMembros() || !this.podeAdicionarMembro()) {
      return;
    }

    const dialogRef = this.dialog.open(MembroFormDialogComponent, {
      width: '680px',
      maxWidth: '94vw',
      panelClass: 'dialog-sem-borda',
      data: {
        salvando: this.savingMembers(),
        modalidade: equipe.modalidade
      }
    });

    const membro = await firstValueFrom(dialogRef.afterClosed());
    if (!membro) {
      return;
    }

    const payload = this.criarPayloadComMembros([
      ...equipe.membros,
      membro
    ]);

    await this.equipesState.updateEquipe(equipe.id, payload);
  }

  async removerMembro(memberId?: number) {
    const equipe = this.equipe();
    if (!equipe || memberId == null || !this.podeGerenciarMembros()) {
      return;
    }

    const membro = equipe.membros.find((item) => item.id === memberId);
    const confirmou = await this.confirmarExclusao(
      'Remover integrante?',
      `O integrante ${membro?.nome ?? 'selecionado'} sera removido desta equipe.`
    );
    if (!confirmou) {
      return;
    }

    const membrosAtualizados = equipe.membros.filter((membro) => membro.id !== memberId);
    await this.equipesState.updateEquipe(equipe.id, this.criarPayloadComMembros(membrosAtualizados));
  }

  async removerEquipe() {
    const equipe = this.equipe();
    if (!equipe || !this.podeExcluirEquipe(equipe)) {
      return;
    }

    const confirmou = await this.confirmarExclusao(
      'Excluir cadastro?',
      `O cadastro ${equipe.nome} sera removido. Se houver confrontos vinculados, a API vai bloquear a exclusao.`
    );
    if (!confirmou) {
      return;
    }

    const removeu = await this.equipesState.deleteEquipe(equipe.id);
    if (removeu) {
      await this.router.navigate(['/esportes']);
    }
  }

  private async confirmarExclusao(titulo: string, mensagem: string) {
    const dialogRef = this.dialog.open(ConfirmacaoExclusaoDialogComponent, {
      width: '440px',
      maxWidth: '94vw',
      panelClass: 'dialog-sem-borda',
      data: {
        titulo,
        mensagem
      }
    });

    return (await firstValueFrom(dialogRef.afterClosed())) === true;
  }

  private criarPayloadComMembros(membros: Array<Membro | MembroPayload>) {
    const equipe = this.equipe();
    if (!equipe) {
      throw new Error('Equipe nao carregada.');
    }

    return {
      nome: equipe.nome,
      responsavel: this.capitao()?.nome ?? equipe.responsavel ?? null,
      curso: equipe.curso,
      periodo: equipe.periodo,
      modalidade: equipe.modalidade,
      usuarioId: equipe.usuarioId ?? null,
      icone: equipe.icone,
      membros: membros.map((membro) => ({
        id: 'id' in membro ? membro.id : undefined,
        nome: membro.nome,
        habilidades: membro.habilidades,
        funcao: membro.funcao,
        usuarioId: membro.usuarioId ?? null
      }))
    };
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
