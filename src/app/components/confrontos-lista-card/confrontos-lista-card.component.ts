import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Confronto, ConfrontosFiltros, StatusConfronto } from '../../models/confronto.model';
import { ModalidadeEquipe } from '../../models/equipe.model';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-confrontos-lista-card',
  standalone: true,
  imports: [FormsModule, MatIcon, LoadingIndicatorComponent],
  templateUrl: './confrontos-lista-card.component.html',
  styleUrl: './confrontos-lista-card.component.css'
})
export class ConfrontosListaCardComponent {
  @Input() confrontos: Confronto[] = [];
  @Input() equipes: string[] = [];
  @Input() modalidades: string[] = [];
  @Input() carregando = false;
  @Input() podeGerenciar = false;
  @Input() removendoId: number | null = null;
  @Input() placarSalvandoId: number | null = null;
  @Output() editarConfrontoClicado = new EventEmitter<Confronto>();
  @Output() editarPlacarClicado = new EventEmitter<Confronto>();
  @Output() confrontoRemovido = new EventEmitter<number>();
  @Output() filtrosAlterados = new EventEmitter<ConfrontosFiltros>();

  equipeSelecionada = '';
  modalidadeSelecionada: ModalidadeEquipe | '' = '';
  statusSelecionado: StatusConfronto | '' = '';

  onFiltroAlterado() {
    this.emitirFiltros();
  }

  private emitirFiltros() {
    this.filtrosAlterados.emit({
      equipe: this.equipeSelecionada,
      modalidade: this.modalidadeSelecionada,
      status: this.statusSelecionado
    });
  }

  placar(confronto: Confronto) {
    if (confronto.golsA === undefined || confronto.golsA === null || confronto.golsB === undefined || confronto.golsB === null) {
      return '- : -';
    }

    return `${confronto.golsA} : ${confronto.golsB}`;
  }

  statusLabel(confronto: Confronto) {
    if (confronto.status === 'encerrado') {
      return 'Finalizado';
    }

    if (confronto.status === 'ao-vivo') {
      return 'Ao vivo';
    }

    return 'Agendado';
  }
}
