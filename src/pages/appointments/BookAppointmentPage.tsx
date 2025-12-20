import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { professionalsApi } from '../../api/professionals';
import { appointmentsApi } from '../../api/appointments';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { AvailableSlot } from '../../types';

export default function BookAppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);
  const professionalId = id ? parseInt(id, 10) : 0;

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) {
      if (import.meta.env.DEV) {
        console.warn('Usuario no autenticado, redirigiendo a login...');
      }
      navigate('/login');
      return;
    }
    
    // Permitir que profesionales también vean los horarios (solo visualización)
    // La reserva solo está permitida para pacientes
    if (import.meta.env.DEV) {
      console.log('Usuario autenticado:', { email: user?.email, role: user?.role });
      console.log('Token presente:', !!token);
    }
  }, [isAuthenticated, user, navigate]);

  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [reason, setReason] = useState<string>('');

  // Fetch professional details
  const { data: professional, isLoading: isLoadingProfessional } = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: () => professionalsApi.getById(professionalId),
    enabled: professionalId > 0,
  });

  // Fetch available slots for selected date
  const { data: availableSlots, isLoading: isLoadingSlots, error: slotsError } = useQuery({
    queryKey: ['availableSlots', professionalId, selectedDate],
    queryFn: () => {
      // Format date as ISO string for .NET backend
      const dateObj = new Date(selectedDate + 'T00:00:00');
      const isoDate = dateObj.toISOString();
      if (import.meta.env.DEV) {
        console.log('Buscando horarios para:', {
          professionalId,
          selectedDate,
          isoDate,
          dayOfWeek: dateObj.getDay()
        });
      }
      return professionalsApi.getAvailableSlots(professionalId, isoDate);
    },
    enabled: professionalId > 0 && selectedDate !== '',
    onSuccess: (data) => {
      if (import.meta.env.DEV) {
        console.log('Horarios recibidos:', data);
        console.log('Horarios disponibles:', data?.filter(s => s.isAvailable).length);
        console.log('Total horarios:', data?.length);
      }
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error('Error al obtener horarios:', error);
      }
    },
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      alert('Turno reservado exitosamente');
      navigate('/patient/dashboard');
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('Error al reservar turno:', error);
        console.error('Status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      const token = localStorage.getItem('token');
      if (import.meta.env.DEV) {
        console.error('Token en localStorage:', token ? 'Presente' : 'No encontrado');
        if (token) {
          console.error('Token (primeros 30 caracteres):', token.substring(0, 30) + '...');
        }
      }
      
      if (error.response?.status === 401) {
        // Verificar si el token está presente
        if (!token) {
          const errorMessage = 'No estás autenticado. Por favor, inicia sesión.';
          alert(errorMessage);
          navigate('/login');
          return;
        } else {
          // El token está presente pero fue rechazado
          // Intentar decodificar el token para ver si está expirado
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const exp = payload.exp;
              const now = Math.floor(Date.now() / 1000);
              const isExpired = exp < now;
              
              if (import.meta.env.DEV) {
                console.error('Token expirado:', isExpired);
                console.error('Expira en:', new Date(exp * 1000).toLocaleString());
                console.error('Hora actual:', new Date().toLocaleString());
                console.error('Rol en token:', payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role);
              }
              
              if (isExpired) {
                const errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
                alert(errorMessage);
              } else {
                const errorMessage = 'Error de autenticación. El token fue rechazado por el servidor. Por favor, inicia sesión nuevamente.';
                alert(errorMessage);
              }
            }
          } catch (e) {
            if (import.meta.env.DEV) {
              console.error('Error al decodificar token:', e);
            }
            const errorMessage = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
            alert(errorMessage);
          }
          // No redirigir inmediatamente, dejar que el usuario vea el mensaje
          // El interceptor manejará la limpieza y redirección después de 5 segundos
          return;
        }
      }
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors 
        || error.message 
        || 'Error al reservar el turno';
      alert(`Error: ${typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)}`);
    },
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
    }
  };

  const handleBookAppointment = () => {
    if (!selectedSlot || !professional) {
      alert('Por favor selecciona un horario disponible');
      return;
    }

    // Solo los pacientes pueden reservar turnos
    if (user?.role !== 'Patient') {
      alert('Solo los pacientes pueden reservar turnos. Si eres un profesional, puedes ver los horarios pero no reservar.');
      return;
    }

    // Verificar autenticación antes de intentar reservar
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }

    if (confirm(`¿Confirmar turno para ${format(parseISO(selectedSlot.dateTime), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}?`)) {
      // Asegurar que la fecha esté en formato ISO 8601 para .NET
      let dateTime = selectedSlot.dateTime;
      
      // Verificar que la fecha sea válida
      if (!dateTime || isNaN(Date.parse(dateTime))) {
        alert('Error: La fecha seleccionada no es válida');
        return;
      }

      // Asegurar formato ISO 8601 completo (con 'Z' o timezone)
      try {
        const dateObj = new Date(dateTime);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Fecha inválida');
        }
        // Convertir a ISO string para asegurar formato correcto
        dateTime = dateObj.toISOString();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error al formatear fecha:', error);
        }
        alert('Error: La fecha seleccionada no es válida');
        return;
      }

      // Verificar que la fecha sea futura
      const slotDate = new Date(dateTime);
      const now = new Date();
      if (slotDate <= now) {
        alert('Error: El horario seleccionado debe ser en el futuro');
        return;
      }

      if (import.meta.env.DEV) {
        console.log('Enviando turno:', {
          professionalId: professional.id,
          dateTime: dateTime,
          reason: reason || undefined,
        });
        console.log('Token presente:', !!token);
        console.log('Token (primeros 20 caracteres):', token.substring(0, 20) + '...');
      }

      createAppointmentMutation.mutate({
        professionalId: professional.id,
        dateTime: dateTime,
        reason: reason && reason.trim() !== '' ? reason.trim() : undefined,
      });
    }
  };

  const minDate = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  if (isLoadingProfessional) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">Cargando información del profesional...</div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-red-600 mb-4">Profesional no encontrado</p>
              <Button onClick={() => navigate('/professionals')}>
                Volver a Profesionales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableSlotsList = availableSlots?.filter(slot => slot.isAvailable) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/professionals')}
          className="mb-4"
        >
          ← Volver a Profesionales
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Reservar Turno</h1>
      </div>

      {/* Professional Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {professional.firstName.charAt(0)}
                {professional.lastName.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-xl">
                  Dr/a. {professional.fullName}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {professional.specialty.name}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">📧</span>
              <span>{professional.email}</span>
            </div>
            {professional.phoneNumber && (
              <div className="flex items-center">
                <span className="mr-2">📱</span>
                <span>{professional.phoneNumber}</span>
              </div>
            )}
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              <span>Duración: {professional.specialty.durationMinutes} minutos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar Fecha</CardTitle>
          <CardDescription>
            Elige una fecha para ver los horarios disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={minDate}
              max={maxDate}
              className="max-w-xs"
            />
            <p className="text-sm text-gray-600">
              {selectedDate && format(new Date(selectedDate + 'T00:00:00'), "EEEE, d 'de' MMMM", { locale: es })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Slots */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Horarios Disponibles</CardTitle>
          <CardDescription>
            {user?.role === 'Patient' 
              ? 'Selecciona un horario disponible para tu turno'
              : 'Horarios disponibles del profesional (solo visualización)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSlots ? (
            <div className="text-center py-8">Cargando horarios disponibles...</div>
          ) : slotsError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Error al cargar los horarios</p>
              <p className="text-sm text-gray-500">
                {slotsError instanceof Error ? slotsError.message : 'Por favor, intenta nuevamente'}
              </p>
            </div>
          ) : availableSlotsList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlotsList.map((slot, index) => {
                const slotDateTime = parseISO(slot.dateTime);
                const isSelected = selectedSlot?.dateTime === slot.dateTime;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleSlotSelect(slot)}
                    className={`
                      p-4 rounded-lg border-2 transition-all text-center
                      ${isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50'
                      }
                    `}
                  >
                    <div className="text-lg font-medium">
                      {format(slotDateTime, 'HH:mm')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {slot.durationMinutes} min
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">
                No hay horarios disponibles para esta fecha
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Por favor selecciona otra fecha. El profesional puede no tener horarios configurados para este día de la semana.
              </p>
              {availableSlots && availableSlots.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Hay {availableSlots.length} horario(s) en total, pero todos están ocupados o no disponibles.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reason Input - Solo para pacientes */}
      {selectedSlot && user?.role === 'Patient' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Motivo de la Consulta (Opcional)</CardTitle>
            <CardDescription>
              Describe brevemente el motivo de tu consulta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Ej: Control de rutina, Dolor de cabeza, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={200}
            />
          </CardContent>
        </Card>
      )}

      {/* Booking Summary and Button */}
      {selectedSlot && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="py-6">
            <h3 className="font-semibold text-lg mb-4">Resumen del Turno</h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Profesional:</strong> Dr/a. {professional.fullName}
              </p>
              <p>
                <strong>Especialidad:</strong> {professional.specialty.name}
              </p>
              <p>
                <strong>Fecha y Hora:</strong>{' '}
                {format(parseISO(selectedSlot.dateTime), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
              </p>
              <p>
                <strong>Duración:</strong> {selectedSlot.durationMinutes} minutos
              </p>
              {reason && (
                <p>
                  <strong>Motivo:</strong> {reason}
                </p>
              )}
            </div>
            {user?.role === 'Patient' ? (
              <div className="mt-6">
                <Button
                  onClick={handleBookAppointment}
                  disabled={createAppointmentMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {createAppointmentMutation.isPending
                    ? 'Reservando...'
                    : 'Confirmar Reserva'}
                </Button>
              </div>
            ) : (
              <div className="mt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-yellow-800 font-medium">
                    Solo los pacientes pueden reservar turnos
                  </p>
                  <p className="text-sm text-yellow-600 mt-2">
                    Estás viendo los horarios disponibles, pero necesitas iniciar sesión como paciente para reservar.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

