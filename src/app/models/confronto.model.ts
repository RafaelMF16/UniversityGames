import { ModalidadeEquipe } from './equipe.model';

export type StatusConfronto = 'agendado' | 'ao-vivo' | 'encerrado';

export interface Confronto {
    id: number;
    equipeA: string;
    equipeB: string;
    data: string;
    horario: string;
    local: string;
    golsA?: number | null;
    golsB?: number | null;
    modalidade: ModalidadeEquipe;
    status: StatusConfronto;
    destaque?: boolean;
    periodoAtual?: string;
    duracao?: string;
    fase?: string;
}

export type ConfrontoPayload = Omit<Confronto, 'id'>;

export interface ConfrontosFiltros {
    busca?: string;
    equipe?: string;
    modalidade?: ModalidadeEquipe | '' | undefined;
    status?: StatusConfronto | '' | undefined;
}
