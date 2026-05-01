import client from '../../../api/client';
import { Job } from './model';

export const getJobs = () =>
    client.get<Job[]>('/job').then(r => r.data);

export const getJob = (id: number) =>
    client.get<Job>(`/job/${id}`).then(r => r.data);

export const createJob = (data: Omit<Job, 'id'>) =>
    client.post<Job>('/job', data).then(r => r.data);

export const updateJob = (id: number, data: Job) =>
    client.put<Job>(`/job/${id}`, data).then(r => r.data);

export const deleteJob = (id: number) =>
    client.delete(`/job/${id}`);
