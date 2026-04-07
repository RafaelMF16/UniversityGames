export type CategoriaEsporte = 'coletivo' | 'individual';
export type ModalidadeEquipe = 'Futsal' | 'Volei' | 'Queimada' | 'Basquete' | 'Natacao';

export interface ModalidadeEsporteConfig {
    valor: ModalidadeEquipe;
    label: string;
    categoria: CategoriaEsporte;
    permiteMembros: boolean;
    usaPlacar: boolean;
}

export const MODALIDADES_CONFIG: ModalidadeEsporteConfig[] = [
    { valor: 'Futsal', label: 'Futsal', categoria: 'coletivo', permiteMembros: true, usaPlacar: true },
    { valor: 'Volei', label: 'Volei', categoria: 'coletivo', permiteMembros: true, usaPlacar: true },
    { valor: 'Queimada', label: 'Queimada', categoria: 'coletivo', permiteMembros: true, usaPlacar: true },
    { valor: 'Basquete', label: 'Basquete', categoria: 'coletivo', permiteMembros: true, usaPlacar: true },
    { valor: 'Natacao', label: 'Natacao', categoria: 'individual', permiteMembros: false, usaPlacar: false }
];

export const MODALIDADES_EQUIPE: ModalidadeEquipe[] = MODALIDADES_CONFIG.map((item) => item.valor);

export interface Membro {
    id: number;
    nome: string;
    habilidades: string[];
    funcao?: string;
}

export interface Equipe {
    id: number;
    nome: string;
    responsavel?: string | null;
    curso: string;
    periodo: string;
    modalidade: ModalidadeEquipe;
    membros: Membro[];
    usuarioId?: number | null;
    icone?: string;
}

export type MembroPayload = Omit<Membro, 'id'> & { id?: number };
export type EquipePayload = Omit<Equipe, 'id' | 'membros'> & { membros: MembroPayload[] };

export function getModalidadeConfig(modalidade: ModalidadeEquipe | string | null | undefined) {
    return MODALIDADES_CONFIG.find((item) => item.valor === modalidade) ?? null;
}

export function getModalidadeLabel(modalidade: ModalidadeEquipe | string | null | undefined) {
    return getModalidadeConfig(modalidade)?.label ?? String(modalidade ?? '');
}

export function getModalidadesPorCategoria(categoria: CategoriaEsporte) {
    return MODALIDADES_CONFIG.filter((item) => item.categoria === categoria);
}

export function modalidadePermiteMembros(modalidade: ModalidadeEquipe | string | null | undefined) {
    return getModalidadeConfig(modalidade)?.permiteMembros ?? false;
}

export function modalidadeEhIndividual(modalidade: ModalidadeEquipe | string | null | undefined) {
    return getModalidadeConfig(modalidade)?.categoria === 'individual';
}

export function modalidadeEhColetiva(modalidade: ModalidadeEquipe | string | null | undefined) {
    return getModalidadeConfig(modalidade)?.categoria === 'coletivo';
}

export function modalidadeUsaPlacar(modalidade: ModalidadeEquipe | string | null | undefined) {
    return getModalidadeConfig(modalidade)?.usaPlacar ?? true;
}
