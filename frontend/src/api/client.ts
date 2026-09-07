/**
 * Cliente HTTP tipado para comunicación con la API de Palantica.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>;
}

export class ApiError extends Error {
  public status: number;
  public problemDetails?: any;

  constructor(status: number, message: string, problemDetails?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problemDetails = problemDetails;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = localStorage.getItem('palantica_jwt_token');

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorDetail = `Error ${response.status}: ${response.statusText}`;
    let problemDetails: any = null;

    try {
      problemDetails = await response.json();
      if (problemDetails?.detail) {
        errorDetail = problemDetails.detail;
      } else if (problemDetails?.error) {
        errorDetail = problemDetails.error;
      } else if (problemDetails?.title) {
        errorDetail = problemDetails.title;
      }
    } catch {
      // No era JSON
    }

    throw new ApiError(response.status, errorDetail, problemDetails);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return await response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, params?: RequestOptions['params']) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: any, params?: RequestOptions['params']) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),

  delete: <T>(endpoint: string, params?: RequestOptions['params']) =>
    request<T>(endpoint, { method: 'DELETE', params }),
};
