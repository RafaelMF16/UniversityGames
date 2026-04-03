import { ModalidadeEquipe } from './equipe.model';

export type StatusConfronto = 'agendado' | 'ao-vivo' | 'encerrado';
export type StatusPrevisao = 'pending' | 'ready' | 'error';

export interface PrevisaoConfronto {
    status: StatusPrevisao;
    chanceA?: number | null;
    chanceB?: number | null;
    favorito?: string | null;
    resumo?: string | null;
    modelo?: string | null;
    geradaEm?: string | null;
    precisaRegerar: boolean;
    erro?: string | null;
}

export interface Confronto {
    id: number;
    equipeA: string;
    equipeB: string;
    participanteAId?: number | null;
    participanteBId?: number | null;
    data: string;
    horario: string;
    local: string;
    golsA?: number | null;
    golsB?: number | null;
    vencedor?: string | null;
    modalidade: ModalidadeEquipe;
    status: StatusConfronto;
    destaque?: boolean;
    periodoAtual?: string;
    duracao?: string;
    fase?: string;
    previsao: PrevisaoConfronto;
}

export type ConfrontoPayload = Omit<Confronto, 'id' | 'previsao'>;

export interface ConfrontosFiltros {
    busca?: string;
    equipe?: string;
    modalidade?: ModalidadeEquipe | '' | undefined;
    status?: StatusConfronto | '' | undefined;
}
