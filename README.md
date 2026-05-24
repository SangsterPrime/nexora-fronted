# NEXORA Frontend

Frontend React + Vite + Bootstrap 5 para NEXORA, una plataforma web/SaaS de gestión y automatización del ciclo de abastecimiento.

NEXORA centraliza módulos de proveedores, solicitudes de compra, cotizaciones, negociaciones, órdenes de compra, pipelines, ejecuciones de pipeline y KPIs.

## Stack

- React
- Vite
- Bootstrap 5
- CSS personalizado
- pnpm

## Desarrollo

Instalar dependencias:

```bash
pnpm install
```

Levantar entorno local:

```bash
pnpm dev
```

Compilar producción:

```bash
pnpm build
```

## Configuración

Crear un archivo `.env` tomando como base `.env.example` si se necesita apuntar a otra API:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## API Backend

Backend esperado en Spring Boot:

- `GET /api/health`
- `/api/usuarios`
- `/api/proveedores`
- `/api/solicitudes-compra`
- `/api/cotizaciones`
- `/api/negociaciones`
- `/api/ordenes-compra`
- `/api/pipelines`
- `/api/pipeline-ejecuciones`

La preparación de cliente HTTP está en `src/services/api.js`.

## Assets

Los assets públicos principales viven en `public/assets/`:

- `public/assets/s4ngster-loop.mp4`
- `public/assets/s4ngster-hero.webp`
