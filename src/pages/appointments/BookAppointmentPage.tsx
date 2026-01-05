import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, addDays } from 'date-fns';

import { professionalsApi } from '../../api/professionals';
import { appointmentsApi } from '../../api/appointments';
import { useAuthStore } from '../../store/authStore';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

import type { AvailableSlot } from '../../types';


export default function BookAppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  

  const professionalId = id ? parseInt(id, 10) : 0;

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token || !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  /* ================= STATE ================= */
  const [selectedDate, setSelectedDate] = useState<string>(
  format(new Date(), 'yyyy-MM-dd')
);
const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);


  /* ================= PROFESSIONAL ================= */
  const { data: professional, isLoading: isLoadingProfessional } = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: () => professionalsApi.getById(professionalId),
    enabled: professionalId > 0,
  });

  /* ================= AVAILABLE SLOTS ================= */
  const {
    data: availableSlots,
    isLoading: isLoadingSlots,
    error: slotsError,
    isSuccess,
  } = useQuery<AvailableSlot[]>({
    queryKey: ['availableSlots', professionalId, selectedDate],
    queryFn: () => {
      const isoDate = new Date(selectedDate + 'T00:00:00').toISOString();
      return professionalsApi.getAvailableSlots(professionalId, isoDate);
    },
    enabled: professionalId > 0 && selectedDate !== '',
  });

  /* ✅ onSuccess replacement */
  useEffect(() => {
    if (isSuccess && availableSlots) {
      console.log('Horarios recibidos:', availableSlots);
      console.log(
        'Disponibles:',
        availableSlots.filter((s: AvailableSlot) => s.isAvailable).length
      );
    }
  }, [isSuccess, availableSlots]);

  /* ================= MUTATION ================= */
  const createAppointmentMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      alert('Turno reservado exitosamente');
      navigate('/patient/dashboard');
    },
    onError: (error: any) => {
      console.error('Error al reservar turno:', error);
      alert('Error al reservar el turno');
    },
  });

  /* ================= HANDLERS ================= */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
    }
  };

  const handleBookAppointment = () => {
  if (!selectedSlot || !professional) return;

  createAppointmentMutation.mutate({
    professionalId: professional.id,
    dateTime: new Date(selectedSlot.dateTime).toISOString(),
  });
};



  /* ================= UI HELPERS ================= */
  const minDate = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  const availableSlotsList: AvailableSlot[] =
    availableSlots?.filter((slot: AvailableSlot) => slot.isAvailable) ?? [];

  /* ================= LOADING / ERROR ================= */
  if (isLoadingProfessional) {
    return <div className="text-center py-8">Cargando profesional...</div>;
  }

  if (!professional) {
    return <div className="text-center py-8">Profesional no encontrado</div>;
  }

  /* ================= RENDER ================= */
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={minDate}
            max={maxDate}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horarios Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSlots && <p>Cargando horarios...</p>}

          {slotsError && <p>Error al cargar horarios</p>}

          {availableSlotsList.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {availableSlotsList.map((slot: AvailableSlot, index: number) => (
                <button
                  key={index}
                  onClick={() => handleSlotSelect(slot)}
                  className="border p-3 rounded"
                >
                  {format(parseISO(slot.dateTime), 'HH:mm')}
                </button>
              ))}
            </div>
          ) : (
            <p>No hay horarios disponibles</p>
          )}
        </CardContent>
      </Card>

      {selectedSlot && (
        <Button
          className="mt-6 w-full"
          onClick={handleBookAppointment}
          disabled={createAppointmentMutation.isPending}
        >
          Confirmar Turno
        </Button>
      )}
    </div>
  );
}
