export type UserRole = 'admin' | 'juiz' | 'capitao' | 'visitante';
export type ManagedUserRole = Exclude<UserRole, 'visitante'>;

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    role: UserRole;
    equipeId?: number | null;
    ativo: boolean;
}

export interface UsuarioPayload {
    nome: string;
    email: string;
    senha?: string;
    role: ManagedUserRole;
    equipeId?: number | null;
    ativo: boolean;
}
