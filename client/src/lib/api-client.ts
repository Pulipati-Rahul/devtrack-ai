import { env } from '@/config/env';
import { ApiResponse } from '@devtrack-ai/shared';

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details: any;

  constructor(message: string, status: number, code: string, details: any = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;
  
  // Construct URL
  const baseUrl = env.NEXT_PUBLIC_API_URL;
  
  // Ensure path starts with /
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!cleanPath.startsWith('/api/v1')) {
    cleanPath = `/api/v1${cleanPath}`;
  }
  const url = new URL(cleanPath, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      url.searchParams.append(key, val);
    });
  }

  const headersObj: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (restOptions.body instanceof FormData) {
    delete headersObj['Content-Type'];
  }

  const response = await fetch(url.toString(), {
    credentials: 'include',
    ...restOptions,
    headers: headersObj,
  });

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch (error) {
    if (!response.ok) {
      throw new ApiError(
        `HTTP Error ${response.status}`,
        response.status,
        'HTTP_ERROR'
      );
    }
    throw new ApiError(
      'Invalid JSON response from server',
      500,
      'PARSE_ERROR'
    );
  }

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error?.message || data.message || 'An error occurred during API request',
      response.status,
      data.error?.code || 'API_ERROR',
      data.error?.details
    );
  }

  return data.data as T;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: 'GET' });
  },
  post<T>(path: string, body?: any, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  put<T>(path: string, body?: any, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
  postForm<T>(path: string, body: FormData, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: 'POST',
      body,
    });
  },
};
