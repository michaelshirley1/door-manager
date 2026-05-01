import client from '../../../api/client';
import { HingeType } from './model';

export const getHingeTypes = () =>
    client.get<HingeType[]>('/hinge-type').then(r => r.data);

export const getHingeType = (id: number) =>
    client.get<HingeType>(`/hinge-type/${id}`).then(r => r.data);

export const createHingeType = (data: Omit<HingeType, 'id'>) =>
    client.post<HingeType>('/hinge-type', data).then(r => r.data);

export const updateHingeType = (id: number, data: HingeType) =>
    client.put<HingeType>(`/hinge-type/${id}`, data).then(r => r.data);

export const deleteHingeType = (id: number) =>
    client.delete(`/hinge-type/${id}`);
