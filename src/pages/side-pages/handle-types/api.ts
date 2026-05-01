import client from '../../../api/client';
import { HandleType } from './model';

export const getHandleTypes = () =>
    client.get<HandleType[]>('/handle-type').then(r => r.data);

export const getHandleType = (id: number) =>
    client.get<HandleType>(`/handle-type/${id}`).then(r => r.data);

export const createHandleType = (data: Omit<HandleType, 'id'>) =>
    client.post<HandleType>('/handle-type', data).then(r => r.data);

export const updateHandleType = (id: number, data: HandleType) =>
    client.put<HandleType>(`/handle-type/${id}`, data).then(r => r.data);

export const deleteHandleType = (id: number) =>
    client.delete(`/handle-type/${id}`);
