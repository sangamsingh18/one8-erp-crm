import axiosClient from './axiosClient';
import { Customer, CustomerNote, PaginatedResponse, ApiSuccessResponse } from '../types';

export const customersApi = {
  list: (params?: Record<string, unknown>) =>
    axiosClient.get<PaginatedResponse<Customer>>('/customers', { params }),
  get: (id: string) => axiosClient.get<ApiSuccessResponse<Customer>>(`/customers/${id}`),
  create: (data: Partial<Customer>) => axiosClient.post<ApiSuccessResponse<Customer>>('/customers', data),
  update: (id: string, data: Partial<Customer>) =>
    axiosClient.put<ApiSuccessResponse<Customer>>(`/customers/${id}`, data),
  getNotes: (id: string) =>
    axiosClient.get<ApiSuccessResponse<CustomerNote[]>>(`/customers/${id}/notes`),
  addNote: (id: string, note: string) =>
    axiosClient.post<ApiSuccessResponse<CustomerNote>>(`/customers/${id}/notes`, { note }),
};
