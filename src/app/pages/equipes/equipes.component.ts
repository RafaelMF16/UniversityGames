import { Component } from '@angular/core';
import { ContainerPrincipalComponent } from "../../components/container-principal/container-principal.component";
import { CadastrarEquipeCardComponent } from "../../components/cadastrar-equipe-card/cadastrar-equipe-card.component";
import { Equipe } from '../../models/equipe.model';
import { EquipeCardComponent } from "../../components/equipe-card/equipe-card.component";

@Component({
  selector: 'app-equipes',
  imports: [
    ContainerPrincipalComponent,
    CadastrarEquipeCardComponent,
    EquipeCardComponent
  ],
  templateUrl: './equipes.component.html',
  styleUrl: './equipes.component.css'
})
export class EquipesComponent {
  equipes: Equipe[] = [
    {
      id: 1,
      nome: 'Dragões FC',
      responsavel: 'Carlos Silva',
      email: 'carlos@email.com',
      membros: [
        { id: 1, nome: 'João Alves', habilidades: ['Ataque', 'Velocidade'] },
        { id: 2, nome: 'Ricardo Nunes', habilidades: ['Defesa', 'Liderança'] },
      ]
    },
    {
      id: 2,
      nome: 'Real Madrid',
      responsavel: 'Florentino Pérez',
      email: 'perez@email.com',
      membros: [
        { id: 1, nome: 'Mbappe', habilidades: ['Ataque', 'Velocidade'] },
        { id: 2, nome: 'Ruddiger', habilidades: ['Defesa', 'Resistência'] },
      ]
    }
  ];

  onEquipeAdicionada(equipe: Equipe) {
    this.equipes.push({ ...equipe, id: Date.now(), membros: [] });
  }

  onEquipeEditada(equipe: Equipe) {
    const index = this.equipes.findIndex(e => e.id === equipe.id);
    this.equipes[index] = equipe;
  }

  onEquipeRemovida(id: number) {
    this.equipes = this.equipes.filter(e => e.id !== id);
  }
}
