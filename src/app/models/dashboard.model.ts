import { Confronto } from './confronto.model';

export interface ResumoDashboard {
    totalEquipes: number;
    totalConfrontos: number;
    proximosConfrontos: Confronto[];
}
