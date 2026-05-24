# NEXORA Frontend

Frontend React + Vite + Bootstrap 5 para NEXORA, una plataforma web/SaaS de gestión y automatización del ciclo de abastecimiento.

NEXORA centraliza proveedores, solicitudes de compra, cotizaciones, negociaciones, órdenes de compra, pipelines y KPIs.

## Stack

- React
- React Router
- Vite
- Bootstrap 5
- CSS personalizado
- pnpm

## Rutas

- `/`: landing pública comercial de NEXORA.
- `/login`: pantalla de acceso con Google.
- `/app`: dashboard interno protegido.
- `/app/proveedores`: CRUD real de proveedores.
- `/app/solicitudes`: módulo preparado para solicitudes de compra.
- `/app/cotizaciones`: módulo preparado para cotizaciones.
- `/app/pipelines`: módulo preparado para pipelines.

## Desarrollo local

Instalar dependencias:

```bash
pnpm install
```

Crear `.env` a partir de `.env.example`:

```env
VITE_API_URL=http://localhost:8080
```

Levantar el frontend:

```bash
pnpm dev
```

Compilar producción:

```bash
pnpm build
```

## Autenticación

El frontend no guarda tokens en `localStorage` ni `sessionStorage`.

La autenticación se delega al backend Spring Boot mediante Google OAuth2 y sesión/cookies:

- `GET /api/auth/me`: consulta usuario autenticado.
- `POST /api/auth/logout`: cierra sesión.
- `/oauth2/authorization/google`: inicia login con Google.

El botón `Continuar con Google` redirige a:

```bash
${VITE_API_URL}/oauth2/authorization/google
```

## Producción

En Vercel, Render o Netlify configura la variable de entorno:

```env
VITE_API_URL=https://nexora-backend-nb85.onrender.com
```

Después de crear o cambiar `VITE_API_URL` en Vercel, redeploya el frontend. Vite inserta las variables `VITE_*` en tiempo de build, por lo que un cambio de Environment Variables no afecta al bundle ya compilado.

El backend debe tener configurado Google OAuth2, CORS con credenciales y cookies de sesión compatibles con el dominio del frontend.

Frontend desplegado actual:

```text
https://nexora-fronted.vercel.app
```

## API Backend

Backend esperado en Spring Boot:

- `GET /api/health`
- `GET /db-test`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `/api/proveedores`
- `/api/solicitudes-compra`
- `/api/cotizaciones`
- `/api/negociaciones`
- `/api/ordenes-compra`
- `/api/pipelines`
- `/api/pipeline-ejecuciones`

La base de API vive en `src/config/api.js`, lee `VITE_API_URL` y se usa desde `src/services/api.js` con `credentials: 'include'` para enviar cookies/sesión al backend.

La landing muestra una verificación visual del backend consultando `${VITE_API_URL}/api/health` en la sección de estado del sistema.

## Prueba móvil

1. Abrir `https://nexora-fronted.vercel.app/login` desde el celular.
2. Tocar `Continuar con Google`.
3. Google debe volver al backend y luego redirigir a `https://nexora-fronted.vercel.app/app`.
4. Al cargar `/app`, el frontend consulta `GET /api/auth/me` con `credentials: 'include'`.

Si falla en iPhone/Safari, prueba Chrome móvil o desactiva temporalmente `Configuración > Safari > Impedir seguimiento entre sitios`. Algunos navegadores móviles bloquean cookies cross-site con más fuerza cuando frontend y backend están en dominios distintos (`vercel.app` y `onrender.com`).

Nota técnica futura: para máxima compatibilidad móvil conviene usar dominio propio compartido, por ejemplo `https://nexora.cl` y `https://api.nexora.cl`, en vez de mezclar dominios de Vercel y Render.

## Assets

Los assets públicos principales viven en `public/assets/`.
