import { apiRequest } from "./queryClient";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'hr' | 'recruiter' | 'manager' | 'trainer';
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
}

const TOKEN_KEY = 'hrms_auth_token';

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    const data = await response.json();
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    return await response.json();
  }

  async getCurrentUser() {
    try {
      const response = await apiRequest('GET', '/api/auth/me');
      return await response.json();
    } catch (error) {
      this.removeToken();
      throw error;
    }
  }

  logout(): void {
    this.removeToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = AuthService.getInstance();
