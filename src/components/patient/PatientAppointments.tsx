import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '../../api/appointments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';

export default function PatientAppointments() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: () => appointmentsApi.getMyAppointments(),
  });

  if (isLoading) {
    return <div className="text-center py-8">Cargando turnos...</div>;
  }

  const sortedAppointments = appointments
    ? [...appointments].sort((a, b) => {
        const dateA = parseISO(a.dateTime);
        const dateB = parseISO(b.dateTime);
        return dateB.getTime() - dateA.getTime();
      })
    : [];

  const upcomingAppointments = sortedAppointments.filter(
    (apt) => parseISO(apt.dateTime) >= new Date() && apt.status !== 'Cancelled'
  );
  const pastAppointments = sortedAppointments.filter(
    (apt) => parseISO(apt.dateTime) < new Date() || apt.status === 'Cancelled'
  );

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Turnos</CardTitle>
          <CardDescription>Turnos programados y pendientes</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {appointment.professional.fullName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            appointment.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Especialidad:</strong> {appointment.professional.specialty.name}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Fecha y hora:</strong>{' '}
                        {format(parseISO(appointment.dateTime), "EEEE, d 'de' MMMM 'a las' HH:mm", {
                          locale: es,
                        })}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Duración:</strong> {appointment.durationMinutes} minutos
                      </p>
                      {appointment.reason && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Motivo:</strong> {appointment.reason}
                        </p>
                      )}
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Notas del profesional:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No tienes turnos programados
            </p>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Turnos</CardTitle>
          <CardDescription>Turnos anteriores y cancelados</CardDescription>
        </CardHeader>
        <CardContent>
          {pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {appointment.professional.fullName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            appointment.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Especialidad:</strong> {appointment.professional.specialty.name}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Fecha y hora:</strong>{' '}
                        {format(parseISO(appointment.dateTime), "EEEE, d 'de' MMMM 'a las' HH:mm", {
                          locale: es,
                        })}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Duración:</strong> {appointment.durationMinutes} minutos
                      </p>
                      {appointment.reason && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Motivo:</strong> {appointment.reason}
                        </p>
                      )}
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Notas del profesional:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No hay turnos en el historial
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

