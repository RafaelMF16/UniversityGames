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
    { id: 1, nome: 'Dragões FC', responsavel: '', email: '', membros: [] },
    { id: 2, nome: 'Águias United', responsavel: '', email: '', membros: [] },
    { id: 3, nome: 'Leões SC', responsavel: '', email: '', membros: [] },
  ];

  confrontos: Confronto[] = [
    { id: 1, equipeA: 'Dragões FC', equipeB: 'Águias United', data: '09/03/2026', horario: '19:00', local: 'Ginásio Central', golsA: 3, golsB: 1 },
    { id: 2, equipeA: 'Leões SC', equipeB: 'Falcões FC', data: '11/03/2026', horario: '20:00', local: 'Quadra Norte' },
  ];

  constructor(private dialog: MatDialog) { }

  abrirDialogPlacar(confronto: Confronto) {
    const ref = this.dialog.open(EditarPlacarDialogComponent, {
      data: confronto,
      width: '440px',
      panelClass: 'dialog-sem-borda'
    });
    ref.afterClosed().subscribe(resultado => {
      if (resultado) this.onPlacarAtualizado(resultado);
    });
  }

  onConfrontoCriado(c: Confronto) {
    this.confrontos.push(c);
  }

  onConfrontoAtualizado(c: Confronto) {
    const i = this.confrontos.findIndex(x => x.id === c.id);
    this.confrontos[i] = c;
    this.confrontoEditando = null;
  }

  onConfrontoRemovido(id: number) {
    this.confrontos = this.confrontos.filter(c => c.id !== id);
  }

  onPlacarAtualizado(c: Confronto) {
    const i = this.confrontos.findIndex(x => x.id === c.id);
    this.confrontos[i] = c;
  }
}
