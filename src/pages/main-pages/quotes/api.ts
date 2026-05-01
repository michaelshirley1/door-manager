import client from '../../../api/client';
import { Quote } from './model';

export const getQuotes = () =>
    client.get<Quote[]>('/quote').then(r => r.data);

export const getQuote = (id: number) =>
    client.get<Quote>(`/quote/${id}`).then(r => r.data);

export const createQuote = (data: Omit<Quote, 'id'>) =>
    client.post<Quote>('/quote', data).then(r => r.data);

export const updateQuote = (id: number, data: Quote) =>
    client.put<Quote>(`/quote/${id}`, data).then(r => r.data);

export const deleteQuote = (id: number) =>
    client.delete(`/quote/${id}`);
