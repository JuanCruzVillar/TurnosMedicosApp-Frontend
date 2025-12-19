import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import ScheduleManagement from '../../components/professional/ScheduleManagement';
import ProfessionalAppointments from '../../components/professional/ProfessionalAppointments';

export default function ProfessionalDashboard() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'schedule' | 'appointments'>('appointments');

  if (user?.role !== 'Professional') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No tienes acceso a este panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Panel Profesional</h1>
        <p className="text-gray-600 mt-2">Bienvenido, {user.firstName} {user.lastName}</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'appointments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mis Turnos
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mi Agenda
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'appointments' && <ProfessionalAppointments />}
      {activeTab === 'schedule' && <ScheduleManagement />}
    </div>
  );
}

