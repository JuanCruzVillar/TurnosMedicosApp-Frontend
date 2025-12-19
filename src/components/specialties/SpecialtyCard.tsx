import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import type { Specialty } from '../../types';

interface SpecialtyCardProps {
  specialty: Specialty;
}

export default function SpecialtyCard({ specialty }: SpecialtyCardProps) {
  return (
    <Link to={`/professionals?specialtyId=${specialty.id}`}>
      <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
        <CardHeader>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 text-white text-3xl">
            🏥
          </div>
          <CardTitle className="text-xl">{specialty.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {specialty.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">⏱️</span>
            <span>{specialty.durationMinutes} minutos por consulta</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}