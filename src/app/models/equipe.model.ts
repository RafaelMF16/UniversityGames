export interface Membro {
    id: number;
    nome: string;
    habilidades: string[];
}

export interface Equipe {
    id: number;
    nome: string;
    responsavel: string;
    email: string;
    membros: Membro[];
}