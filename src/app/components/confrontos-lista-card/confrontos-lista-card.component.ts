import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Confronto, ConfrontosFiltros, StatusConfronto } from '../../models/confronto.model';
import { ModalidadeEsporteConfig, ModalidadeEquipe } from '../../models/equipe.model';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-confrontos-lista-card',
  standalone: true,
  imports: [FormsModule, LoadingIndicatorComponent],
  templateUrl: './confrontos-lista-card.component.html',
  styleUrl: './confrontos-lista-card.component.css'
})
export class ConfrontosListaCardComponent {
  @Input() confrontos: Confronto[] = [];
  @Input() equipes: string[] = [];
  @Input() modalidades: ModalidadeEsporteConfig[] = [];
  @Input() carregando = false;
  @Output() verDetalhesClicado = new EventEmitter<number>();
  @Output() filtrosAlterados = new EventEmitter<ConfrontosFiltros>();

  equipeSelecionada = '';
  modalidadeSelecionada: ModalidadeEquipe | '' = '';
  statusSelecionado: StatusConfronto | '' = '';

  onFiltroAlterado() {
    this.filtrosAlterados.emit({
      equipe: this.equipeSelecionada,
      modalidade: this.modalidadeSelecionada,
      status: this.statusSelecionado
    });
  }

  statusLabel(status: StatusConfronto) {
    if (status === 'encerrado') {
      return 'Finalizado';
    }

    if (status === 'ao-vivo') {
      return 'Ao vivo';
    }

    return 'Agendado';
  }

  modalidadeLabel(modalidade: ModalidadeEquipe) {
    return this.modalidades.find((item) => item.valor === modalidade)?.label ?? modalidade;
  }

  formatarData(data: string) {
    if (!data) {
      return '';
    }

    const [ano, mes, dia] = data.split('-');
    if (!ano || !mes || !dia) {
      return data;
    }

    return `${dia}/${mes}/${ano}`;
  }
}
