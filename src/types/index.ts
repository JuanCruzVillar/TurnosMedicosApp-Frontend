export interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Professional' | 'Patient';
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface Specialty {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface Professional {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  licenseNumber: string;
  specialty: Specialty;
}

export interface AvailableSlot {
  dateTime: string;
  durationMinutes: number;
  isAvailable: boolean;
}

export interface Appointment {
  id: number;
  dateTime: string;
  durationMinutes: number;
  status: string;
  reason?: string;
  notes?: string;
  professional: Professional;
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
}

export interface CreateAppointmentRequest {
  professionalId: number;
  dateTime: string;
  reason?: string;
}

// Schedule representa un horario para un día específico (coincide con ScheduleResponse del backend)
export interface Schedule {
  id: number;
  professionalId: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc. (coincide con DayOfWeek enum de .NET)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
}

export interface UpdateAppointmentRequest {
  status?: string;
  notes?: string;
}

export interface UserProfile {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
