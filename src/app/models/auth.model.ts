import { Usuario } from './usuario.model';

export interface LoginPayload {
    username: string;
    senha: string;
}

export interface VisitorRegisterPayload {
    nome: string;
    username: string;
    senha: string;
    curso: string;
    periodo: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    user: Usuario;
}
