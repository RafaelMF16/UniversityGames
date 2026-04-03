import { Component, Input } from '@angular/core';
import { PrevisaoConfronto } from '../../models/confronto.model';

@Component({
  selector: 'app-prediction-summary',
  standalone: true,
  templateUrl: './prediction-summary.component.html',
  styleUrl: './prediction-summary.component.css'
})
export class PredictionSummaryComponent {
  @Input({ required: true }) previsao!: PrevisaoConfronto;
  @Input({ required: true }) participanteA!: string;
  @Input({ required: true }) participanteB!: string;

  get percentageA() {
    return this.previsao.chanceA ?? 50;
  }

  get percentageB() {
    return this.previsao.chanceB ?? 50;
  }

  get statusLabel() {
    if (this.previsao.precisaRegerar) {
      return 'Previsao desatualizada';
    }

    if (this.previsao.status === 'error') {
      return 'Previsao indisponivel';
    }

    if (this.previsao.status !== 'ready') {
      return 'Gerando previsao';
    }

    return 'Previsao salva';
  }

  get resumo() {
    if (this.previsao.precisaRegerar) {
      return 'Os dados do confronto mudaram. Regere para atualizar a analise.';
    }

    return this.previsao.resumo ?? 'A previsao sera exibida aqui assim que estiver pronta.';
  }
}
