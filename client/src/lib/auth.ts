import axios, { AxiosError } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  userId: string;
  email: string;
  password: string;
  name?: string;
  role: 'admin' | 'hr' | 'recruiter' | 'manager' | 'trainer';
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    userId: string;
    email: string;
    name: string;
    role: string;
  };
}

const TOKEN_KEY = 'hrms_auth_token';

// Create axios instance for auth
const authApiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for auth
authApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      // Clear expired token and redirect to login
      const authService = AuthService.getInstance();
      authService.removeToken();
      window.location.reload(); // This will redirect to login since no token exists
    }
    const message = error.response?.data?.message || error.message;
    throw new Error(`${error.response?.status || 500}: ${message}`);
  }
);

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await authApiClient.post("/auth/login", credentials);
    
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await authApiClient.post("/auth/register", userData);
    return response.data;
  }

  async getCurrentUser() {
    try {
      const token = this.getToken();
      const response = await authApiClient.get("/auth/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
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
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Check if token is expired by parsing the JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, remove it
        this.removeToken();
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid token format, remove it
      this.removeToken();
      return false;
    }
  }

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = AuthService.getInstance();
