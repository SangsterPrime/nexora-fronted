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

## Autor

NEXORA fue desarrollado por Joel Sangster como proyecto académico/fullstack, integrando React, Vite, Spring Boot, PostgreSQL Neon, Render, Vercel y Google OAuth2.

## Notas técnicas

- Frontend desplegado en Vercel.
- Backend desplegado en Render.
- Base de datos en Neon PostgreSQL.
- Login mediante Google OAuth2.
- Vercel usa rewrites como proxy hacia Render para mejorar compatibilidad de sesión.

## Rutas

- `/`: landing pública comercial de NEXORA.
- `/login`: pantalla de acceso con Google.
- `/app`: dashboard interno protegido.
- `/app/proveedores`: CRUD real de proveedores.
- `/app/solicitudes`: módulo preparado para solicitudes de compra.
- `/app/cotizaciones`: módulo preparado para cotizaciones.
- `/app/pipelines`: módulo preparado para pipelines.
- `/app/ia`: vista "Pipeline IA" con la integración del módulo de Machine Learning.

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
/oauth2/authorization/google
```

En producción esa ruta es same-origin en Vercel y `vercel.json` la reenvía al backend Render.

## Producción

En Vercel producción elimina `VITE_API_URL` o no la configures. El frontend usará rutas relativas same-origin y Vercel reenviará estas rutas al backend Render mediante `vercel.json`:

- `/api/**`
- `/oauth2/**`
- `/login/oauth2/**`
- `/actuator/**`
- `/db-test`

Para desarrollo local sí debes crear `.env` con:

```env
VITE_API_URL=http://localhost:8080
```

Después de crear, eliminar o cambiar `VITE_API_URL` en Vercel, redeploya el frontend. Vite inserta las variables `VITE_*` en tiempo de build, por lo que un cambio de Environment Variables no afecta al bundle ya compilado.

El backend debe tener configurado Google OAuth2, CORS con credenciales y cookies de sesión compatibles con el dominio del frontend.

En Render backend configura:

```env
GOOGLE_OAUTH_REDIRECT_URI=https://nexora-fronted.vercel.app/login/oauth2/code/google
```

En Google Cloud Console agrega:

```text
https://nexora-fronted.vercel.app/login/oauth2/code/google
https://nexora-backend-nb85.onrender.com/login/oauth2/code/google
```

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
- `/api/ml/*` (módulo de IA, ver más abajo)

La base de API vive en `src/config/api.js`, lee `VITE_API_URL` y permite valor vacío para usar el proxy same-origin de Vercel. `src/services/api.js` usa `credentials: 'include'` para enviar cookies/sesión.

La landing muestra una verificación visual del backend consultando `/api/health` en producción o `${VITE_API_URL}/api/health` en desarrollo local.

## Módulo de IA / Pipeline IA (Evaluación Parcial 3)

La vista `/app/ia` ("Pipeline IA" en el menú lateral) integra el frontend con el backend y el módulo de Machine Learning.

### Arquitectura final (Cron → Neon → Backend → Frontend)

```
EntrenamientoAI (Render Cron Job) → Neon PostgreSQL → backend Spring Boot (/api/ml/*) → frontend
```

- **EntrenamientoAI** (Python) corre como **Render Cron Job** de forma programada (no en vivo).
- Cada corrida escribe **métricas y predicciones en Neon PostgreSQL**.
- El **backend** Spring Boot lee Neon y expone los resultados en `/api/ml/*`.
- El **frontend nunca llama a Python directamente**: solo consume `/api/ml/*` mediante `src/services/mlApi.js`. La sesión viaja por cookie (`credentials: 'include'`); no se guardan tokens ni secretos en `localStorage`/`sessionStorage`.

El backend puede operar en **modo CRON** o **modo API**:

- **Modo API:** `/train` y `/score` ejecutan en vivo y devuelven 2xx con resultados.
- **Modo CRON:** `/train` y `/score` responden **202 / 409** indicando que la corrida la agenda Render. La vista lo trata como mensaje informativo (no como error crítico) y sugiere usar **Trigger Run** en Render.

El cliente vive en `src/services/mlApi.js`:

| Función | Método | Endpoint | En modo CRON |
| --- | --- | --- | --- |
| `getMlHealth` | GET | `/api/ml/health` | Reporta `mode` (CRON/API) |
| `trainModel` | POST | `/api/ml/train` | Responde 202/409 (agendado) |
| `scoreModel` | POST | `/api/ml/score` | Responde 202/409 (batch en cron) |
| `getMetrics` | GET | `/api/ml/metrics` | Lee últimas métricas de Neon |
| `getPredictions` | GET | `/api/ml/predictions` | Lee predicciones de Neon |

La vista muestra:

- **Resumen de integración:** modo (`Cron Job / Render` o `API`), última ejecución detectada, métricas disponibles desde Neon y cantidad de predicciones.
- Tarjetas de métricas: **Accuracy, Recall, Precision, F1 Score, ROC-AUC y Gini**.
- **Matriz de confusión** (TN / FP / FN / TP).
- **Estado del servicio ML** (operativo / offline) y **última ejecución** detallada: timestamp, modelo seleccionado, duración, muestras y fuente (**Neon PostgreSQL**).
- **Tabla de predicciones/resultados** publicados en Neon.
- Botones: **Verificar servicio IA**, **Entrenar modelo**, **Ejecutar scoring**, **Actualizar predicciones** y **Actualizar métricas**, con estados de carga, error e información (modo Cron).

El parseo de las respuestas es defensivo: acepta métricas en rango 0–1 o en porcentaje, distintas variantes de nombres (`rocAuc` / `roc_auc` / `auc`, `f1` / `f1Score`, `model` / `selectedModel`, `durationSeconds` / `durationMs`, etc.) y la matriz de confusión como arreglo `[[TN, FP], [FN, TP]]` o como campos sueltos (`tn`, `fp`, `fn`, `tp`).

### Cómo se prueba (demo en modo Cron Job)

1. Backend local o en Render con los endpoints `/api/ml/*` disponibles, leyendo de Neon. `/api/ml/health` debe devolver `mode: "CRON"`.
2. Crear `.env` con `VITE_API_URL=http://localhost:8080` (local) y levantar el frontend con `pnpm dev`. En producción no se define `VITE_API_URL`.
3. Iniciar sesión y entrar a `/app/ia` desde el menú "Pipeline IA".
4. La vista carga automáticamente estado, métricas y predicciones desde Neon y muestra el badge **Modo Cron Job / Render**.
5. Pulsar **Verificar servicio IA** para confirmar el modo, y **Actualizar métricas** / **Actualizar predicciones** para releer Neon.
6. Pulsar **Entrenar modelo** o **Ejecutar scoring**: en modo CRON la vista muestra el mensaje *"El entrenamiento se ejecuta por Render Cron Job. Para forzar una corrida, usa Trigger Run en Render."* (y el equivalente para scoring), sin romper la UI.
7. Para forzar una corrida real, usar **Trigger Run** en el Cron Job de Render; al terminar, refrescar métricas/predicciones en la vista.
8. Si el backend aún no publica `/api/ml/*`, la vista muestra mensajes de error controlados (p. ej. HTTP 404) sin romper la UI.

Respuestas esperadas (ejemplo, modo CRON):

```json
// GET /api/ml/health
{ "status": "UP", "mode": "CRON", "model": "XGBoost", "version": "v1" }

// GET /api/ml/metrics  (publicadas por el cron en Neon)
{
  "accuracy": 0.92, "recall": 0.88, "precision": 0.90,
  "f1": 0.89, "rocAuc": 0.95, "gini": 0.90,
  "confusionMatrix": [[120, 8], [10, 95]],
  "lastRun": "2026-06-24T12:00:00Z", "model": "XGBoost",
  "modelVersion": "v1", "durationSeconds": 42, "samples": 233,
  "source": "Neon PostgreSQL"
}

// POST /api/ml/train  → en modo CRON
// HTTP 202 / 409
{ "mode": "CRON", "message": "El entrenamiento se ejecuta por Render Cron Job." }

// GET /api/ml/predictions
{ "content": [ { "id": 1, "score": 0.8123, "probability": 0.81, "prediction": "1" } ], "totalElements": 1 }
```

Pruebas automatizadas: `src/test/services/mlApi.spec.jsx` cubre los endpoints del cliente, `src/test/components/IaPipelineSection.spec.jsx` cubre el **modo Cron** (badge, última ejecución, respuestas 202/409 amigables) y `src/test/pages/AppPages.spec.jsx` valida el render de la vista. Ejecuta `pnpm test`.

## Prueba móvil

1. Abrir `https://nexora-fronted.vercel.app/login` desde el celular.
2. Tocar `Continuar con Google`.
3. Google debe volver al backend y luego redirigir a `https://nexora-fronted.vercel.app/app`.
4. Al cargar `/app`, el frontend consulta `GET /api/auth/me` con `credentials: 'include'`.

Si falla en iPhone/Safari, prueba Chrome móvil o desactiva temporalmente `Configuración > Safari > Impedir seguimiento entre sitios`. Algunos navegadores móviles bloquean cookies cross-site con más fuerza cuando frontend y backend están en dominios distintos (`vercel.app` y `onrender.com`).

Nota técnica futura: para máxima compatibilidad móvil conviene usar dominio propio compartido, por ejemplo `https://nexora.cl` y `https://api.nexora.cl`, en vez de mezclar dominios de Vercel y Render.

## Assets

Los assets públicos principales viven en `public/assets/`.
