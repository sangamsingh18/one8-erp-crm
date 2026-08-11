import axiosClient from './axiosClient';
import { ApiSuccessResponse, PaginatedResponse } from '../types';

export interface Invoice {
  id: string;
  invoice_number: string;
  challan_id: string | null;
  challan_number?: string | null;
  customer_id: string;
  customer_name: string;
  customer_business_name?: string | null;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  status: 'paid' | 'partially_paid' | 'pending' | 'overdue';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  invoice_number?: string;
  customer_name?: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  created_by_name?: string;
  created_at: string;
}

export interface FinancialSummary {
  total_revenue: number;
  total_paid: number;
  total_outstanding: number;
  total_invoices: number;
  paid_count: number;
  partial_count: number;
  pending_count: number;
  recentPayments: Payment[];
}

export const accountsApi = {
  listInvoices: (params?: Record<string, unknown>) =>
    axiosClient.get<PaginatedResponse<Invoice>>('/accounts/invoices', { params }),
    
  getInvoice: (id: string) =>
    axiosClient.get<ApiSuccessResponse<Invoice & { payments: Payment[] }>>(`/accounts/invoices/${id}`),
    
  createInvoice: (data: Partial<Invoice>) =>
    axiosClient.post<ApiSuccessResponse<Invoice>>('/accounts/invoices', data),
    
  recordPayment: (data: {
    invoice_id: string;
    amount: number;
    payment_method: string;
    reference_number?: string;
    notes?: string;
  }) =>
    axiosClient.post<ApiSuccessResponse<Payment>>('/accounts/payments', data),
    
  getSummary: () =>
    axiosClient.get<ApiSuccessResponse<FinancialSummary>>('/accounts/summary'),
};
