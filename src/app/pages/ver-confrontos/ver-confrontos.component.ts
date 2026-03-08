import { Component } from '@angular/core';
import { ContainerPrincipalComponent } from "../../components/container-principal/container-principal.component";
import { Equipe } from '../../models/equipe.model';
import { Confronto } from '../../models/confronto.model';
import { FiltrosCardComponent } from "../../components/filtros-card/filtros-card.component";
import { ConfrontoCardComponent } from "../../components/confronto-card/confronto-card.component";

@Component({
  selector: 'app-ver-confrontos',
  standalone: true,
  imports: [ContainerPrincipalComponent, FiltrosCardComponent, ConfrontoCardComponent],
  templateUrl: './ver-confrontos.component.html',
  styleUrl: './ver-confrontos.component.css'
})
export class VerConfrontosComponent {
  filtroData = '';
  filtroEquipe = '';

  equipes: Equipe[] = [
    { id: 1, nome: 'Dragões FC', responsavel: '', email: '', membros: [] },
    { id: 2, nome: 'Águias United', responsavel: '', email: '', membros: [] },
    { id: 3, nome: 'Leões SC', responsavel: '', email: '', membros: [] },
    { id: 4, nome: 'Falcões FC', responsavel: '', email: '', membros: [] },
  ];

  confrontos: Confronto[] = [
    { id: 1, equipeA: 'Dragões FC', equipeB: 'Águias United', data: '09/03/2026', horario: '19:00', local: 'Ginásio Central', golsA: 3, golsB: 1 },
    { id: 2, equipeA: 'Leões SC', equipeB: 'Falcões FC', data: '11/03/2026', horario: '20:00', local: 'Quadra Norte' },
  ];

  get confrontosFiltrados(): Confronto[] {
    return this.confrontos.filter(c => {
      const porData = this.filtroData ? c.data === this.filtroData : true;
      const porEquipe = this.filtroEquipe
        ? c.equipeA === this.filtroEquipe || c.equipeB === this.filtroEquipe
        : true;
      return porData && porEquipe;
    });
  }

  onFiltroDataChange(data: string) { this.filtroData = data; }
  onFiltroEquipeChange(equipe: string) { this.filtroEquipe = equipe; }
}
