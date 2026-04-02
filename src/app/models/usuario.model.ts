export type UserRole = 'admin' | 'juiz' | 'capitao' | 'visitante';
export type ManagedUserRole = UserRole;

export interface Usuario {
    id: number;
    nome: string;
    username: string;
    role: UserRole;
    equipeId?: number | null;
    curso?: string | null;
    periodo?: string | null;
    ativo: boolean;
}

export interface UsuarioPayload {
    nome: string;
    username: string;
    senha?: string;
    role: ManagedUserRole;
    equipeId?: number | null;
    curso?: string | null;
    periodo?: string | null;
    ativo: boolean;
}
