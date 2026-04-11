export type CategoriaEsporte = 'coletivo' | 'individual';
export type ModalidadeEquipe = 'Futsal' | 'Volei' | 'Queimada' | 'Basquete' | 'Natacao';
export type NivelAtletaIndividual = 'Iniciante' | 'Intermediario' | 'Avancado';

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
export const CAPITAO_FUNCAO = 'Capitao';
export const ATLETA_FUNCAO = 'Atleta';
export const MAX_HABILIDADES_POR_MEMBRO = 3;
export const HABILIDADES_DISPONIVEIS = [
    'Ataque',
    'Defesa',
    'Velocidade',
    'Lideranca',
    'Passe',
    'Resistencia',
    'Tatica',
    'Comunicacao',
    'Drible',
    'Finalizacao'
] as const;
export const HABILIDADES_NATACAO = [
    'Explosao',
    'Resistencia',
    'Tecnica',
    'Ritmo',
    'Virada',
    'Saida',
    'Respiracao',
    'Coordenacao',
    'Concentracao',
    'Consistencia'
] as const;
export const NIVEIS_ATLETA_INDIVIDUAL: NivelAtletaIndividual[] = ['Iniciante', 'Intermediario', 'Avancado'];
export const ESPECIALIDADES_POR_MODALIDADE: Record<'Natacao', string[]> = {
    Natacao: ['Livre', 'Costas', 'Peito', 'Borboleta', 'Medley', 'Resistencia']
};
export const HABILIDADES_POR_MODALIDADE: Partial<Record<ModalidadeEquipe, readonly string[]>> = {
    Natacao: HABILIDADES_NATACAO
};
export const FUNCOES_POR_MODALIDADE: Record<Exclude<ModalidadeEquipe, 'Natacao'>, string[]> = {
    Futsal: ['Goleiro', 'Fixo', 'Ala direita', 'Ala esquerda', 'Pivo'],
    Volei: ['Levantador', 'Oposto', 'Ponteiro', 'Central', 'Libero'],
    Queimada: ['Atacante', 'Defensor', 'Coringa', 'Reserva'],
    Basquete: ['Armador', 'Ala-armador', 'Ala', 'Ala-pivo', 'Pivo']
};
export const LIMITES_INTEGRANTES_POR_MODALIDADE: Record<ModalidadeEquipe, number> = {
    Futsal: 14,
    Volei: 12,
    Queimada: 10,
    Basquete: 12,
    Natacao: 1
};

export interface Membro {
    id: number;
    nome: string;
    habilidades: string[];
    funcao?: string;
    nivel?: NivelAtletaIndividual | null;
    especialidade?: string | null;
    usuarioId?: number | null;
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

export function getLimiteIntegrantes(modalidade: ModalidadeEquipe | string | null | undefined) {
    const modalidadeValida = MODALIDADES_CONFIG.find((item) => item.valor === modalidade)?.valor;
    return modalidadeValida ? LIMITES_INTEGRANTES_POR_MODALIDADE[modalidadeValida] : null;
}

export function membroEhCapitao(membro: Pick<Membro, 'funcao'> | null | undefined) {
    return (membro?.funcao ?? '').trim().toLowerCase() === CAPITAO_FUNCAO.toLowerCase();
}

export function getFuncoesPorModalidade(modalidade: ModalidadeEquipe | string | null | undefined) {
    if (!modalidade || modalidade === 'Natacao') {
        return [];
    }

    const modalidadeValida = MODALIDADES_CONFIG.find((item) => item.valor === modalidade)?.valor;
    if (!modalidadeValida || modalidadeValida === 'Natacao') {
        return [];
    }

    return FUNCOES_POR_MODALIDADE[modalidadeValida];
}

export function getEspecialidadesPorModalidade(modalidade: ModalidadeEquipe | string | null | undefined) {
    if (!modalidade || modalidade !== 'Natacao') {
        return [];
    }

    return ESPECIALIDADES_POR_MODALIDADE.Natacao;
}

export function getHabilidadesPorModalidade(modalidade: ModalidadeEquipe | string | null | undefined) {
    if (!modalidade) {
        return [...HABILIDADES_DISPONIVEIS];
    }

    const modalidadeValida = MODALIDADES_CONFIG.find((item) => item.valor === modalidade)?.valor;
    if (!modalidadeValida) {
        return [...HABILIDADES_DISPONIVEIS];
    }

    return [...(HABILIDADES_POR_MODALIDADE[modalidadeValida] ?? HABILIDADES_DISPONIVEIS)];
}

export function modalidadeUsaHabilidadesEspecificas(modalidade: ModalidadeEquipe | string | null | undefined) {
    const modalidadeValida = MODALIDADES_CONFIG.find((item) => item.valor === modalidade)?.valor;
    return !!(modalidadeValida && HABILIDADES_POR_MODALIDADE[modalidadeValida]);
}
