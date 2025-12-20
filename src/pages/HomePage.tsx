import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {user ? `¡Bienvenido, ${user.firstName}!` : 'Bienvenido a Hospital San Juan'}
        </h1>
        <p className="text-xl text-blue-100 mb-8">
          Sistema de gestión de turnos médicos. Reserva tu consulta de forma rápida, segura y sencilla.
        </p>
        {!user && (
          <div className="flex flex-wrap gap-4">
            <Link to="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Registrarse
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/specialties">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <CardTitle>Especialidades</CardTitle>
              <CardDescription>
                Explora todas nuestras especialidades médicas disponibles
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/professionals">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <CardTitle>Profesionales</CardTitle>
              <CardDescription>
                Encuentra al profesional ideal según tu necesidad
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {user && (
          <Link to="/my-appointments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <CardTitle>Mis Turnos</CardTitle>
                <CardDescription>
                  Consulta y gestiona tus turnos médicos
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        )}
      </div>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className="font-semibold mb-2">Elige tu especialidad</h3>
              <p className="text-sm text-gray-600">
                Selecciona la especialidad médica que necesitas
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className="font-semibold mb-2">Selecciona profesional</h3>
              <p className="text-sm text-gray-600">
                Elige el profesional de tu preferencia
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className="font-semibold mb-2">Reserva tu turno</h3>
              <p className="text-sm text-gray-600">
                Elige fecha y horario disponible
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}