import axiosInstance from '@app/configs/axiosConfig';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API Service Class
 * Centralized API management for the entire project
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axiosInstance;
    this.setupInterceptors();
  }

  /**
   * Configure request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // If token exists, add it to the headers
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle specific error statuses
        if (error.response) {
          const currentPath = window.location.pathname;
          
          switch (error.response.status) {
            case 401:
              // Only redirect to login if we're not already on the login page
              if (currentPath !== '/login') {
                // Handle unauthorized (e.g., redirect to login)
                localStorage.removeItem('token');
                window.location.href = '/login';
              }
              break;
            case 403:
              // Handle forbidden
              console.error('Access forbidden');
              break;
            case 404:
              // Handle not found
              console.error('Resource not found');
              break;
            case 500:
              // Handle server error
              console.error('Server error');
              break;
            default:
              // Handle other errors
              console.error('API error:', error.response.data);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   * @param url - API endpoint
   * @param config - Axios request config
   * @returns Promise with response data
   */
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  /**
   * POST request
   * @param url - API endpoint
   * @param data - Request payload
   * @param config - Axios request config
   * @returns Promise with response data
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   * @param url - API endpoint
   * @param data - Request payload
   * @param config - Axios request config
   * @returns Promise with response data
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   * @param url - API endpoint
   * @param data - Request payload
   * @param config - Axios request config
   * @returns Promise with response data
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   * @param url - API endpoint
   * @param config - Axios request config
   * @returns Promise with response data
   */
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;