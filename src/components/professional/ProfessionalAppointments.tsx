import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '../../api/appointments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { format, parseISO, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import type { Appointment } from '../../types';

export default function ProfessionalAppointments() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['professionalAppointments', selectedDate, viewMode],
    queryFn: () => appointmentsApi.getProfessionalAppointments(selectedDate),
  });

  const updateNotesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      appointmentsApi.updateNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionalAppointments'] });
      setSelectedAppointment(null);
      setNotes('');
      alert('Notas actualizadas correctamente');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al actualizar las notas');
    },
  });

  const completeMutation = useMutation({
    mutationFn: appointmentsApi.markAsCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionalAppointments'] });
      alert('Turno marcado como completado');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al marcar el turno');
    },
  });

  const filteredAppointments = appointments?.filter((apt) => {
    const aptDate = parseISO(apt.dateTime);
    if (viewMode === 'day') {
      return isSameDay(aptDate, parseISO(selectedDate));
    } else {
      const weekStart = startOfWeek(parseISO(selectedDate), { locale: es });
      const weekEnd = endOfWeek(parseISO(selectedDate), { locale: es });
      return aptDate >= weekStart && aptDate <= weekEnd;
    }
  });

  const handleAddNotes = () => {
    if (selectedAppointment) {
      updateNotesMutation.mutate({
        id: selectedAppointment.id,
        notes,
      });
    }
  };

  const handleComplete = (id: number) => {
    if (confirm('¿Marcar este turno como completado?')) {
      completeMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando turnos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Día
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Semana
              </Button>
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-auto"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Turnos {viewMode === 'day' ? 'del día' : 'de la semana'}
          </CardTitle>
          <CardDescription>
            {viewMode === 'day'
              ? format(parseISO(selectedDate), "EEEE, d 'de' MMMM", { locale: es })
              : `Semana del ${format(startOfWeek(parseISO(selectedDate), { locale: es }), 'd MMM', { locale: es })}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAppointments && filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {appointment.patient.fullName}
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
                        <strong>Fecha y hora:</strong>{' '}
                        {format(parseISO(appointment.dateTime), "d 'de' MMMM 'a las' HH:mm", {
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
                          <strong>Notas:</strong> {appointment.notes}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {appointment.patient.email} • {appointment.patient.phoneNumber || 'Sin teléfono'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {appointment.status !== 'Completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleComplete(appointment.id)}
                          disabled={completeMutation.isPending}
                        >
                          Marcar Completado
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setNotes(appointment.notes || '');
                        }}
                      >
                        {appointment.notes ? 'Editar Notas' : 'Agregar Notas'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No hay turnos para esta {viewMode === 'day' ? 'fecha' : 'semana'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes Modal */}
      {selectedAppointment && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar/Editar Notas</CardTitle>
            <CardDescription>
              Turno de {selectedAppointment.patient.fullName} -{' '}
              {format(parseISO(selectedAppointment.dateTime), "d 'de' MMMM 'a las' HH:mm", {
                locale: es,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe las notas del turno aquí..."
                className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddNotes}
                  disabled={updateNotesMutation.isPending}
                >
                  {updateNotesMutation.isPending ? 'Guardando...' : 'Guardar Notas'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAppointment(null);
                    setNotes('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

