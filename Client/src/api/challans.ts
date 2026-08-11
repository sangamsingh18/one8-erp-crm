import axiosClient from './axiosClient';
import { Challan, PaginatedResponse, ApiSuccessResponse } from '../types';

interface ChallanItemInput { product_id: string; quantity: number; }

export const challansApi = {
  list: (params?: Record<string, unknown>) =>
    axiosClient.get<PaginatedResponse<Challan>>('/challans', { params }),
  get: (id: string) => axiosClient.get<ApiSuccessResponse<Challan>>(`/challans/${id}`),
  create: (data: { customer_id: string; items: ChallanItemInput[] }) =>
    axiosClient.post<ApiSuccessResponse<Challan>>('/challans', data),
  update: (id: string, data: { customer_id?: string; items?: ChallanItemInput[] }) =>
    axiosClient.put<ApiSuccessResponse<Challan>>(`/challans/${id}`, data),
  confirm: (id: string) => axiosClient.post<ApiSuccessResponse<Challan>>(`/challans/${id}/confirm`),
  cancel: (id: string) => axiosClient.post<ApiSuccessResponse<Challan>>(`/challans/${id}/cancel`),
};
