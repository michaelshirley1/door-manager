import client from '../../../api/client';
import { Invoice } from './model';

export const getInvoices = () =>
    client.get<Invoice[]>('/invoice').then(r => r.data);

export const getInvoice = (id: number) =>
    client.get<Invoice>(`/invoice/${id}`).then(r => r.data);

export const createInvoice = (data: Omit<Invoice, 'id'>) =>
    client.post<Invoice>('/invoice', data).then(r => r.data);

export const updateInvoice = (id: number, data: Invoice) =>
    client.put<Invoice>(`/invoice/${id}`, data).then(r => r.data);

export const deleteInvoice = (id: number) =>
    client.delete(`/invoice/${id}`);
