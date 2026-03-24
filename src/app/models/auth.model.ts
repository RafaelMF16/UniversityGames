import { Usuario } from './usuario.model';

export interface LoginPayload {
    email: string;
    senha: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    user: Usuario;
}
