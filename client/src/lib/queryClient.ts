import { QueryClient, QueryFunction } from "@tanstack/react-query";
import axios, { AxiosError } from 'axios';

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

// Response interceptor to handle errors and token expiration
apiClient.interceptors.response.use(
  (response) => response,
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
    const message = error.response?.data?.message || error.message;
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
  const response = await apiClient.request({
    url,
    method: options.method,
    data: options.body,
  });
  return response.data;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const response = await apiClient.get(queryKey.join("/") as string);
      return response.data;
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
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
