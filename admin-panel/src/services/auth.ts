import { IUser } from '@app/types/user';
import { removeWindowClass } from '@app/utils/helpers';
import apiService from './api';
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from './apiEndpoints';

export interface LoginResponse {
  token: string; 
  user: IUser;
}

export const loginByAuth = async (
  username: string, 
  password: string
): Promise<LoginResponse> => {
  try {
    // Use the centralized API service with the endpoint from apiEndpoints
    const response = await apiService.post<LoginResponse>(
      AUTH_ENDPOINTS.LOGIN, 
      { username, password }
    );
    
    // Store token in localStorage
    localStorage.setItem('token', response.token);
    removeWindowClass('login-page');
    removeWindowClass('hold-transition');
    
    return response;
  } catch (error) {
    // If we're in development mode, provide a mock response for testing
    if (import.meta.env.DEV) {
      console.warn('DEV MODE: Using mock login data');
      
      // Mock successful login for development
      if (username === 'admin' && password === 'password') {
        const mockResponse: LoginResponse = {
          token: 'I_AM_THE_TOKEN',
          user: {
            id: 1,
            username: username,
            email: 'admin@example.com',
            name: 'Admin User'
          }
        };
        
        // Store token in localStorage
        localStorage.setItem('token', mockResponse.token);
        removeWindowClass('login-page');
        removeWindowClass('hold-transition');
        
        return mockResponse;
      }
    }
    
    throw error;
  }
};

export const logoutUser = (): void => {
  // Remove token from localStorage
  localStorage.removeItem('token');
  
  // You could also call the logout endpoint if your API requires it
  // apiService.post(AUTH_ENDPOINTS.LOGOUT);
  
  // Redirect to login page
  window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<IUser | null> => {
  try {
    // Get the current user profile using the API service
    const user = await apiService.get<IUser>(USER_ENDPOINTS.PROFILE);
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const registerUser = async (
  username: string, 
  email: string, 
  password: string
): Promise<IUser> => {
  // Register a new user using the API service
  const user = await apiService.post<IUser>(
    AUTH_ENDPOINTS.REGISTER, 
    { username, email, password }
  );
  return user;
};

export const forgotPassword = async (email: string): Promise<void> => {
  // Send a forgot password request using the API service
  await apiService.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
};

export const resetPassword = async (
  token: string, 
  password: string
): Promise<void> => {
  // Reset the password using the API service
  await apiService.post(AUTH_ENDPOINTS.RESET_PASSWORD, { token, password });
};


