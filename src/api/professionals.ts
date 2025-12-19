import { api } from '../lib/axios';
import type { Professional, AvailableSlot } from '../types';

export const professionalsApi = {
  getAll: async (specialtyId?: number): Promise<Professional[]> => {
    const params = specialtyId ? { specialtyId } : {};
    const response = await api.get<Professional[]>('/Professionals', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Professional> => {
    const response = await api.get<Professional>(`/Professionals/${id}`);
    return response.data;
  },

  getAvailableSlots: async (id: number, date: string): Promise<AvailableSlot[]> => {
    const response = await api.get<AvailableSlot[]>(
      `/Professionals/${id}/available-slots`,
      { params: { date } }
    );
    return response.data;
  },
};