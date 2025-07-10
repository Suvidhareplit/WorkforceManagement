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
    name: string;
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
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: credentials,
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return await apiRequest("/api/auth/register", {
      method: "POST",
      body: userData,
    });
  }

  async getCurrentUser() {
    try {
      return await apiRequest("/api/auth/me", {
        method: "GET",
      });
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
