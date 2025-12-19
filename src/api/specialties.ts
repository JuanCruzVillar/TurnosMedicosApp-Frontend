import { api } from '../lib/axios';
import type { Specialty } from '../types';

export const specialtiesApi = {
  getAll: async (): Promise<Specialty[]> => {
    const response = await api.get<Specialty[]>('/Specialties');
    return response.data;
  },

  getById: async (id: number): Promise<Specialty> => {
    const response = await api.get<Specialty>(`/Specialties/${id}`);
    return response.data;
  },
};