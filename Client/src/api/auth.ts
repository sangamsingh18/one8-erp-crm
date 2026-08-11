import axiosClient from './axiosClient';
import { ApiSuccessResponse, User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    axiosClient.post<ApiSuccessResponse<{ token: string; user: User }>>('/auth/login', { email, password }),

  me: () => axiosClient.get<ApiSuccessResponse<User>>('/auth/me'),

  // Admin-only user creation (with role)
  register: (data: { name: string; email: string; password: string; role: string }) =>
    axiosClient.post<ApiSuccessResponse<User>>('/auth/register', data),

  // Public self-registration (becomes sales role)
  selfRegister: (data: { name: string; email: string; password: string; confirmPassword: string }) =>
    axiosClient.post<ApiSuccessResponse<User>>('/auth/self-register', data),
};
