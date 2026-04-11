import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ContainerPrincipalComponent } from '../../components/container-principal/container-principal.component';
import {
  CategoriaEsporte,
  Equipe,
  ModalidadeEquipe,
  getModalidadeLabel,
  getModalidadesPorCategoria,
  modalidadeEhIndividual
} from '../../models/equipe.model';
import { EquipesStateService } from '../../services/equipes-state.service';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { AuthStateService } from '../../services/auth-state.service';
import { PaginationControlsComponent } from '../../components/pagination-controls/pagination-controls.component';
import { EquipeFormDialogComponent } from '../../components/equipe-form-dialog/equipe-form-dialog.component';

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [
    ContainerPrincipalComponent,
    LoadingIndicatorComponent,
    PaginationControlsComponent,
    MatDialogModule
  ],
  templateUrl: './equipes.component.html',
  styleUrl: './equipes.component.css'
})
export class EquipesComponent {
  private readonly dialog = inject(MatDialog);
  private readonly equipesState = inject(EquipesStateService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly categoriaSelecionada = signal<CategoriaEsporte>('coletivo');
  readonly filtroNomeExato = signal('');
  private readonly ultimoUsuarioCarregadoId = signal<number | null>(null);
  readonly equipes = this.equipesState.equipes.asReadonly();
  readonly loading = this.equipesState.loading.asReadonly();
  readonly error = this.equipesState.error.asReadonly();
  readonly pagination = this.equipesState.pagination.asReadonly();
  readonly nomeExato = this.equipesState.nomeExato;
  readonly carregandoLista = computed(() => this.loading() && !this.equipes().length);
  readonly modalidadesDaCategoria = computed(() => getModalidadesPorCategoria(this.categoriaSelecionada()));
  readonly usuarioAtual = this.authState.user.asReadonly();
  readonly visitanteAnonimo = this.authState.isAnonymousVisitor;
  readonly usuarioPodeSeInscreverNoIndividual = computed(() => this.authState.canCreateIndividualRegistration());
  readonly modalidadesIndividuaisDoUsuario = computed<ModalidadeEquipe[]>(() =>
    this.equipesState.inscricoesIndividuaisUsuario().map((equipe) => equipe.modalidade)
  );
  readonly bloqueouTodasModalidadesIndividuais = computed(() => {
    if (!this.usuarioAtual() || !this.usuarioPodeSeInscreverNoIndividual()) {
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

  constructor() {
    void this.equipesState.setCategoria('coletivo');

    effect(() => {
      const usuario = this.usuarioAtual();
      if (usuario) {
        if (this.ultimoUsuarioCarregadoId() !== usuario.id) {
          this.ultimoUsuarioCarregadoId.set(usuario.id);
          void this.equipesState.loadInscricoesIndividuaisUsuario(usuario.id, true);
        }
      } else {
        this.ultimoUsuarioCarregadoId.set(null);
        this.equipesState.inscricoesIndividuaisUsuario.set([]);
      }
    });
  }

  async selecionarCategoria(categoria: CategoriaEsporte) {
    this.categoriaSelecionada.set(categoria);
    await this.equipesState.setCategoria(categoria);
  }

  async irParaLogin() {
    await this.router.navigateByUrl('/login');
  }

  async onPageChange(page: number) {
    await this.equipesState.changePage(page);
  }

  async onVerDetalhes(equipe: Equipe) {
    if (modalidadeEhIndividual(equipe.modalidade)) {
      return;
    }

    await this.router.navigate(['/esportes', equipe.id]);
  }

  categoriaTitulo() {
    return this.categoriaSelecionada() === 'coletivo' ? 'Esportes coletivos' : 'Esportes individuais';
  }

  categoriaDescricao() {
    return this.categoriaSelecionada() === 'coletivo'
      ? 'Cadastre equipes de modalidades coletivas com capitão, curso, período e membros.'
      : 'Faça inscrições individuais usando os dados da conta autenticada.';
  }

  modalidadeLabel(modalidade: string) {
    return getModalidadeLabel(modalidade);
  }

  ehIndividual(modalidade: ModalidadeEquipe) {
    return modalidadeEhIndividual(modalidade);
  }

  async aplicarFiltroNomeExato() {
    await this.equipesState.setNomeExatoFilter(this.filtroNomeExato());
  }

  async limparFiltroNomeExato() {
    this.filtroNomeExato.set('');
    await this.equipesState.setNomeExatoFilter('');
  }

  abrirModalCadastro(equipeEditando: Equipe | null = null, categoria = this.categoriaSelecionada()) {
    if (!equipeEditando && !this.podeCriarRegistro()) {
      return;
    }

    this.dialog.open(EquipeFormDialogComponent, {
      width: '760px',
      maxWidth: '94vw',
      panelClass: 'dialog-sem-borda',
      data: {
        categoria,
        equipeEditando,
        modalidadesDisponiveis: getModalidadesPorCategoria(categoria),
        usuarioAtual: this.usuarioAtual(),
        individualAutopreenchido: categoria === 'individual' && this.usuarioPodeSeInscreverNoIndividual(),
        modalidadesIndividuaisBloqueadas: this.modalidadesIndividuaisDoUsuario(),
        equipesReferencia: []
      }
    });
  }
}
