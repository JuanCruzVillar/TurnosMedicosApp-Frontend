import { api } from '../lib/axios';
import type { Appointment, CreateAppointmentRequest } from '../types';

export const appointmentsApi = {
  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/Appointments/my-appointments');
    return response.data;
  },

  getProfessionalAppointments: async (date?: string): Promise<Appointment[]> => {
    // Los profesionales pueden usar el mismo endpoint que los pacientes
    // El backend filtra según el rol del usuario autenticado
    const params = date ? { date } : {};
    const response = await api.get<Appointment[]>('/Appointments/my-appointments', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/Appointments/${id}`);
    return response.data;
  },

  create: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await api.post<Appointment>('/Appointments', data);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<void> => {
    await api.patch(`/Appointments/${id}/status`, status);
  },

  updateNotes: async (id: number, notes: string): Promise<void> => {
    await api.patch(`/Appointments/${id}/notes`, { notes });
  },

  markAsCompleted: async (id: number): Promise<void> => {
    await api.patch(`/Appointments/${id}/status`, 'Completed');
  },

  cancel: async (id: number, reason: string): Promise<void> => {
    await api.post(`/Appointments/${id}/cancel`, { reason });
  },
};