import axiosClient from './axiosClient';
import { Product, StockMovement, PaginatedResponse, ApiSuccessResponse } from '../types';

export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    axiosClient.get<PaginatedResponse<Product>>('/products', { params }),
  get: (id: string) => axiosClient.get<ApiSuccessResponse<Product>>(`/products/${id}`),
  create: (data: Partial<Product>) => axiosClient.post<ApiSuccessResponse<Product>>('/products', data),
  update: (id: string, data: Partial<Product>) =>
    axiosClient.put<ApiSuccessResponse<Product>>(`/products/${id}`, data),
  getStockLog: (id: string, params?: Record<string, unknown>) =>
    axiosClient.get<PaginatedResponse<StockMovement>>(`/products/${id}/stock-log`, { params }),
  adjustStock: (id: string, data: { quantity: number; movement_type: 'IN' | 'OUT'; reason: string }) =>
    axiosClient.post<ApiSuccessResponse<StockMovement>>(`/products/${id}/stock-adjust`, data),
  delete: (id: string) => axiosClient.delete(`/products/${id}`),
};
