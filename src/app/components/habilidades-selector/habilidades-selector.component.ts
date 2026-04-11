import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HABILIDADES_DISPONIVEIS, MAX_HABILIDADES_POR_MEMBRO } from '../../models/equipe.model';

@Component({
  selector: 'app-habilidades-selector',
  standalone: true,
  templateUrl: './habilidades-selector.component.html',
  styleUrl: './habilidades-selector.component.css'
})
export class HabilidadesSelectorComponent {
  @Input() selected: string[] = [];
  @Input() label = 'Habilidades';
  @Input() helperText = `Escolha ate ${MAX_HABILIDADES_POR_MEMBRO} habilidades ja cadastradas no projeto.`;
  @Input() availableSkills: readonly string[] = HABILIDADES_DISPONIVEIS;
  @Output() selectedChange = new EventEmitter<string[]>();

  readonly maxHabilidades = MAX_HABILIDADES_POR_MEMBRO;

  toggle(habilidade: string) {
    const selecionadas = this.selectedNormalizadas;
    if (!selecionadas.includes(habilidade) && selecionadas.length >= this.maxHabilidades) {
      return;
    }

    const proximoValor = selecionadas.includes(habilidade)
      ? selecionadas.filter((item) => item !== habilidade)
      : [...selecionadas, habilidade];

    this.selectedChange.emit(this.normalizar(proximoValor));
  }

  habilidadeSelecionada(habilidade: string) {
    return this.selectedNormalizadas.includes(habilidade);
  }

  podeSelecionarMais(habilidade: string) {
    return this.habilidadeSelecionada(habilidade) || this.selectedNormalizadas.length < this.maxHabilidades;
  }

  get selectedNormalizadas() {
    return this.normalizar(this.selected);
  }

  get habilidadesDisponiveis() {
    return this.availableSkills?.length ? this.availableSkills : HABILIDADES_DISPONIVEIS;
  }

  private normalizar(habilidades: string[] | null | undefined) {
    return (habilidades ?? [])
      .map((habilidade) => habilidade?.trim() ?? '')
      .filter((habilidade): habilidade is string => !!habilidade)
      .slice(0, MAX_HABILIDADES_POR_MEMBRO);
  }
}
