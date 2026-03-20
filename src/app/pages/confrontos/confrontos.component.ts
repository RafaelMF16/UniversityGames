import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContainerPrincipalComponent } from '../../components/container-principal/container-principal.component';
import { ConfrontoFormCardComponent } from '../../components/confronto-form-card/confronto-form-card.component';
import { ConfrontosListaCardComponent } from '../../components/confrontos-lista-card/confrontos-lista-card.component';
import { EditarPlacarDialogComponent } from '../../components/editar-placar-dialog/editar-placar-dialog.component';
import { Confronto } from '../../models/confronto.model';
import { Equipe } from '../../models/equipe.model';

@Component({
  selector: 'app-confrontos',
  standalone: true,
  imports: [
    ContainerPrincipalComponent,
    ConfrontosListaCardComponent,
    MatDialogModule
  ],
  templateUrl: './confrontos.component.html',
  styleUrl: './confrontos.component.css'
})
export class ConfrontosComponent {
  equipes: Equipe[] = [
    { id: 1, nome: 'Engenharia FC', responsavel: '', email: '', modalidade: 'Futsal', membros: [] },
    { id: 2, nome: 'Marketing United', responsavel: '', email: '', modalidade: 'Futsal', membros: [] },
    { id: 3, nome: 'Financeiro Titans', responsavel: '', email: '', modalidade: 'Basquete', membros: [] },
    { id: 4, nome: 'RH Eagles', responsavel: '', email: '', modalidade: 'Basquete', membros: [] },
    { id: 5, nome: 'Vendas Sharks', responsavel: '', email: '', modalidade: 'Volei', membros: [] },
    { id: 6, nome: 'Product Lions', responsavel: '', email: '', modalidade: 'Natacao', membros: [] }
  ];

  confrontos: Confronto[] = [
    { id: 1, equipeA: 'Engenharia FC', equipeB: 'Marketing United', data: '2026-03-22', horario: '19:30', local: 'Quadra A', modalidade: 'Futsal', status: 'agendado' },
    { id: 2, equipeA: 'Financeiro Titans', equipeB: 'RH Eagles', data: '2026-03-20', horario: '18:00', local: 'Quadra Principal', modalidade: 'Basquete', golsA: 3, golsB: 1, status: 'encerrado' },
    { id: 3, equipeA: 'Vendas Sharks', equipeB: 'Product Lions', data: '2026-03-24', horario: '20:00', local: 'Arena Tech', modalidade: 'Volei', status: 'ao-vivo' }
  ];

  constructor(private readonly dialog: MatDialog) {}

  get nomesEquipes(): string[] {
    return this.equipes.map((equipe) => equipe.nome);
  }

  get modalidades(): string[] {
    return Array.from(new Set(this.confrontos.map((confronto) => confronto.modalidade).filter(Boolean) as string[]));
  }

  get locais(): string[] {
    return Array.from(new Set(this.confrontos.map((confronto) => confronto.local)));
  }

  abrirModalConfronto(confronto?: Confronto) {
    const ref = this.dialog.open(ConfrontoFormCardComponent, {
      width: '720px',
      maxWidth: '94vw',
      panelClass: 'dialog-sem-borda',
      data: {
        equipes: this.equipes,
        confronto: confronto ?? null
      }
    });

    ref.afterClosed().subscribe((resultado) => {
      if (!resultado) {
        return;
      }

      if (confronto) {
        this.onConfrontoAtualizado(resultado);
        return;
      }

      this.onConfrontoCriado(resultado);
    });
  }

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
