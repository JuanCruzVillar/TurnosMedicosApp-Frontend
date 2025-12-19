import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi, type CreateScheduleRequest, type UpdateScheduleRequest } from '../../api/schedule';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Schedule } from '../../types';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

export default function ScheduleManagement() {
  const queryClient = useQueryClient();
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<UpdateScheduleRequest | null>(null);

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['mySchedule'],
    queryFn: () => scheduleApi.getMySchedule(),
  });

  const createMutation = useMutation({
    mutationFn: scheduleApi.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySchedule'] });
      setNewSchedule({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true });
      alert('Horario creado correctamente');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al crear el horario');
    },
  });

  const updateMutation = useMutation({
    mutationFn: scheduleApi.updateSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySchedule'] });
      alert('Horario actualizado correctamente');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al actualizar el horario');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: scheduleApi.deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySchedule'] });
      alert('Horario eliminado correctamente');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al eliminar el horario');
    },
  });

  const handleCreate = () => {
    createMutation.mutate(newSchedule);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setEditingSchedule({
      id: schedule.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isActive: schedule.isActive,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingSchedule(null);
  };

  const handleSaveEdit = () => {
    if (editingSchedule) {
      updateMutation.mutate(editingSchedule, {
        onSuccess: () => {
          setEditingId(null);
          setEditingSchedule(null);
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      deleteMutation.mutate(id);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || '';
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando agenda...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Formulario para agregar nuevo horario */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nuevo Horario</CardTitle>
          <CardDescription>Configura un horario para un día específico de la semana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Día de la semana *
              </label>
              <select
                value={newSchedule.dayOfWeek}
                onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: parseInt(e.target.value) })}
                className="w-full h-10 rounded-md border border-gray-300 px-3"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora inicio *
              </label>
              <Input
                type="time"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora fin *
              </label>
              <Input
                type="time"
                value={newSchedule.endTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newSchedule.isActive ?? true}
                  onChange={(e) => setNewSchedule({ ...newSchedule, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Activo</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creando...' : '+ Agregar Horario'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de horarios existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Horarios Configurados</CardTitle>
          <CardDescription>Gestiona tus horarios de disponibilidad semanal</CardDescription>
        </CardHeader>
        <CardContent>
          {schedules && schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                  {editingId === schedule.id && editingSchedule ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Día de la semana *
                          </label>
                          <select
                            value={editingSchedule.dayOfWeek}
                            onChange={(e) =>
                              setEditingSchedule({
                                ...editingSchedule,
                                dayOfWeek: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-10 rounded-md border border-gray-300 px-3"
                          >
                            {DAYS_OF_WEEK.map((day) => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hora inicio *
                          </label>
                          <Input
                            type="time"
                            value={editingSchedule.startTime}
                            onChange={(e) =>
                              setEditingSchedule({
                                ...editingSchedule,
                                startTime: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hora fin *
                          </label>
                          <Input
                            type="time"
                            value={editingSchedule.endTime}
                            onChange={(e) =>
                              setEditingSchedule({
                                ...editingSchedule,
                                endTime: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex items-end">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={editingSchedule.isActive ?? true}
                              onChange={(e) =>
                                setEditingSchedule({
                                  ...editingSchedule,
                                  isActive: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700">Activo</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          disabled={updateMutation.isPending}
                          size="sm"
                        >
                          {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          size="sm"
                          disabled={updateMutation.isPending}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Día</p>
                          <p className="text-base font-semibold">{getDayName(schedule.dayOfWeek)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Hora inicio</p>
                          <p className="text-base">{schedule.startTime}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Hora fin</p>
                          <p className="text-base">{schedule.endTime}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Estado</p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              schedule.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {schedule.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
                          disabled={editingId !== null}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
                          disabled={deleteMutation.isPending || editingId !== null}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No hay horarios configurados. Agrega uno para comenzar.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

