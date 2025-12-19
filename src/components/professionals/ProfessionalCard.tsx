import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Professional } from '../../types';

interface ProfessionalCardProps {
  professional: Professional;
}

export default function ProfessionalCard({ professional }: ProfessionalCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {professional.firstName.charAt(0)}
              {professional.lastName.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg">
                Dr/a. {professional.fullName}
              </CardTitle>
              <p className="text-sm text-blue-600 font-medium">
                {professional.specialty.name}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <span className="mr-2">🎓</span>
            <span>Mat. {professional.licenseNumber}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">⏱️</span>
            <span>{professional.specialty.durationMinutes} min por consulta</span>
          </div>
        </div>

        <Link to={`/book-appointment/${professional.id}`}>
          <Button className="w-full">
            Ver Horarios Disponibles
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}