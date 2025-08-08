import axios, { AxiosError } from 'axios';

export class ApiClient {
  private apiClient;

  constructor(baseUrl: string = '/api') {
    this.apiClient = axios.create({
      baseURL: baseUrl,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('hrms_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle errors and token expiration
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle token expiration
        if (error.response?.status === 401) {
          // Clear expired token and redirect to login
          localStorage.removeItem('hrms_auth_token');
          window.location.reload(); // This will redirect to login since no token exists
        }
        const message = (error.response?.data as any)?.message || error.message;
        throw new Error(`${error.response?.status || 500}: ${message}`);
      }
    );
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.apiClient.get(endpoint);
    return response.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.apiClient.post(endpoint, data);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.apiClient.patch(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.apiClient.delete(endpoint);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.apiClient.put(endpoint, data);
    return response.data;
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
