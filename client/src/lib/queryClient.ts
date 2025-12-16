import { QueryClient, QueryFunction } from "@tanstack/react-query";
import axios, { AxiosError } from 'axios';
import { convertToCamelCase, convertToSnakeCase } from './apiUtils';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors, token expiration, and data conversion
apiClient.interceptors.response.use(
  (response) => {
    // Convert snake_case to camelCase for all responses
    if (response.data) {
      response.data = convertToCamelCase(response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('hrms_auth_token');
      // Only reload if we're not already on login page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth')) {
        window.location.reload();
      }
      return Promise.reject(error);
    }
    const message = (error.response?.data as any)?.message || error.message;
    throw new Error(`${error.response?.status || 500}: ${message}`);
  }
);

export async function apiRequest(
  url: string,
  options: {
    method: string;
    body?: unknown;
  },
): Promise<any> {
  const isFormData = options.body instanceof FormData;
  // Convert camelCase to snake_case for request body (except FormData)
  const requestData = isFormData ? options.body : convertToSnakeCase(options.body);
  
  const response = await apiClient.request({
    url,
    method: options.method,
    data: requestData,
    headers: isFormData ? {
      'Content-Type': 'multipart/form-data',
    } : undefined,
  });
  return response.data;
}

// Helper function for backward compatibility with 3-parameter apiRequest calls
export async function apiRequest3(
  method: string,
  url: string,
  body?: unknown
): Promise<any> {
  return apiRequest(url, { method, body });
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const response = await apiClient.get(queryKey.join("/") as string);
      // Extract data from the backend envelope structure { success, data, message }
      return response.data?.data || response.data;
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error.response?.status === 401) {
        return null;
      }
      // Handle token expiration for queries too
      if (error.response?.status === 401) {
        localStorage.removeItem('hrms_auth_token');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth')) {
          window.location.reload();
        }
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // No stale time - always fetch fresh data
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
