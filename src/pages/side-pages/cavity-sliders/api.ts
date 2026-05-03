import client from '../../../api/client';
import { CavitySliderType } from './model';

export const getCavitySliders = () =>
    client.get<CavitySliderType[]>('/cavity-slider').then(r => r.data);

export const getCavitySlider = (id: number) =>
    client.get<CavitySliderType>(`/cavity-slider/${id}`).then(r => r.data);

export const createCavitySlider = (data: Omit<CavitySliderType, 'id'>) =>
    client.post<CavitySliderType>('/cavity-slider', data).then(r => r.data);

export const updateCavitySlider = (id: number, data: CavitySliderType) =>
    client.put<CavitySliderType>(`/cavity-slider/${id}`, data).then(r => r.data);

export const deleteCavitySlider = (id: number) =>
    client.delete(`/cavity-slider/${id}`);
