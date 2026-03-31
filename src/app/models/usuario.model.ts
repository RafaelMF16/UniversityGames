export type UserRole = 'admin' | 'juiz' | 'capitao' | 'visitante';
export type ManagedUserRole = Exclude<UserRole, 'visitante'>;

export interface Usuario {
    id: number;
    nome: string;
    username: string;
    role: UserRole;
    equipeId?: number | null;
    ativo: boolean;
}

export interface UsuarioPayload {
    nome: string;
    username: string;
    senha?: string;
    role: ManagedUserRole;
    equipeId?: number | null;
    ativo: boolean;
}
