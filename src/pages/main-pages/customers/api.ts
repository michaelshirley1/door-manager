import client from '../../../api/client';
import { Customer } from './model';

export const getCustomers = () =>
    client.get<Customer[]>('/customer').then(r => r.data);

export const getCustomer = (id: number) =>
    client.get<Customer>(`/customer/${id}`).then(r => r.data);

export const createCustomer = (data: Omit<Customer, 'id'>) =>
    client.post<Customer>('/customer', data).then(r => r.data);

export const updateCustomer = (id: number, data: Customer) =>
    client.put<Customer>(`/customer/${id}`, data).then(r => r.data);

export const deleteCustomer = (id: number) =>
    client.delete(`/customer/${id}`);
