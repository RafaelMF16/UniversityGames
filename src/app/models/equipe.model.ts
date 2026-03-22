export type ModalidadeEquipe = 'Futsal' | 'Volei' | 'Basquete' | 'Natacao' | 'Atletismo';
export const MODALIDADES_EQUIPE: ModalidadeEquipe[] = ['Futsal', 'Volei', 'Basquete', 'Natacao', 'Atletismo'];

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
    modalidade: ModalidadeEquipe;
    membros: Membro[];
    icone?: string;
}

export type MembroPayload = Omit<Membro, 'id'> & { id?: number };
export type EquipePayload = Omit<Equipe, 'id' | 'membros'> & { membros: MembroPayload[] };
