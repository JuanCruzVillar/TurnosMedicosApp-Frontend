import { api } from '../lib/axios';
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../types';

export const profileApi = {
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/Profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/Profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/Profile/change-password', data);
  },
};

