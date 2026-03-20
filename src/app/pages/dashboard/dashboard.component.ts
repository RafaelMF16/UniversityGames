import { Component } from '@angular/core';
import { ContainerPrincipalComponent } from "../../components/container-principal/container-principal.component";
import { DashboardCardComponent } from "../../components/dashboard-card/dashboard-card.component";
import { ProximosConfrontosCardComponent } from "../../components/proximos-confrontos-card/proximos-confrontos-card.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ContainerPrincipalComponent, DashboardCardComponent, ProximosConfrontosCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  metricas = [
    {
      titulo: 'Total de equipes',
      valor: '12',
      icone: 'groups',
      destaque: '',
      destaqueTipo: 'success' as const,
      descricao: ''
    },
    {
      titulo: 'Total de confrontos',
      valor: '18',
      icone: 'sports_soccer',
      destaque: '',
      destaqueTipo: 'primary' as const,
      descricao: ''
    }
  ];

  proximosJogos = [
    {
      equipeA: 'Engenharia Sharks',
      equipeB: 'Direito Lions',
      horario: '14:00',
      data: '22 OUT',
      local: 'Quadra Poliesportiva Central',
      modalidade: 'Futsal'
    },
    {
      equipeA: 'Medicina Wolves',
      equipeB: 'TI Falcons',
      horario: '15:30',
      data: '22 OUT',
      local: 'Ginasio de Esportes 02',
      modalidade: 'Volei'
    },
    {
      equipeA: 'Adm Bulls',
      equipeB: 'Psico Panthers',
      horario: '19:00',
      data: '23 OUT',
      local: 'Arena Principal',
      modalidade: 'Basquete'
    },
    {
      equipeA: 'Contabeis Titans',
      equipeB: 'MKT Hawks',
      horario: '20:30',
      data: '23 OUT',
      local: 'Arena Principal',
      modalidade: 'Atletismo'
    }
  ];
}
