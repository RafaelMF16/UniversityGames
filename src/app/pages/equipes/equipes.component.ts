import { Component, computed, inject, signal } from '@angular/core';
import { ContainerPrincipalComponent } from "../../components/container-principal/container-principal.component";
import { CadastrarEquipeCardComponent } from "../../components/cadastrar-equipe-card/cadastrar-equipe-card.component";
import { Equipe, EquipePayload } from '../../models/equipe.model';
import { EquipeCardComponent } from "../../components/equipe-card/equipe-card.component";
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

  readonly equipeEditando = signal<Equipe | null>(null);
  readonly equipes = this.equipesState.equipes.asReadonly();
  readonly loading = this.equipesState.loading.asReadonly();
  readonly formSaving = this.equipesState.formSaving.asReadonly();
  readonly updatingId = this.equipesState.updatingId.asReadonly();
  readonly deletingId = this.equipesState.deletingId.asReadonly();
  readonly error = this.equipesState.error.asReadonly();
  readonly carregandoLista = computed(() => this.loading() && !this.equipes().length);
  readonly podeCriarEquipe = computed(() => this.authState.canCreateEquipe());
  readonly mostrarFormulario = computed(() => this.podeCriarEquipe() || this.equipeEditando() !== null);

  constructor() {
    void this.equipesState.loadEquipes();
  }

  async onEquipeAdicionada(payload: EquipePayload) {
    if (!this.authState.canCreateEquipe()) {
      return;
    }

    const equipe = await this.equipesState.createEquipe(payload);
    if (equipe) {
      this.equipeEditando.set(null);
    }
  }

  iniciarEdicao(equipe: Equipe) {
    if (this.authState.canEditEquipe(equipe.id)) {
      this.equipeEditando.set({ ...equipe });
    }
  }

  async onEquipeAtualizada(payload: EquipePayload) {
    const equipeAtual = this.equipeEditando();
    if (!equipeAtual || !this.authState.canEditEquipe(equipeAtual.id)) {
      return;
    }

    const equipe = await this.equipesState.updateEquipe(equipeAtual.id, payload);
    if (equipe) {
      this.equipeEditando.set(null);
    }
  }

  async onEquipeCardAtualizada(equipe: Equipe) {
    if (!this.authState.canEditEquipe(equipe.id)) {
      return;
    }

    await this.equipesState.updateEquipe(equipe.id, this.toPayload(equipe));

    if (this.equipeEditando()?.id === equipe.id) {
      this.equipeEditando.set(equipe);
    }
  }

  async onEquipeRemovida(id: number) {
    if (!this.authState.canDeleteEquipe()) {
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

  podeEditarEquipe(equipe: Equipe) {
    return this.authState.canEditEquipe(equipe.id);
  }

  podeExcluirEquipe() {
    return this.authState.canDeleteEquipe();
  }

  podeGerenciarMembros(equipe: Equipe) {
    return this.authState.canManageMembers(equipe.id);
  }

  private toPayload(equipe: Equipe): EquipePayload {
    return {
      nome: equipe.nome,
      responsavel: equipe.responsavel,
      email: equipe.email,
      modalidade: equipe.modalidade,
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
