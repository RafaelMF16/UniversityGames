import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ContainerPrincipalComponent } from '../../components/container-principal/container-principal.component';
import { CadastrarEquipeCardComponent } from '../../components/cadastrar-equipe-card/cadastrar-equipe-card.component';
import {
  CategoriaEsporte,
  Equipe,
  EquipePayload,
  ModalidadeEquipe,
  getModalidadeLabel,
  getModalidadesPorCategoria,
  modalidadeEhIndividual,
  modalidadePermiteMembros
} from '../../models/equipe.model';
import { EquipeCardComponent } from '../../components/equipe-card/equipe-card.component';
import { EquipesStateService } from '../../services/equipes-state.service';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [
    ContainerPrincipalComponent,
    CadastrarEquipeCardComponent,
    EquipeCardComponent,
    LoadingIndicatorComponent
  ],
  templateUrl: './equipes.component.html',
  styleUrl: './equipes.component.css'
})
export class EquipesComponent {
  private readonly equipesState = inject(EquipesStateService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly equipeEditando = signal<Equipe | null>(null);
  readonly categoriaSelecionada = signal<CategoriaEsporte>('coletivo');
  readonly equipes = this.equipesState.equipes.asReadonly();
  readonly loading = this.equipesState.loading.asReadonly();
  readonly formSaving = this.equipesState.formSaving.asReadonly();
  readonly updatingId = this.equipesState.updatingId.asReadonly();
  readonly deletingId = this.equipesState.deletingId.asReadonly();
  readonly error = this.equipesState.error.asReadonly();
  readonly carregandoLista = computed(() => this.loading() && !this.equipes().length);
  readonly modalidadesDaCategoria = computed(() => getModalidadesPorCategoria(this.categoriaSelecionada()));
  readonly equipesFiltradas = computed(() =>
    this.equipes().filter((equipe) =>
      this.modalidadesDaCategoria().some((modalidade) => modalidade.valor === equipe.modalidade)
    )
  );
  readonly usuarioAtual = this.authState.user.asReadonly();
  readonly visitanteAnonimo = this.authState.isAnonymousVisitor;
  readonly visitanteAutenticado = this.authState.isAuthenticatedVisitor;
  readonly modalidadesIndividuaisDoUsuario = computed<ModalidadeEquipe[]>(() => {
    const usuario = this.usuarioAtual();
    if (!usuario) {
      return [];
    }

    return this.equipes()
      .filter((equipe) => modalidadeEhIndividual(equipe.modalidade) && equipe.usuarioId === usuario.id)
      .map((equipe) => equipe.modalidade);
  });
  readonly bloqueouTodasModalidadesIndividuais = computed(() => {
    if (!this.visitanteAutenticado()) {
      return false;
    }

    const modalidades = this.modalidadesDaCategoria().map((item) => item.valor);
    return modalidades.length > 0 && modalidades.every((modalidade) => this.modalidadesIndividuaisDoUsuario().includes(modalidade));
  });
  readonly podeCriarRegistro = computed(() => {
    if (this.categoriaSelecionada() === 'individual') {
      return this.authState.canCreateIndividualRegistration() && !this.bloqueouTodasModalidadesIndividuais();
    }

    return this.authState.canCreateEquipe();
  });
  readonly mostrarFormulario = computed(() => this.podeCriarRegistro() || this.equipeEditando() !== null);

  constructor() {
    void this.equipesState.loadEquipes();
  }

  selecionarCategoria(categoria: CategoriaEsporte) {
    this.categoriaSelecionada.set(categoria);

    const equipe = this.equipeEditando();
    if (equipe) {
      const pertence = this.modalidadesDaCategoria().some((modalidade) => modalidade.valor === equipe.modalidade);
      if (!pertence) {
        this.equipeEditando.set(null);
      }
    }
  }

  async onEquipeAdicionada(payload: EquipePayload) {
    if (!this.podeCriarRegistro()) {
      return;
    }

    const equipe = await this.equipesState.createEquipe(payload);
    if (equipe) {
      this.equipeEditando.set(null);
      await this.authState.refreshCurrentUser();
    }
  }

  iniciarEdicao(equipe: Equipe) {
    if (!this.podeEditarEquipe(equipe)) {
      return;
    }

    this.categoriaSelecionada.set(modalidadePermiteMembros(equipe.modalidade) ? 'coletivo' : 'individual');
    this.equipeEditando.set({ ...equipe });
  }

  async onEquipeAtualizada(payload: EquipePayload) {
    const equipeAtual = this.equipeEditando();
    if (!equipeAtual || !this.podeEditarEquipe(equipeAtual)) {
      return;
    }

    const equipe = await this.equipesState.updateEquipe(equipeAtual.id, payload);
    if (equipe) {
      this.equipeEditando.set(null);
      await this.authState.refreshCurrentUser();
    }
  }

  async onEquipeCardAtualizada(equipe: Equipe) {
    if (!this.podeEditarEquipe(equipe)) {
      return;
    }

    await this.equipesState.updateEquipe(equipe.id, this.toPayload(equipe));

    if (this.equipeEditando()?.id === equipe.id) {
      this.equipeEditando.set(equipe);
    }

    await this.authState.refreshCurrentUser();
  }

  async onEquipeRemovida(id: number) {
    const equipe = this.equipes().find((item) => item.id === id);
    if (!equipe || !this.podeExcluirEquipe(equipe)) {
      return;
    }

    const removeu = await this.equipesState.deleteEquipe(id);
    if (removeu && this.equipeEditando()?.id === id) {
      this.equipeEditando.set(null);
    }
  }

  cancelarEdicao() {
    this.equipeEditando.set(null);
  }

  async irParaLogin() {
    await this.router.navigateByUrl('/login');
  }

  podeEditarEquipe(equipe: Equipe) {
    const usuario = this.usuarioAtual();

    if (modalidadeEhIndividual(equipe.modalidade)) {
      return usuario?.role === 'admin' || (usuario?.role === 'visitante' && equipe.usuarioId === usuario.id);
    }

    return this.authState.canEditEquipe(equipe.id);
  }

  podeExcluirEquipe(equipe: Equipe) {
    if (modalidadeEhIndividual(equipe.modalidade)) {
      return this.authState.canManageUsers();
    }

    return this.authState.canDeleteEquipe();
  }

  podeGerenciarMembros(equipe: Equipe) {
    return modalidadePermiteMembros(equipe.modalidade) && this.authState.canManageMembers(equipe.id);
  }

  categoriaTitulo() {
    return this.categoriaSelecionada() === 'coletivo' ? 'Esportes coletivos' : 'Esportes individuais';
  }

  categoriaDescricao() {
    return this.categoriaSelecionada() === 'coletivo'
      ? 'Cadastre equipes de modalidades coletivas com capitão, curso, período e membros.'
      : 'Faça inscrições individuais usando os dados da conta do visitante autenticado.';
  }

  modalidadeLabel(modalidade: string) {
    return getModalidadeLabel(modalidade);
  }

  private toPayload(equipe: Equipe): EquipePayload {
    return {
      nome: equipe.nome,
      responsavel: equipe.responsavel ?? null,
      curso: equipe.curso,
      periodo: equipe.periodo,
      modalidade: equipe.modalidade,
      usuarioId: equipe.usuarioId ?? null,
      icone: equipe.icone,
      membros: equipe.membros.map((membro) => ({
        id: membro.id,
        nome: membro.nome,
        habilidades: membro.habilidades,
        funcao: membro.funcao
      }))
    };
  }
}
