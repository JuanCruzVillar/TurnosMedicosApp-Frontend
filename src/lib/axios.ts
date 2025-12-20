import axios from 'axios';

/**
 * Configuración del cliente HTTP Axios para la aplicación.
 * 
 * Utiliza interceptors para:
 * - Agregar automáticamente el token JWT a todas las requests
 * - Manejar errores 401 (no autorizado) y limpiar sesión
 * - Serializar fechas correctamente para .NET
 * 
 * Patrón: Interceptor pattern para cross-cutting concerns
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5294/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Se ejecuta antes de cada petición HTTP.
 * 
 * Responsabilidades:
 * 1. Obtener token JWT de localStorage y agregarlo al header Authorization
 * 2. Sincronizar token entre localStorage y Zustand store
 * 3. Serializar fechas en formato ISO 8601 para compatibilidad con .NET
 */
api.interceptors.request.use((config) => {
  // Obtener el token de localStorage (fuente principal)
  // localStorage es síncrono y más rápido que leer del store de Zustand
  let token = localStorage.getItem('token');
  
  // Si no hay token en localStorage, intentar obtenerlo del store de Zustand
  if (!token) {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed?.state?.token && typeof parsed.state.token === 'string') {
          const extractedToken = parsed.state.token;
          token = extractedToken;
          // Sincronizar con localStorage
          localStorage.setItem('token', extractedToken);
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('Error al leer auth-storage:', e);
      }
    }
  }
  
  if (token) {
    // Limpiar el token si tiene "Bearer " al inicio (para evitar duplicados)
    const cleanToken = token.replace(/^Bearer\s+/, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
    
    // Solo loggear en desarrollo y para endpoints que no sean Auth
    if (import.meta.env.DEV && !config.url?.includes('/Auth/')) {
      console.log('Token agregado a la petición:', cleanToken.substring(0, 20) + '...');
      console.log('URL:', config.url);
      console.log('Método:', config.method?.toUpperCase());
    }
  } else {
    // Si no hay token, eliminar el header de Authorization si existe
    delete config.headers.Authorization;
    // Solo loggear warning en desarrollo y si no es un endpoint de autenticación
    if (import.meta.env.DEV && !config.url?.includes('/Auth/')) {
      console.warn('No se encontró token para la petición:', config.url);
    }
  }
  
  // Asegurar que las fechas se serialicen correctamente
  if (config.data && typeof config.data === 'object') {
    config.data = JSON.parse(JSON.stringify(config.data, (_key, value) => {
      // Si es una fecha en formato string ISO, mantenerla como está
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return value;
      }
      return value;
    }));
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Response Interceptor: Se ejecuta después de cada respuesta HTTP.
 * 
 * Maneja errores de autenticación (401) de forma centralizada:
 * - Detecta cuando el token ha expirado o es inválido
 * - Limpia el estado de autenticación
 * - Redirige al login después de un delay para UX
 * 
 * Esto evita tener que manejar 401 en cada componente individualmente.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized: token inválido, expirado o ausente
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      
      // Solo loggear en desarrollo
      if (import.meta.env.DEV) {
        console.error('Error 401 - No autorizado');
        console.error('Token presente:', !!token);
        console.error('URL de la petición:', error.config?.url);
        console.error('Método:', error.config?.method);
      }
      
      // Verificar si es un endpoint que requiere autenticación
      const requiresAuth = !error.config?.url?.includes('/Auth/');
      
      if (requiresAuth) {
        // Limpiar el almacenamiento solo si realmente no hay token o el token es inválido
        // No limpiar inmediatamente, dejar que el componente maneje el error primero
        if (import.meta.env.DEV) {
          console.warn('Petición requiere autenticación pero recibió 401');
        }
        
        // Si hay token presente, probablemente está expirado
        // No cerrar sesión automáticamente, dejar que el componente maneje el error
        // El componente mostrará un mensaje y el usuario puede decidir qué hacer
        
        // Solo limpiar y redirigir si no estamos en una página de autenticación
        // Y solo después de que el componente haya manejado el error
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || currentPath === '/register';
        
        if (!isAuthPage && token) {
          // El token está presente pero fue rechazado (probablemente expirado)
          // Esperar más tiempo para que el usuario vea el mensaje y pueda decidir
          // No cerrar sesión automáticamente, solo después de un tiempo más largo
          setTimeout(() => {
            // Verificar si el usuario todavía está en la misma página
            // Si cambió de página, no hacer nada
            if (window.location.pathname === currentPath) {
              // Limpiar el almacenamiento
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              // Limpiar el store de Zustand
              try {
                localStorage.removeItem('auth-storage');
              } catch (e) {
                if (import.meta.env.DEV) {
                  console.error('Error al limpiar auth-storage:', e);
                }
              }
              // Solo redirigir si todavía estamos en la misma página
              window.location.href = '/login';
            }
          }, 5000); // 5 segundos para que el usuario vea el mensaje y pueda reaccionar
        } else if (!isAuthPage && !token) {
          // No hay token, redirigir inmediatamente
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      }
    }
    return Promise.reject(error);
  }
);