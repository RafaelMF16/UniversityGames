export interface Confronto {
    id: number;
    equipeA: string;
    equipeB: string;
    data: string;
    horario: string;
    local: string;
    golsA?: number;
    golsB?: number;
    modalidade?: string;
    status?: 'agendado' | 'ao-vivo' | 'encerrado';
    destaque?: boolean;
    periodoAtual?: string;
    duracao?: string;
    fase?: string;
}
