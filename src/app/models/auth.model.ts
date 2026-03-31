import { Usuario } from './usuario.model';

export interface LoginPayload {
    username: string;
    senha: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    user: Usuario;
}
