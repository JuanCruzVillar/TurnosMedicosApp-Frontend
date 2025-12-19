# TurnosApp - Frontend

Frontend de la aplicación TurnosApp desarrollado con **React 19**, **TypeScript** y **Vite**.

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

---

**Parte del proyecto fullstack TurnosApp - Ver [README principal](../TurnosApp/README.md) para más información.**
