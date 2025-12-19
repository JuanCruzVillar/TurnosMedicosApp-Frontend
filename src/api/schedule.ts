import { api } from '../lib/axios';
import type { Schedule } from '../types';

export interface CreateScheduleRequest {
  dayOfWeek: number;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive?: boolean;
}

export interface UpdateScheduleRequest {
  id: number;
  dayOfWeek: number;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive?: boolean;
}

export const scheduleApi = {
  getMySchedule: async (): Promise<Schedule[]> => {
    const response = await api.get<Schedule[]>('/Schedule/my-schedule');
    return response.data;
  },

  createSchedule: async (request: CreateScheduleRequest): Promise<Schedule> => {
    const response = await api.post<Schedule>('/Schedule', request);
    return response.data;
  },

  updateSchedule: async (request: UpdateScheduleRequest): Promise<Schedule> => {
    const response = await api.put<Schedule>('/Schedule', request);
    return response.data;
  },

  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`/Schedule/${id}`);
  },
};

