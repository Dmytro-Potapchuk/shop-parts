import axios from 'axios';
import { BASE_API_URL } from '../config';
import { User } from '../types.tsx';

const AUTH_API_BASE = `${BASE_API_URL}/users`;

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    role: User['role'];
}

interface RegisterPayload {
    username: string;
    password: string;
}

type RegisterResponse = Omit<User, 'password'>;

export const login = async (
    username: string,
    password: string
): Promise<LoginResponse> => {
    try {
        const response = await axios.post<LoginResponse>(
            `${AUTH_API_BASE}/login`,
            { username, password }
        );

        const { accessToken, refreshToken, role } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('role', role);

        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            const message =
                typeof error.response.data?.message === 'string'
                    ? error.response.data.message
                    : 'Błąd logowania';

            throw new Error(message);   // ✅ TERAZ zawsze rzucamy Error
        }

        throw new Error('Nieoczekiwany błąd podczas logowania.');
    }
};

export const register = async (
    userData: RegisterPayload
): Promise<RegisterResponse> => {
    try {
        const response = await axios.post<RegisterResponse>(
            `${AUTH_API_BASE}/register`,
            userData
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw (
                error.response.data.message ||
                error.response.data ||
                new Error('Błąd rejestracji. Spróbuj ponownie.')
            );
        }
        throw new Error('Wystąpił nieoczekiwany błąd podczas rejestracji.');
    }
};

export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
};

export const getRole = (): User['role'] | null => {
    return localStorage.getItem('role') as User['role'] | null;
};

export const getToken = (): string | null => {
    return localStorage.getItem('accessToken');
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};
