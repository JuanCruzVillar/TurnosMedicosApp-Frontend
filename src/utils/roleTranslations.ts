/**
 * Traduce los roles del sistema al español
 */
export function translateRole(role: string): string {
  const translations: Record<string, string> = {
    Patient: 'Paciente',
    Professional: 'Profesional',
    Admin: 'Administrador',
  };
  
  return translations[role] || role;
}

