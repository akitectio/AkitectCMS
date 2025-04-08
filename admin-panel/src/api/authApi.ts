import { LoginRequest } from '@/types';
import apiClient from './axios';

const authApi = {
  login: (data: LoginRequest) => 
    apiClient.post('/auth/login', data),
  
  getCurrentUser: () => 
    apiClient.get('/auth/me'),
  
  logout: () => 
    apiClient.post('/auth/logout')
};

export default authApi;