export interface Membro {
    id: number;
    nome: string;
    habilidades: string[];
    funcao?: string;
}

export interface Equipe {
    id: number;
    nome: string;
    responsavel: string;
    email: string;
    membros: Membro[];
    icone?: string;
    cor?: string;
    sigla?: string;
}
