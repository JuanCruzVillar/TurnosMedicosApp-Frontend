# Hospital San Juan - Frontend

Frontend del sistema de gestión de turnos médicos del Hospital San Juan, desarrollado con **React 19**, **TypeScript** y **Vite**.

## 🛠️ Stack Tecnológico

- **React 19.2** - Biblioteca UI
- **TypeScript 5.9** - Tipado estático
- **Vite 7.2** - Build tool
- **Tailwind CSS 3.4** - Estilos utility-first
- **Zustand 5.0** - Gestión de estado
- **TanStack React Query 5.90** - Data fetching
- **React Router DOM 7.10** - Routing
- **Axios 1.13** - Cliente HTTP
- **date-fns 4.1** - Manejo de fechas

## 📁 Estructura del Proyecto

```
src/
├── api/              # Clientes API (appointments, auth, professionals, etc.)
├── components/       # Componentes React
│   ├── layout/      # Header, Layout
│   ├── patient/     # Componentes específicos de paciente
│   ├── professional/# Componentes específicos de profesional
│   └── ui/          # Componentes UI reutilizables
├── pages/           # Páginas de la aplicación
├── store/           # Estado global (Zustand)
├── types/           # Definiciones TypeScript
└── lib/             # Utilidades y configuración
```

## ✨ Características Implementadas

- ✅ **Autenticación JWT** - Login, registro y manejo de tokens
- ✅ **Rutas Protegidas** - Control de acceso por roles (Patient, Professional, Admin)
- ✅ **Gestión de Estado** - Zustand para estado global, React Query para datos del servidor
- ✅ **UI Responsive** - Diseño mobile-first con Tailwind CSS
- ✅ **Integración API REST** - Cliente Axios con interceptors para autenticación
- ✅ **Formularios** - Validación y feedback al usuario
- ✅ **Optimización** - React Query para cache y refetch inteligente
- ✅ **TypeScript** - Tipado fuerte en toda la aplicación

## 🎯 Competencias Demostradas

- Desarrollo de SPA con React y TypeScript
- Implementación de autenticación y autorización en frontend
- Gestión de estado global y local
- Integración con APIs REST
- UI/UX responsive y moderna
- Manejo de formularios y validaciones
- Optimización de peticiones HTTP
- Manejo de errores y estados de carga
- Rutas protegidas por roles

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ y npm
- Backend API ejecutándose (ver [README principal](../TurnosApp/README.md))

### Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
   - Crear archivo `.env` en la raíz del proyecto:
   ```
   VITE_API_URL=http://localhost:5294/api
   ```
   - Para producción, usar la URL de tu API:
   ```
   VITE_API_URL=https://api.turnosapp.com/api
   ```

3. **Ejecutar en desarrollo**:
```bash
npm run dev
```

4. **Build para producción**:
```bash
npm run build
```

Los archivos de producción estarán en `dist/`

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera el build de producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta el linter

## 🔒 Seguridad

- Los tokens JWT se almacenan en `localStorage`
- Los interceptors de Axios manejan automáticamente la autenticación
- Las rutas están protegidas por roles
- Los logs de desarrollo están condicionados a `import.meta.env.DEV`

## 🎨 UI/UX

- Diseño mobile-first con Tailwind CSS
- Componentes reutilizables en `src/components/ui/`
- Estados de carga y error manejados consistentemente
- Feedback visual para todas las acciones del usuario

---

**Parte del proyecto fullstack Hospital San Juan - Ver [README principal](../TurnosApp/README.md) para más información.**
