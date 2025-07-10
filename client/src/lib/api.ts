import { authService } from "./auth";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || response.statusText;
      } catch {
        errorMessage = text || response.statusText;
      }
      throw new Error(`${response.status}: ${errorMessage}`);
    }

    return await response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();

// API endpoints
export const api = {
  // Auth
  auth: {
    login: (credentials: any) => apiClient.post('/auth/login', credentials),
    register: (userData: any) => apiClient.post('/auth/register', userData),
    getCurrentUser: () => apiClient.get('/auth/me'),
  },

  // Master Data
  masterData: {
    getCities: () => apiClient.get('/master-data/cities'),
    getClustersByCity: (cityId: number) => apiClient.get(`/master-data/cities/${cityId}/clusters`),
    getRoles: () => apiClient.get('/master-data/roles'),
    getVendors: () => apiClient.get('/master-data/vendors'),
    getRecruiters: () => apiClient.get('/master-data/recruiters'),
    createCity: (data: any) => apiClient.post('/master-data/cities', data),
    createCluster: (data: any) => apiClient.post('/master-data/clusters', data),
    createRole: (data: any) => apiClient.post('/master-data/roles', data),
    createVendor: (data: any) => apiClient.post('/master-data/vendors', data),
    createRecruiter: (data: any) => apiClient.post('/master-data/recruiters', data),
  },

  // Hiring
  hiring: {
    createRequest: (data: any) => apiClient.post('/hiring', data),
    getRequests: (filters?: any) => apiClient.get('/hiring' + (filters ? `?${new URLSearchParams(filters)}` : '')),
    getRequest: (id: number) => apiClient.get(`/hiring/${id}`),
    updateRequestStatus: (id: number, status: string) => 
      apiClient.patch(`/hiring/${id}/status`, { status }),
  },

  // Interviews
  interviews: {
    createCandidate: (data: any) => apiClient.post('/interviews/candidates', data),
    getCandidates: (filters?: any) => apiClient.get('/interviews/candidates' + (filters ? `?${new URLSearchParams(filters)}` : '')),
    getCandidate: (id: number) => apiClient.get(`/interviews/candidates/${id}`),
    updatePrescreening: (id: number, data: any) => 
      apiClient.patch(`/interviews/candidates/${id}/prescreening`, data),
    updateScreening: (id: number, data: any) => 
      apiClient.patch(`/interviews/candidates/${id}/screening`, data),
    updateTechnical: (id: number, data: any) => 
      apiClient.patch(`/interviews/candidates/${id}/technical`, data),
    updateOffer: (id: number, data: any) => 
      apiClient.patch(`/interviews/candidates/${id}/offer`, data),
  },

  // Training
  training: {
    createSession: (data: any) => apiClient.post('/training', data),
    getSessions: (filters?: any) => apiClient.get('/training' + (filters ? `?${new URLSearchParams(filters)}` : '')),
    updateSession: (id: number, data: any) => apiClient.patch(`/training/${id}`, data),
    markAttendance: (id: number, data: any) => apiClient.post(`/training/${id}/attendance`, data),
    markFitness: (id: number, data: any) => apiClient.patch(`/training/${id}/fitness`, data),
    confirmFTE: (id: number, data: any) => apiClient.patch(`/training/${id}/fte`, data),
  },

  // Employees
  employees: {
    create: (data: any) => apiClient.post('/employees', data),
    getAll: (filters?: any) => apiClient.get('/employees' + (filters ? `?${new URLSearchParams(filters)}` : '')),
    getById: (id: number) => apiClient.get(`/employees/${id}`),
    update: (id: number, data: any) => apiClient.patch(`/employees/${id}`, data),
    createAction: (id: number, data: any) => apiClient.post(`/employees/${id}/actions`, data),
    getActions: (id: number) => apiClient.get(`/employees/${id}/actions`),
    updateAction: (actionId: number, data: any) => apiClient.patch(`/employees/actions/${actionId}`, data),
  },

  // Analytics
  analytics: {
    getHiringAnalytics: (filters?: any) => apiClient.get('/analytics/hiring' + (filters ? `?${new URLSearchParams(filters)}` : '')),
    getPipeline: () => apiClient.get('/analytics/pipeline'),
    getVendorPerformance: () => apiClient.get('/analytics/vendors'),
    getRecruiterPerformance: () => apiClient.get('/analytics/recruiters'),
  },
};
