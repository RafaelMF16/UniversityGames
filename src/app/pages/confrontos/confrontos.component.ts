import { Component } from '@angular/core';
import { ContainerPrincipalComponent } from "../../components/container-principal/container-principal.component";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { Confronto } from '../../models/confronto.model';
import { Equipe } from '../../models/equipe.model';
import { ConfrontoFormCardComponent } from "../../components/confronto-form-card/confronto-form-card.component";
import { ConfrontosListaCardComponent } from "../../components/confrontos-lista-card/confrontos-lista-card.component";
import { EditarPlacarDialogComponent } from '../../components/editar-placar-dialog/editar-placar-dialog.component';

@Component({
  selector: 'app-confrontos',
  standalone: true,
  imports: [
    ContainerPrincipalComponent,
    ConfrontoFormCardComponent,
    ConfrontosListaCardComponent,
    MatDialogModule
  ],
  templateUrl: './confrontos.component.html',
  styleUrl: './confrontos.component.css'
})
export class ConfrontosComponent {
  confrontoEditando: Confronto | null = null;

  equipes: Equipe[] = [
    { id: 1, nome: 'Engenharia FC', responsavel: '', email: '', membros: [] },
    { id: 2, nome: 'Marketing United', responsavel: '', email: '', membros: [] },
    { id: 3, nome: 'Financeiro Titans', responsavel: '', email: '', membros: [] },
    { id: 4, nome: 'RH Eagles', responsavel: '', email: '', membros: [] },
    { id: 5, nome: 'Vendas Sharks', responsavel: '', email: '', membros: [] },
    { id: 6, nome: 'Product Lions', responsavel: '', email: '', membros: [] }
  ];

  confrontos: Confronto[] = [
    { id: 1, equipeA: 'Engenharia FC', equipeB: 'Marketing United', data: '12 Nov, 2024', horario: '19:30', local: 'Quadra A', modalidade: 'Futsal', status: 'agendado' },
    { id: 2, equipeA: 'Financeiro Titans', equipeB: 'RH Eagles', data: '08 Nov, 2024', horario: '18:00', local: 'Quadra Principal', modalidade: 'Futsal', golsA: 3, golsB: 1, status: 'encerrado' },
    { id: 3, equipeA: 'Vendas Sharks', equipeB: 'Product Lions', data: '15 Nov, 2024', horario: '20:00', local: 'Arena Tech', modalidade: 'Futsal', status: 'agendado' }
  ];

  constructor(private dialog: MatDialog) { }

  abrirDialogPlacar(confronto: Confronto) {
    const ref = this.dialog.open(EditarPlacarDialogComponent, {
      data: confronto,
      width: '540px',
      panelClass: 'dialog-sem-borda'
    });

    ref.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.onPlacarAtualizado(resultado);
      }
    });
  }

  onConfrontoCriado(confronto: Confronto) {
    this.confrontos = [confronto, ...this.confrontos];
  }

  onConfrontoAtualizado(confronto: Confronto) {
    const indice = this.confrontos.findIndex((item) => item.id === confronto.id);
    if (indice >= 0) {
      this.confrontos[indice] = confronto;
    }
    this.confrontoEditando = null;
  }

  onConfrontoRemovido(id: number) {
    this.confrontos = this.confrontos.filter((item) => item.id !== id);
  }

  onPlacarAtualizado(confronto: Confronto) {
    const indice = this.confrontos.findIndex((item) => item.id === confronto.id);
    if (indice >= 0) {
      this.confrontos[indice] = { ...confronto, status: 'encerrado' };
    }
  }
}
