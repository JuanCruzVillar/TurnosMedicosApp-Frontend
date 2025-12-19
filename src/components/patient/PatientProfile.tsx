import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../../api/profile';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { UpdateProfileRequest, ChangePasswordRequest } from '../../types';

export default function PatientProfile() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState<UpdateProfileRequest>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: profile, isLoading, error: profileError } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => profileApi.getMyProfile(),
    retry: false,
  });

  // Si el endpoint no existe, usamos los datos del usuario autenticado
  const effectiveProfile = profile || (user ? {
    id: 0, // Placeholder, no se usa realmente
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: undefined,
  } : null);

  const updateProfileMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      if (token && user) {
        setAuth(token, {
          ...user,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }
      setIsEditing(false);
      alert('Perfil actualizado correctamente');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al actualizar el perfil');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      alert('Contraseña cambiada correctamente');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al cambiar la contraseña');
    },
  });

  useEffect(() => {
    if (effectiveProfile) {
      setProfileData({
        firstName: effectiveProfile.firstName,
        lastName: effectiveProfile.lastName,
        phoneNumber: effectiveProfile.phoneNumber || '',
      });
    }
  }, [effectiveProfile]);

  const handleUpdateProfile = () => {
    if (!profileData.firstName || !profileData.lastName) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando perfil...</div>;
  }

  if (!effectiveProfile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            No se pudo cargar el perfil. El endpoint /api/Profile necesita ser implementado en el backend.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>Gestiona tu información personal</CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar Perfil
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={effectiveProfile.email || ''}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El email no se puede modificar
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <Input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <Input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, lastName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phoneNumber: e.target.value })
                  }
                  placeholder="Ej: +54 11 1234-5678"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    if (effectiveProfile) {
                      setProfileData({
                        firstName: effectiveProfile.firstName,
                        lastName: effectiveProfile.lastName,
                        phoneNumber: effectiveProfile.phoneNumber || '',
                      });
                    }
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base text-gray-900">{effectiveProfile.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre</p>
                <p className="text-base text-gray-900">
                  {effectiveProfile.firstName} {effectiveProfile.lastName}
                </p>
              </div>
              {effectiveProfile.phoneNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="text-base text-gray-900">{effectiveProfile.phoneNumber}</p>
                </div>
              )}
              {profileError && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ El endpoint /api/Profile no está implementado en el backend. 
                    Se están mostrando los datos del usuario autenticado.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
            </div>
            {!isChangingPassword && (
              <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                Cambiar Contraseña
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isChangingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Actual *
                </label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña *
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nueva Contraseña *
                </label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Haz clic en "Cambiar Contraseña" para actualizar tu contraseña de acceso.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

