import { ModalidadeEquipe } from './equipe.model';

export type StatusConfronto = 'agendado' | 'ao-vivo' | 'encerrado';

export interface Confronto {
    id: number;
    equipeA: string;
    equipeB: string;
    data: string;
    horario: string;
    local: string;
    golsA?: number;
    golsB?: number;
    modalidade: ModalidadeEquipe;
    status: StatusConfronto;
    destaque?: boolean;
    periodoAtual?: string;
    duracao?: string;
    fase?: string;
}
