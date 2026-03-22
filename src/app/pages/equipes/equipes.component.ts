import { Component, computed, inject, signal } from '@angular/core';
import { ContainerPrincipalComponent } from "../../components/container-principal/container-principal.component";
import { CadastrarEquipeCardComponent } from "../../components/cadastrar-equipe-card/cadastrar-equipe-card.component";
import { Equipe, EquipePayload } from '../../models/equipe.model';
import { EquipeCardComponent } from "../../components/equipe-card/equipe-card.component";
import { EquipesStateService } from '../../services/equipes-state.service';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';

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

  readonly equipeEditando = signal<Equipe | null>(null);
  readonly equipes = this.equipesState.equipes.asReadonly();
  readonly loading = this.equipesState.loading.asReadonly();
  readonly formSaving = this.equipesState.formSaving.asReadonly();
  readonly updatingId = this.equipesState.updatingId.asReadonly();
  readonly deletingId = this.equipesState.deletingId.asReadonly();
  readonly error = this.equipesState.error.asReadonly();
  readonly carregandoLista = computed(() => this.loading() && !this.equipes().length);

  constructor() {
    void this.equipesState.loadEquipes();
  }

  async onEquipeAdicionada(payload: EquipePayload) {
    const equipe = await this.equipesState.createEquipe(payload);
    if (equipe) {
      this.equipeEditando.set(null);
    }
  }

  iniciarEdicao(equipe: Equipe) {
    this.equipeEditando.set({ ...equipe });
  }

  async onEquipeAtualizada(payload: EquipePayload) {
    const equipeAtual = this.equipeEditando();
    if (!equipeAtual) {
      return;
    }

    const equipe = await this.equipesState.updateEquipe(equipeAtual.id, payload);
    if (equipe) {
      this.equipeEditando.set(null);
    }
  }

  async onEquipeCardAtualizada(equipe: Equipe) {
    await this.equipesState.updateEquipe(equipe.id, this.toPayload(equipe));

    if (this.equipeEditando()?.id === equipe.id) {
      this.equipeEditando.set(equipe);
    }
  }

  async onEquipeRemovida(id: number) {
    const removeu = await this.equipesState.deleteEquipe(id);
    if (removeu && this.equipeEditando()?.id === id) {
      this.equipeEditando.set(null);
    }
  }

  cancelarEdicao() {
    this.equipeEditando.set(null);
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
