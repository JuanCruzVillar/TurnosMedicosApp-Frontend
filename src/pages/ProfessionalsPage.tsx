import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { professionalsApi } from '../api/professionals';
import { specialtiesApi } from '../api/specialties';
import ProfessionalCard from '../components/professionals/ProfessionalCard';

export default function ProfessionalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const specialtyIdParam = searchParams.get('specialtyId');
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | undefined>(
    specialtyIdParam ? parseInt(specialtyIdParam) : undefined
  );

  const { data: specialties, isLoading: isLoadingSpecialties, error: specialtiesError } = useQuery({
    queryKey: ['specialties'],
    queryFn: specialtiesApi.getAll,
    retry: 1,
  });

  const { data: professionals, isLoading, error } = useQuery({
    queryKey: ['professionals', selectedSpecialty],
    queryFn: () => professionalsApi.getAll(selectedSpecialty),
    retry: 1,
    enabled: true, // Siempre habilitado
  });

  const handleSpecialtyChange = (specialtyId: string) => {
    const id = specialtyId === 'all' ? undefined : parseInt(specialtyId);
    setSelectedSpecialty(id);
    
    if (id) {
      setSearchParams({ specialtyId: id.toString() });
    } else {
      setSearchParams({});
    }
  };

  if (isLoading || isLoadingSpecialties) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando profesionales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error al cargar profesionales:', error);
    }
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2">Error al cargar los profesionales</p>
        <p className="text-sm text-gray-500">
          {error instanceof Error ? error.message : 'Por favor, intenta nuevamente más tarde'}
        </p>
      </div>
    );
  }

  if (specialtiesError && import.meta.env.DEV) {
    console.error('Error al cargar especialidades:', specialtiesError);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Profesionales
        </h1>
        <p className="text-gray-600">
          Encuentra al profesional ideal para tu consulta
        </p>
      </div>

      {/* Filtro por especialidad */}
      <div className="bg-white rounded-lg shadow p-4">
        <label htmlFor="specialty-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por especialidad
        </label>
        <select
          id="specialty-filter"
          value={selectedSpecialty || 'all'}
          onChange={(e) => handleSpecialtyChange(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        >
          <option value="all">Todas las especialidades</option>
          {Array.isArray(specialties) && specialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid de profesionales */}
      {Array.isArray(professionals) && professionals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👨‍⚕️</div>
          <p className="text-gray-600 text-lg">
            No hay profesionales disponibles
            {selectedSpecialty && ' para esta especialidad'}
          </p>
        </div>
      )}
    </div>
  );
}