import { Component } from '@angular/core';
import { ContainerPrincipalComponent } from "../../components/container-principal/container-principal.component";
import { CadastrarEquipeCardComponent } from "../../components/cadastrar-equipe-card/cadastrar-equipe-card.component";
import { Equipe } from '../../models/equipe.model';
import { EquipeCardComponent } from "../../components/equipe-card/equipe-card.component";

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [
    ContainerPrincipalComponent,
    CadastrarEquipeCardComponent,
    EquipeCardComponent
  ],
  templateUrl: './equipes.component.html',
  styleUrl: './equipes.component.css'
})
export class EquipesComponent {
  equipeEditando: Equipe | null = null;

  equipes: Equipe[] = [
    {
      id: 1,
      nome: 'Os Galaticos',
      responsavel: 'Joao Pereira',
      email: 'joao@fpm.edu.br',
      modalidade: 'Futsal',
      sigla: 'OG',
      cor: 'linear-gradient(180deg, #278eff 0%, #1455b7 100%)',
      membros: [
        { id: 11, nome: 'Joao Pereira', funcao: 'Capitao', habilidades: ['Lideranca', 'Passe'] },
        { id: 12, nome: 'Ana Carla', funcao: 'Membro', habilidades: ['Velocidade', 'Ataque'] }
      ]
    },
    {
      id: 2,
      nome: 'Esquadrao Fenix',
      responsavel: 'Mariana Costa',
      email: 'mariana@fpm.edu.br',
      modalidade: 'Volei',
      sigla: 'EF',
      cor: 'linear-gradient(180deg, #ff9736 0%, #a54a04 100%)',
      membros: [
        { id: 21, nome: 'Mariana Costa', funcao: 'Capitao', habilidades: ['Lideranca', 'Tatica'] },
        { id: 22, nome: 'Ricardo Alves', funcao: 'Membro', habilidades: ['Defesa', 'Resistencia'] },
        { id: 23, nome: 'Beatriz Silveira', funcao: 'Membro', habilidades: ['Passe', 'Comunicacao'] },
        { id: 24, nome: 'Luiz Felipe', funcao: 'Membro', habilidades: ['Ataque', 'Finalizacao'] }
      ]
    },
    {
      id: 3,
      nome: 'Relampago FPM',
      responsavel: 'Carlos Eduardo',
      email: 'carlos@fpm.edu.br',
      modalidade: 'Basquete',
      sigla: 'RF',
      cor: 'linear-gradient(180deg, #2fd6a6 0%, #0d6b53 100%)',
      membros: [
        { id: 31, nome: 'Carlos Eduardo', funcao: 'Capitao', habilidades: ['Velocidade', 'Ataque'] }
      ]
    },
    {
      id: 4,
      nome: 'Diamantes Negros',
      responsavel: 'Fernanda Lima',
      email: 'fernanda@fpm.edu.br',
      modalidade: 'Atletismo',
      sigla: 'DN',
      cor: 'linear-gradient(180deg, #a35cff 0%, #51208f 100%)',
      membros: [
        { id: 41, nome: 'Fernanda Lima', funcao: 'Capitao', habilidades: ['Defesa', 'Lideranca'] }
      ]
    }
  ];

  onEquipeAdicionada(equipe: Equipe) {
    this.equipes = [
      {
        ...equipe,
        id: Date.now(),
        sigla: equipe.nome.slice(0, 2).toUpperCase(),
        membros: []
      },
      ...this.equipes
    ];
  }

  iniciarEdicao(equipe: Equipe) {
    this.equipeEditando = { ...equipe };
  }

  onEquipeAtualizada(equipe: Equipe) {
    const index = this.equipes.findIndex((item) => item.id === equipe.id);
    if (index >= 0) {
      this.equipes[index] = { ...equipe };
    }
    this.equipeEditando = null;
  }

  onEquipeRemovida(id: number) {
    this.equipes = this.equipes.filter((item) => item.id !== id);
    if (this.equipeEditando?.id === id) {
      this.equipeEditando = null;
    }
  }
}
