import client from '../../../api/client';
import { DoorType, DoorPricingEntry } from './model';

export const getDoorTypes = () =>
    client.get<DoorType[]>('/door-type').then(r => r.data);

export const getDoorType = (id: number) =>
    client.get<DoorType>(`/door-type/${id}`).then(r => r.data);

export const createDoorType = (data: Omit<DoorType, 'id'>) =>
    client.post<DoorType>('/door-type', data).then(r => r.data);

export const updateDoorType = (id: number, data: DoorType) =>
    client.put<DoorType>(`/door-type/${id}`, data).then(r => r.data);

export const deleteDoorType = (id: number) =>
    client.delete(`/door-type/${id}`);

export const getDoorTypePrices = (doorTypeId: number) =>
    client.get<DoorPricingEntry[]>(`/door-type/${doorTypeId}/prices`).then(r => r.data);

export const createDoorTypePrice = (doorTypeId: number, data: { heightMm: number; widthMm: number; price: number }) =>
    client.post<DoorPricingEntry>(`/door-type/${doorTypeId}/prices`, { ...data, doorTypeId }).then(r => r.data);

export const deleteDoorTypePrice = (doorTypeId: number, entryId: number) =>
    client.delete(`/door-type/${doorTypeId}/prices/${entryId}`);
