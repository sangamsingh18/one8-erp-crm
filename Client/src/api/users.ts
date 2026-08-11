import axiosClient from './axiosClient';
import { ApiSuccessResponse, PaginatedResponse, User } from '../types';

export const usersApi = {
  list: (params?: Record<string, unknown>) =>
    axiosClient.get<PaginatedResponse<User>>('/users', { params }),

  get: (id: string) =>
    axiosClient.get<ApiSuccessResponse<User>>(`/users/${id}`),

  create: (data: Record<string, unknown>) =>
    axiosClient.post<ApiSuccessResponse<User>>('/users', data),

  update: (id: string, data: { role?: string; permissions?: string[] | null; is_active?: boolean }) =>
    axiosClient.put<ApiSuccessResponse<User>>(`/users/${id}`, data),

  toggleActive: (id: string) =>
    axiosClient.patch<ApiSuccessResponse<User>>(`/users/${id}/toggle-active`),

  resetPassword: (id: string, password: string) =>
    axiosClient.post<ApiSuccessResponse<null>>(`/users/${id}/reset-password`, { password }),
};
