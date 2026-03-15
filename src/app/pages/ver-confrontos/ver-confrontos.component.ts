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
  filtros: VisualizacaoFiltros = {
    data: '',
    equipe: '',
    modalidade: '',
    local: ''
  };

  equipes = ['Tigers FC', 'Dragons SC', 'Tech Titans', 'Electric Eagles', 'Ice Breakers', 'Flame Warriors', 'Green Growth', 'Diamond Elite'];
  modalidades = ['Futebol', 'Futsal', 'Basquete', 'Volei'];
  locais = ['Ginasio A', 'Ginasio Oeste', 'Campo Central', 'Quadra B'];

  confrontos: Confronto[] = [
    { id: 1, equipeA: 'Tigers FC', equipeB: 'Dragons SC', data: '24 out. 2023', horario: '14:30', local: 'Arena Principal - Quadra 1', modalidade: 'Futebol', status: 'agendado', duracao: '14:30' },
    { id: 2, equipeA: 'Tech Titans', equipeB: 'Electric Eagles', data: '24 out. 2023', horario: '75 min', local: 'Ginasio Oeste', modalidade: 'Futebol', status: 'ao-vivo', periodoAtual: 'Segundo tempo', golsA: 2, golsB: 1, duracao: '75 min' },
    { id: 3, equipeA: 'Ice Breakers', equipeB: 'Flame Warriors', data: '24 out. 2023', horario: '16:45', local: 'Campo Central', modalidade: 'Futebol', status: 'agendado', duracao: '16:45' },
    { id: 4, equipeA: 'Green Growth', equipeB: 'Diamond Elite', data: '23 out. 2023', horario: 'Placar final', local: 'Quadra B', modalidade: 'Futebol', status: 'encerrado', golsA: 0, golsB: 3, duracao: 'Placar final' }
  ];

  get confrontosFiltrados(): Confronto[] {
    return this.confrontos.filter((confronto) => {
      const bateEquipe =
        !this.filtros.equipe ||
        confronto.equipeA === this.filtros.equipe ||
        confronto.equipeB === this.filtros.equipe;

      const bateData = !this.filtros.data || confronto.data === this.filtros.data;
      const bateModalidade = !this.filtros.modalidade || confronto.modalidade === this.filtros.modalidade;
      const bateLocal = !this.filtros.local || confronto.local === this.filtros.local;

      return bateEquipe && bateData && bateModalidade && bateLocal;
    });
  }

  atualizarFiltros(filtros: VisualizacaoFiltros) {
    this.filtros = filtros;
  }
}
