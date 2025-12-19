import { useQuery } from '@tanstack/react-query';
import { specialtiesApi } from '../api/specialties';
import SpecialtyCard from '../components/specialties/SpecialtyCard';

export default function SpecialtiesPage() {
  const { data: specialties, isLoading, error } = useQuery({
    queryKey: ['specialties'],
    queryFn: specialtiesApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando especialidades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar las especialidades</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Especialidades Médicas
        </h1>
        <p className="text-gray-600">
          Selecciona una especialidad para ver los profesionales disponibles
        </p>
      </div>

      {/* Grid de especialidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialties?.map((specialty) => (
          <SpecialtyCard key={specialty.id} specialty={specialty} />
        ))}
      </div>

      {/* Empty state */}
      {specialties?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No hay especialidades disponibles</p>
        </div>
      )}
    </div>
  );
}