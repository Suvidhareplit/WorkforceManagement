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

// Request interceptor to add auth token
authApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
    const message = (error.response?.data as any)?.message || error.message;
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
    
    // Handle the nested response structure: { success: true, data: { token, user }, message }
    const authData = response.data.data;
    
    if (authData.token) {
      this.setToken(authData.token);
    }
    
    return authData;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await authApiClient.post("/auth/register", userData);
    return response.data;
  }

  async getCurrentUser() {
    try {
      console.log('🔍 Fetching current user from API...');
      const response = await authApiClient.get("/auth/me");
      console.log('📡 API Response:', response.data);
      
      // Handle the nested response structure: { success: true, data: user, message }
      const userData = response.data.data;
      console.log('👤 User data extracted:', userData);
      
      return { user: userData };
    } catch (error) {
      console.error('❌ getCurrentUser failed:', error);
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
    console.log('🔐 Checking authentication, token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token found');
      return false;
    }
    
    try {
      // Check if token is expired by parsing the JWT payload
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('❌ Invalid token format');
        this.removeToken();
        return false;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      console.log('🕰️ Token expires at:', new Date(payload.exp * 1000).toLocaleString());
      console.log('🕰️ Current time:', new Date().toLocaleString());
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, remove it
        console.log('❌ Token is expired');
        this.removeToken();
        return false;
      }
      
      console.log('✅ Token is valid');
      return true;
    } catch (error) {
      // Invalid token format, remove it
      console.error('❌ Token validation error:', error);
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
