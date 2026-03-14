import { Component } from '@angular/core';
import { ContainerPrincipalComponent } from "../../components/container-principal/container-principal.component";
import { Confronto } from '../../models/confronto.model';
import { ConfrontoCardComponent } from "../../components/confronto-card/confronto-card.component";
import { FiltrosCardComponent, VisualizacaoFiltros } from "../../components/filtros-card/filtros-card.component";

@Component({
  selector: 'app-ver-confrontos',
  standalone: true,
  imports: [ContainerPrincipalComponent, FiltrosCardComponent, ConfrontoCardComponent],
  templateUrl: './ver-confrontos.component.html',
  styleUrl: './ver-confrontos.component.css'
})
export class VerConfrontosComponent {
  abaAtiva: 'all' | 'team' | 'playoffs' | 'results' = 'all';
  filtros: VisualizacaoFiltros = {
    data: 'Oct 24, 2023',
    equipe: '',
    modalidade: '',
    local: ''
  };

  abas = [
    { id: 'all' as const, label: 'All Matches' },
    { id: 'team' as const, label: 'My Team' },
    { id: 'playoffs' as const, label: 'Playoffs' },
    { id: 'results' as const, label: 'Results' }
  ];

  equipes = ['Tigers FC', 'Dragons SC', 'Tech Titans', 'Electric Eagles', 'Ice Breakers', 'Flame Warriors', 'Green Growth', 'Diamond Elite'];
  modalidades = ['Football', 'Futsal', 'Basquete', 'Volei'];
  locais = ['Gymnasium A', 'West Gym', 'Central Field', 'Court B'];

  confrontos: Confronto[] = [
    { id: 1, equipeA: 'Tigers FC', equipeB: 'Dragons SC', data: 'Oct 24, 2023', horario: '14:30 PM', local: 'Main Arena - Court 1', modalidade: 'Football', status: 'agendado', fase: 'all', duracao: '14:30 PM' },
    { id: 2, equipeA: 'Tech Titans', equipeB: 'Electric Eagles', data: 'Oct 24, 2023', horario: '75 mins', local: 'West Gym', modalidade: 'Football', status: 'ao-vivo', periodoAtual: 'Second Half', fase: 'team', golsA: 2, golsB: 1, duracao: '75 mins' },
    { id: 3, equipeA: 'Ice Breakers', equipeB: 'Flame Warriors', data: 'Oct 24, 2023', horario: '16:45 PM', local: 'Central Field', modalidade: 'Football', status: 'agendado', fase: 'playoffs', duracao: '16:45 PM' },
    { id: 4, equipeA: 'Green Growth', equipeB: 'Diamond Elite', data: 'Oct 23, 2023', horario: 'Final Score', local: 'Court B', modalidade: 'Football', status: 'encerrado', fase: 'results', golsA: 0, golsB: 3, duracao: 'Final Score' }
  ];

  get confrontosFiltrados(): Confronto[] {
    return this.confrontos.filter((confronto) => {
      const bateAba =
        this.abaAtiva === 'all' ||
        (this.abaAtiva === 'team' && confronto.fase === 'team') ||
        (this.abaAtiva === 'playoffs' && confronto.fase === 'playoffs') ||
        (this.abaAtiva === 'results' && confronto.status === 'encerrado');

      const bateEquipe =
        !this.filtros.equipe ||
        confronto.equipeA === this.filtros.equipe ||
        confronto.equipeB === this.filtros.equipe;

      const bateData = !this.filtros.data || confronto.data === this.filtros.data;
      const bateModalidade = !this.filtros.modalidade || confronto.modalidade === this.filtros.modalidade;
      const bateLocal = !this.filtros.local || confronto.local === this.filtros.local;

      return bateAba && bateEquipe && bateData && bateModalidade && bateLocal;
    });
  }

  atualizarFiltros(filtros: VisualizacaoFiltros) {
    this.filtros = filtros;
  }
}
