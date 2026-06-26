# Bitácora de Desarrollo NEXORA Frontend

## Contexto General

NEXORA comenzó como una landing React + Vite y fue evolucionando hacia una base real de frontend para una plataforma web/SaaS de gestión y automatización del ciclo de abastecimiento.

El objetivo final de esta fase fue dejar una primera versión visual premium, conectable al backend Spring Boot local, con una primera operación CRUD real sobre proveedores.

La plataforma está orientada a centralizar y automatizar módulos como:

- Usuarios
- Proveedores
- Solicitudes de compra
- Cotizaciones
- Negociaciones
- Órdenes de compra
- Pipelines
- Ejecuciones de pipelines
- KPIs

## Stack Usado

- React
- Vite
- Bootstrap 5
- CSS personalizado
- pnpm
- Backend Spring Boot local en `http://localhost:8080`

No se usó:

- Tailwind
- TypeScript
- Librerías externas de formularios
- Librerías externas de charts
- localStorage
- sessionStorage
- Login falso
- Rutas frontend

## Estructura Frontend Respetada

Se mantuvo una estructura inspirada en atomic design:

```txt
src/
  components/
    atoms/
    organisms/
    particles/
    templates/
  hooks/
  pages/
  services/
  styles/
    atoms/
    molecules/
    organisms/
    pages/
    particles/
    templates/
```

`App.jsx` quedó limpio y solo renderiza:

```jsx
<Home />
```

## Dependencias y Configuración Inicial

Se instaló Bootstrap usando exclusivamente `pnpm`:

```bash
pnpm add bootstrap
```

Se importó Bootstrap en `src/main.jsx`:

```jsx
import 'bootstrap/dist/css/bootstrap.min.css'
```

Se mantuvo `src/index.css` como base global para:

- Variables CSS
- Reset mínimo
- Fuentes globales
- Colores de marca
- Tipografías

## Assets Visuales

El video oficial del hero se mantuvo en:

```txt
public/assets/s4ngster-loop.mp4
```

La imagen poster/fallback se dejó en:

```txt
public/assets/s4ngster-hero.webp
```

El componente `HeroVideo` usa:

```jsx
<video
  className="hero-video"
  autoPlay
  muted
  loop
  playsInline
  poster="/assets/s4ngster-hero.webp"
>
  <source src="/assets/s4ngster-loop.mp4" type="video/mp4" />
</video>
```

Se eliminaron assets innecesarios del template de Vite y duplicados no usados:

- `src/App.css`
- `src/assets/react.svg`
- `src/assets/vite.svg`
- `src/assets/hero.png`
- `src/assets/s4ngster-hero.webp`
- `src/assets/s4ngster-loop.webm`

La carpeta `src/assets/` quedó vacía por ahora para conservar la estructura sin duplicar assets pesados.

## Diseño Visual Principal

La identidad visual se construyó como cyberpunk premium, pero con enfoque SaaS real.

Elementos visuales usados:

- Video de fondo en hero
- Glassmorphism
- Navbar translúcida
- Neón verde sutil
- Acentos cyan, magenta y violeta
- Gradientes oscuros
- Scanlines discretas
- Ruido visual animado suave
- Overlays finos para legibilidad
- Diseño responsive
- Animaciones suaves respetando `prefers-reduced-motion`

Se corrigió el enfoque inicial para que NEXORA no pareciera videojuego, sino una plataforma real de compras y abastecimiento inteligente.

## Componentes Base Creados

### Atoms

- `src/components/atoms/Button.jsx`
- `src/components/atoms/Logo.jsx`

### Particles

- `src/components/particles/HeroVideo.jsx`
- `src/components/particles/Scanlines.jsx`
- `src/components/particles/Noise.jsx`

### Organisms

- `src/components/organisms/Navbar.jsx`
- `src/components/organisms/HeroSection.jsx`
- `src/components/organisms/OperationalFlowSection.jsx`
- `src/components/organisms/ModulesSection.jsx`
- `src/components/organisms/DashboardPreview.jsx`
- `src/components/organisms/ProveedoresSection.jsx`
- `src/components/organisms/ArchitectureSection.jsx`
- `src/components/organisms/SystemStatusSection.jsx`

### Page

- `src/pages/Home.jsx`

## HeroSection

El hero se dejó como pantalla principal fullscreen con el video del conejo hacker cyberpunk como identidad visual premium, pero el contenido se orientó a procurement.

Copy final:

```txt
Eyebrow:
— NEXORA PROCUREMENT OS

Título:
AUTOMATE PROCUREMENT.
CONTROL THE FLOW.

Descripción:
Centraliza solicitudes de compra, compara cotizaciones, gestiona proveedores y automatiza pipelines operativos con trazabilidad, métricas y control en tiempo real.

Botón primary:
▸ Ver módulos

Botón secondary:
Conectar API

Metadata:
SPRING BOOT · REACT · POSTGRESQL · API REST · PIPELINES · KPI
```

Mejoras aplicadas:

- Overlay oscuro más fino.
- Texto más legible sobre el video.
- Glow verde más sutil.
- Personaje del video menos tapado en desktop.
- Mejor comportamiento mobile.
- Botones con enlaces internos a secciones de la landing.

## Navbar

Se implementó una navbar glass con logo `NEXORA` y enlaces internos hacia secciones de la landing.

Links actuales:

- Inicio
- Flujo
- Módulos
- Arquitectura
- Estado

En mobile se compacta mostrando estado `ONLINE`.

## Flujo Operacional

Se agregó la sección `OperationalFlowSection` para explicar visualmente el flujo del ciclo de abastecimiento:

```txt
Solicitud → Cotización → Negociación → Orden → Pipeline → KPI
```

En desktop se muestra como steps horizontales.

En tablet/mobile cambia a grid/vertical para mantener legibilidad.

## Módulos Principales

Se mejoró `ModulesSection` para representar módulos de producto reales.

Cards actuales:

- Proveedores
- Solicitudes
- Cotizaciones
- Negociaciones
- Órdenes
- Pipelines

Cada card incluye:

- Número
- Título
- Descripción de producto
- Endpoint REST relacionado

Endpoints mostrados:

```txt
/api/proveedores
/api/solicitudes-compra
/api/cotizaciones
/api/negociaciones
/api/ordenes-compra
/api/pipelines
```

## Dashboard Preview

Se agregó `DashboardPreview` como previsualización visual tipo panel principal, sin crear rutas todavía.

Archivo:

```txt
src/components/organisms/DashboardPreview.jsx
```

CSS:

```txt
src/styles/organisms/DashboardPreview.css
```

Contenido:

- Header `Command Center`
- Subtítulo operativo
- KPI cards superiores
- Tabla de últimas solicitudes de compra
- Panel lateral `Pipeline monitor`

KPI cards:

- Solicitudes activas
- Proveedores registrados
- Cotizaciones recibidas
- Pipelines activos

Cada KPI muestra:

- Número
- Label
- Endpoint asociado
- Estado visual `live`, `syncing` o `demo`

Consumos intentados:

```txt
GET /api/solicitudes-compra?page=0&size=5
GET /api/proveedores?page=0&size=20
GET /api/cotizaciones?page=0&size=20
GET /api/pipelines
```

Si la API falla o devuelve vacío, el componente usa datos mock con etiqueta `demo data`.

No se agregó CRUD en esta sección. Es solo una previsualización conectable.

## Primer CRUD Real: Proveedores

Se implementó el primer CRUD real en el frontend usando el módulo `Proveedores`.

Archivos:

```txt
src/components/organisms/ProveedoresSection.jsx
src/styles/organisms/ProveedoresSection.css
```

Se insertó en `Home.jsx` después de `DashboardPreview`.

Endpoints usados:

```txt
GET /api/proveedores?page=0&size=20
POST /api/proveedores
PUT /api/proveedores/{id}
DELETE /api/proveedores/{id}
```

DTO esperado:

```json
{
  "rut": "",
  "razonSocial": "",
  "nombreContacto": "",
  "email": "",
  "telefono": "",
  "direccion": "",
  "reputacionScore": 0,
  "cumplimientoScore": 0,
  "estado": "ACTIVO"
}
```

Estados manejados:

```txt
ACTIVO
INACTIVO
SUSPENDIDO
```

Funcionalidades implementadas:

- Listar proveedores desde API real.
- Mostrar loading.
- Mostrar error elegante si falla.
- Tabla responsive Bootstrap.
- Botón `Nuevo proveedor`.
- Modal custom controlado por React, sin Bootstrap JS.
- Crear proveedor.
- Editar proveedor.
- Eliminar proveedor con confirmación simple usando `window.confirm`.
- Refrescar tabla después de crear, editar o eliminar.

Validación frontend básica:

- `rut` requerido.
- `razonSocial` requerido.
- `email` requerido.
- Formato válido de email.
- `reputacionScore >= 0`.
- `cumplimientoScore >= 0`.

Diseño aplicado:

- Cyberpunk premium.
- Glassmorphism.
- Botones neón.
- Badges por estado.
- Endpoint visible `/api/proveedores`.
- Responsive mobile.

## Arquitectura

Se agregó `ArchitectureSection` para mostrar el stack técnico de forma clara.

Cards:

```txt
Frontend:
React + Vite + Bootstrap

Backend:
Java 21 + Spring Boot + JPA + PostgreSQL

API:
REST + Swagger/OpenAPI + Actuator
```

La sección usa cards glassmorphism y mantiene la estética premium.

## Estado del Sistema

Se agregó y luego conectó `SystemStatusSection` al health real del backend.

Endpoint usado:

```txt
GET /api/health
```

Estados visuales:

- `LOADING` mientras consulta.
- `ONLINE` si `status === "UP"`.
- `OFFLINE` si falla.

También muestra:

- API Base URL usada por el frontend.
- Health Check.
- Swagger.
- Respuesta o error.

Incluye botón para reintentar health check.

La sección mantiene estilo terminal/glassmorphism y punto visual animado.

## Capa API Frontend

Se configuró `src/services/api.js` para trabajar con rutas relativas por defecto.

Base final:

```js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
```

Esto permite que Vite use proxy durante desarrollo.

Funciones creadas:

- `apiGet(path)`
- `apiPost(path, data)`
- `apiPut(path, data)`
- `apiDelete(path)`

Todas usan `fetch`, manejan JSON y lanzan errores claros.

El manejo de error contempla respuestas del backend con formato:

```txt
mensaje
errores
status
path
```

## Servicios Frontend

Se crearon servicios separados por dominio.

### Health

Archivo:

```txt
src/services/healthService.js
```

Función:

```js
checkHealth()
```

Endpoint:

```txt
GET /api/health
```

### Proveedores

Archivo:

```txt
src/services/proveedorService.js
```

Funciones:

```js
listProveedores({ page = 0, size = 20, estado } = {})
createProveedor(data)
updateProveedor(id, data)
deleteProveedor(id)
```

### Solicitudes de Compra

Archivo:

```txt
src/services/solicitudCompraService.js
```

Función:

```js
listSolicitudes({ page = 0, size = 20, estado, usuarioSolicitanteId } = {})
```

### Cotizaciones

Archivo:

```txt
src/services/cotizacionService.js
```

Función:

```js
listCotizaciones({ page = 0, size = 20 } = {})
```

### Pipelines

Archivo:

```txt
src/services/pipelineService.js
```

Función:

```js
listPipelines()
```

### Órdenes de Compra

Archivo:

```txt
src/services/ordenCompraService.js
```

Función:

```js
listOrdenesCompra({ page = 0, size = 20 } = {})
```

### Ejecuciones de Pipeline

Archivo:

```txt
src/services/pipelineEjecucionService.js
```

Función:

```js
listPipelineEjecuciones()
```

## Hook API Reutilizable

Se creó:

```txt
src/hooks/useApiResource.js
```

Maneja:

- `data`
- `loading`
- `error`
- `refetch`

Se implementó sin librerías externas.

Se ajustó para cumplir la regla de lint de React que evita disparar `setState` directamente de forma síncrona dentro de un effect.

## Proxy Vite

Se configuró `vite.config.js` para desarrollo local:

```js
server: {
  proxy: {
    '/api': 'http://localhost:8080',
    '/actuator': 'http://localhost:8080',
    '/v3': 'http://localhost:8080',
    '/swagger-ui': 'http://localhost:8080',
  },
}
```

Esto permite consumir el backend desde frontend en `http://localhost:5173` sin hardcodear `http://localhost:8080` en cada request.

## Variables de Entorno

Se creó:

```txt
.env.example
```

Contenido:

```txt
VITE_API_BASE_URL=http://localhost:8080
```

Por defecto el frontend usa rutas relativas. El `.env` queda disponible si se quiere apuntar explícitamente a otra URL.

## CORS Backend

El backend está fuera de este proyecto frontend, ubicado en:

```txt
C:\BlackBox\GitHub\nexora\nexora-backend
```

Se agregó configuración CORS en:

```txt
C:\BlackBox\GitHub\nexora\nexora-backend\src\main\java\cl\duoc\nexora\backend\config\CorsConfig.java
```

Configuración aplicada:

Allowed origins:

```txt
http://localhost:5173
http://127.0.0.1:5173
```

Allowed methods:

```txt
GET, POST, PUT, DELETE, OPTIONS
```

Allowed headers:

```txt
*
```

Credentials:

```txt
false
```

Mappings:

```txt
/api/**
/actuator/**
```

No se agregó Spring Security.
No se cambiaron controllers.
No se tocó lógica de negocio.

Se compiló el backend con:

```bash
.\mvnw.cmd -q -DskipTests compile
```

La compilación fue correcta.

## README

Se reemplazó el README default de Vite por un README de NEXORA Frontend.

Describe:

- Stack frontend.
- Objetivo de producto.
- Desarrollo local.
- Build.
- Configuración `.env`.
- Endpoints del backend.
- Ubicación de assets públicos.

## Comandos de Verificación Usados

Durante el desarrollo se verificó repetidamente con:

```bash
pnpm lint
pnpm build
```

También se compiló backend cuando se agregó CORS:

```bash
.\mvnw.cmd -q -DskipTests compile
```

## Estado Actual de Conexión Frontend-Backend

El frontend y backend quedaron conectados para desarrollo local.

Para probar:

1. Levantar backend en `http://localhost:8080`.
2. Levantar frontend con:

```bash
pnpm dev
```

3. Abrir:

```txt
http://localhost:5173
```

4. Revisar sección `Estado del sistema`.

Si el backend responde `GET /api/health` con:

```json
{
  "status": "UP"
}
```

La UI muestra `ONLINE`.

5. Revisar sección `Proveedores`.

Si backend y base de datos están operativos, se pueden listar, crear, editar y eliminar proveedores reales.

## Estado Final de la Landing

La landing actual es single-page y contiene, en orden:

- `HeroSection`
- `OperationalFlowSection`
- `ModulesSection`
- `DashboardPreview`
- `ProveedoresSection`
- `ArchitectureSection`
- `SystemStatusSection`

No se crearon rutas todavía.
No se implementó login.
No se implementó autenticación.
No se agregó dashboard completo con navegación interna.

## Próximas Fases Sugeridas

Posibles siguientes pasos:

1. Crear layout de aplicación real separado de la landing.
2. Agregar navegación interna cuando se definan rutas.
3. Expandir CRUD para solicitudes de compra.
4. Crear CRUD de cotizaciones.
5. Agregar vistas de pipelines y ejecuciones.
6. Agregar dashboard real con KPIs calculados desde backend.
7. Implementar autenticación cuando el backend incorpore Spring Security.
8. Agregar tests de componentes y servicios.
9. Unificar helpers repetidos para query params.
10. Definir diseño de tablas, formularios y estados como sistema de componentes reutilizables.

## Notas Importantes

- Se usó siempre `pnpm` para comandos frontend.
- No se usó `npm`.
- El proxy Vite permite desarrollo más limpio usando rutas relativas.
- CORS quedó igualmente configurado en backend para desarrollo local.
- El CRUD de proveedores ya depende de que el backend y la base de datos estén levantados.
- El dashboard preview usa datos reales cuando puede y fallback demo cuando la API falla o viene vacía.

## Actualización 2026-05-25: Rutas, Google OAuth, Vercel, Tests y Fix de Login

Esta actualización documenta la fase más reciente de trabajo sobre el frontend de NEXORA. En esta etapa el proyecto dejó de ser únicamente una landing conectable y pasó a tener una estructura híbrida real: sitio público, área interna protegida, autenticación Google OAuth delegada al backend, proxy de producción en Vercel, suite de pruebas unitarias con Karma/Jasmine y una corrección específica del bug que impedía navegar al login de Google.

### Objetivo de Esta Fase

El objetivo técnico fue dejar el frontend listo para operar con el backend desplegado en Render desde Vercel, sin exponer secretos, sin llamadas OAuth falsas, sin localStorage/sessionStorage para auth, y con pruebas automatizadas que cubran los puntos críticos.

Los focos fueron:

- Separar landing pública y aplicación interna.
- Agregar rutas reales con React Router.
- Implementar login Google OAuth usando sesión/cookies del backend.
- Proteger rutas `/app*` con un guard de autenticación.
- Mantener `/` público y no protegido.
- Usar proxy same-origin en Vercel para evitar problemas de CORS/OAuth/cookies entre dominios.
- Agregar pruebas unitarias de servicios, rutas, páginas y layout.
- Activar reporte de coverage en Karma.
- Corregir el bug del botón `Continuar con Google` que no navegaba.

### Commits Relevantes de Esta Fase

Los commits más relevantes creados durante esta fase fueron:

```txt
a4fd72e test: agregar pruebas unitarias frontend
ab933cc test: habilitar reporte de coverage
42dbf79 fix: usar proxy same-origin en Vercel
35d4552 fix: corregir navegación del login Google
```

También existían commits previos importantes que prepararon el terreno:

```txt
2a3f4a5 feat: migrar NEXORA a estructura híbrida
02185da feat: agregar autenticación con Google
56aec7d chore: configurar URL del backend
95360f8 chore: validar configuración de API
ba808bf fix: usar backend Render por defecto
a57b752 fix: mejorar experiencia móvil
```

### Estado Actual de Rutas

El frontend ahora usa `react-router-dom` y dejó de ser una single-page landing plana.

Rutas actuales:

```txt
/                  Landing pública
/login             Pantalla de login Google
/app               Dashboard interno protegido
/app/proveedores   Módulo proveedores protegido
/app/solicitudes   Módulo solicitudes protegido
/app/cotizaciones  Módulo cotizaciones protegido
/app/pipelines     Módulo pipelines protegido
*                  Redirección a /
```

Archivo principal involucrado:

```txt
src/App.jsx
```

La landing pública se mantiene accesible sin sesión. Las rutas internas `/app*` se envuelven con `ProtectedRoute`.

Decisiones importantes:

- `/` no requiere autenticación.
- `/login` tampoco requiere autenticación.
- `/app` y subrutas sí requieren sesión válida.
- Si el usuario no está autenticado, `ProtectedRoute` redirige a `/login`.
- Si el usuario ya está autenticado y entra a `/login`, se redirige a la ruta privada solicitada o a `/app`.

### Landing Pública

La landing pública ahora vive en:

```txt
src/pages/Landing.jsx
```

Usa `PublicLayout` y conserva las secciones visuales premium:

```txt
HeroSection
ProblemSection
SolutionSection
BenefitsSection
TargetUsersSection
OperationalFlowSection
ModulesSection
DashboardPreview
ArchitectureSection
FinalCTASection
Footer
```

El navbar público adapta el CTA `Entrar a plataforma` según el estado de autenticación:

```txt
Usuario no autenticado -> /login
Usuario autenticado    -> /app
```

Archivo relevante:

```txt
src/components/organisms/Navbar.jsx
```

### Layout Interno de Aplicación

Se agregó un layout interno separado para las páginas privadas:

```txt
src/layouts/AppLayout.jsx
```

Responsabilidades del layout:

- Sidebar interno con navegación de aplicación.
- Header de página con `eyebrow`, `title` y `description`.
- Card de usuario autenticado.
- Botón de cierre de sesión.
- Menú móvil con estado `aria-expanded`.
- Scrim para cerrar navegación en mobile.

Links internos actuales:

```txt
Dashboard      -> /app
Proveedores    -> /app/proveedores
Solicitudes    -> /app/solicitudes
Cotizaciones   -> /app/cotizaciones
Pipelines      -> /app/pipelines
```

El logout llama al contexto de auth y luego navega al sitio público:

```txt
logout()
navigate('/', { replace: true })
```

### Autenticación Google OAuth

La autenticación se delega al backend Spring Boot. El frontend no maneja tokens directamente.

Archivos principales:

```txt
src/services/authService.js
src/context/AuthContext.jsx
src/components/auth/ProtectedRoute.jsx
src/pages/Login.jsx
```

Funciones actuales de `authService`:

```js
getGoogleLoginUrl()
getCurrentUser()
logout()
loginWithGoogle(locationObject = window.location, fallbackLocation = window.location)
```

Endpoints usados:

```txt
GET  /api/auth/me
POST /api/auth/logout
GET  /oauth2/authorization/google
```

La URL de Google OAuth se construye así:

```js
`${API_URL}/oauth2/authorization/google`
```

En producción, con `API_URL` vacío, la ruta resultante es:

```txt
/oauth2/authorization/google
```

Esa ruta same-origin la intercepta Vercel y la reenvía al backend Render.

### AuthContext

El contexto de autenticación vive en:

```txt
src/context/AuthContext.jsx
```

Expone:

```txt
user
loading
error
refreshUser
logout
```

Detalles importantes:

- `authenticated` se calcula con `Boolean(user)`.
- `refreshUser` llama `getCurrentUser()`.
- Si el backend responde 401/403, se considera usuario no autenticado.
- Si hay errores distintos de 401/403, se guardan en `error`.
- El logout limpia usuario aunque el request de logout falle.
- No se usa `localStorage`.
- No se usa `sessionStorage`.
- La sesión depende de cookies del backend con `credentials: 'include'`.

Se exportó `AuthContext` además del provider/hook para facilitar wrappers de tests sin mockear módulos.

### ProtectedRoute

El guard vive en:

```txt
src/components/auth/ProtectedRoute.jsx
```

Comportamiento:

- Mientras `loading` es true, muestra estado visual `Validando sesión` y `Conectando con NEXORA`.
- Si `authenticated` es false, redirige a `/login`.
- Si `authenticated` es true, renderiza `children`.

También conserva en `state.from` la ruta solicitada para poder volver después del login.

### Login Page

Archivo:

```txt
src/pages/Login.jsx
```

La pantalla muestra:

```txt
Ingresa a NEXORA
Continuar con Google
Acceso seguro
```

El botón de Google quedó corregido para no pasar el evento de React al servicio:

```jsx
<button
  className="login-page__google"
  type="button"
  onClick={() => onLoginWithGoogle()}
  disabled={loading}
>
  <span>G</span>
  {loading ? 'Validando sesión...' : 'Continuar con Google'}
</button>
```

Este cambio fue necesario porque antes estaba así:

```jsx
onClick={onLoginWithGoogle}
```

React pasaba el evento del click como primer argumento. Como `loginWithGoogle` aceptaba un `locationObject`, terminaba intentando modificar `event.href` en vez de `window.location.href`. El resultado era que el botón se veía, pero al hacer click no navegaba correctamente al flujo OAuth.

### Fix Defensivo en loginWithGoogle

Además del fix en `Login.jsx`, se reforzó `authService.loginWithGoogle` para evitar que el mismo bug vuelva a romper navegación si en el futuro alguien vuelve a pasar un evento accidentalmente.

Implementación actual:

```js
export function loginWithGoogle(locationObject = window.location, fallbackLocation = window.location) {
  const targetLocation = locationObject?.href === undefined ? fallbackLocation : locationObject
  targetLocation.href = getGoogleLoginUrl()
}
```

Comportamiento:

- Si recibe un objeto con `href`, lo usa como location destino.
- Si recibe un evento de React u otro objeto sin `href`, usa `window.location` como fallback.
- En tests se puede inyectar un `fallbackLocation` mockeado sin tocar `window.location`, porque en Chrome/Edge headless `window.location` no es configurable de forma segura.

### Configuración API Actual

Archivo:

```txt
src/config/api.js
```

La configuración actual permite URL base vacía:

```js
const RAW_API_URL = import.meta.env.VITE_API_URL ?? ''
const API_URL = RAW_API_URL.replace(/\/$/, '')

export const API_BASE_URL = API_URL
export { API_URL }
export default API_URL
```

Esto fue un cambio importante. Antes se usaba fallback directo a Render. Luego se cambió para que producción en Vercel use rutas relativas same-origin y delegue en `vercel.json`.

Resultado por entorno:

```txt
Desarrollo local con .env:
VITE_API_URL=http://localhost:8080

Producción en Vercel:
VITE_API_URL no configurada
API_URL = ''
Requests salen como /api/..., /oauth2/...
```

### Servicio API

Archivo:

```txt
src/services/api.js
```

Se exportó `apiRequest` para poder probarlo directamente.

Todas las llamadas usan:

```js
credentials: 'include'
```

Esto es crítico para sesiones/cookies del backend.

Comportamiento cubierto:

- Agrega `Accept: application/json`.
- Agrega `Content-Type: application/json` solo cuando hay body.
- Serializa POST/PUT con `JSON.stringify(data)`.
- Parse JSON solo cuando el response tiene content-type JSON.
- Devuelve `null` para respuestas exitosas sin JSON.
- Lanza errores con `status`, `path`, `errores` y `payload` cuando el backend responde error.
- Envuelve errores de red con contexto del endpoint.

### Proxy Same-Origin en Vercel

El proxy Vercel quedó configurado en:

```txt
vercel.json
```

Rewrites actuales:

```json
{
  "source": "/api/:path*",
  "destination": "https://nexora-backend-nb85.onrender.com/api/:path*"
}
```

```json
{
  "source": "/oauth2/:path*",
  "destination": "https://nexora-backend-nb85.onrender.com/oauth2/:path*"
}
```

```json
{
  "source": "/login/oauth2/:path*",
  "destination": "https://nexora-backend-nb85.onrender.com/login/oauth2/:path*"
}
```

```json
{
  "source": "/actuator/:path*",
  "destination": "https://nexora-backend-nb85.onrender.com/actuator/:path*"
}
```

```json
{
  "source": "/db-test",
  "destination": "https://nexora-backend-nb85.onrender.com/db-test"
}
```

El fallback SPA se mantiene al final:

```json
{
  "source": "/(.*)",
  "destination": "/index.html"
}
```

Orden importante:

- Los rewrites API/OAuth deben ir antes del fallback SPA.
- Si el fallback SPA estuviera primero, capturaría `/oauth2/...` y rompería OAuth.

Validación reportada:

```txt
https://nexora-fronted.vercel.app/api/health funciona
https://nexora-fronted.vercel.app/db-test funciona
```

### Variables de Entorno Actualizadas

Archivo:

```txt
.env.example
```

Ahora documenta dos escenarios:

```env
# Desarrollo local
VITE_API_URL=http://localhost:8080

# Producción en Vercel
# No configures VITE_API_URL para usar el proxy same-origin de vercel.json.
```

Regla actual:

- En local se puede usar `VITE_API_URL=http://localhost:8080`.
- En Vercel producción se recomienda no configurar `VITE_API_URL`.
- Vite inserta variables `VITE_*` en build time.
- Si se cambia, agrega o elimina `VITE_API_URL` en Vercel, hay que redeployar.

### README Actualizado

El README se actualizó para explicar:

- El login Google usa `/oauth2/authorization/google` same-origin.
- Vercel reenvía `/oauth2/**` al backend Render.
- Producción no debe configurar `VITE_API_URL` si se quiere usar proxy same-origin.
- Desarrollo local sí puede usar `VITE_API_URL=http://localhost:8080`.
- Backend Render debe configurar redirect URI de Google.
- Google Cloud Console debe tener URIs autorizadas para Vercel y Render.

Redirect URI recomendado para backend Render:

```env
GOOGLE_OAUTH_REDIRECT_URI=https://nexora-fronted.vercel.app/login/oauth2/code/google
```

URIs autorizadas en Google Cloud Console:

```txt
https://nexora-fronted.vercel.app/login/oauth2/code/google
https://nexora-backend-nb85.onrender.com/login/oauth2/code/google
```

### Favicon y Assets Públicos

Se configuró favicon usando:

```txt
public/assets/logo.webp
```

El objetivo fue evitar el favicon genérico de Vite y usar un asset propio de NEXORA.

También se mantiene el video hero:

```txt
public/assets/s4ngster-loop.mp4
public/assets/s4ngster-hero.webp
```

### Suite de Testing Unitario

Se agregó una suite de pruebas unitarias con Karma, Jasmine, Webpack/Babel y Testing Library.

Dependencias agregadas:

```txt
karma
karma-jasmine
jasmine-core
karma-chrome-launcher
karma-webpack
karma-babel-preprocessor
karma-jasmine-html-reporter
karma-coverage
babel-loader
@babel/core
@babel/preset-env
@babel/preset-react
style-loader
css-loader
@testing-library/react
@testing-library/jasmine-dom
```

Scripts agregados en `package.json`:

```json
"test": "karma start karma.conf.cjs --single-run",
"test:watch": "karma start"
```

Archivos de configuración agregados:

```txt
karma.conf.cjs
babel.config.cjs
src/test/setupTests.js
```

La configuración de Karma:

- Usa framework `jasmine`.
- Carga primero `src/test/setupTests.js`.
- Ejecuta specs desde `src/test/**/*.spec.jsx`.
- Usa webpack para JSX/CSS/assets.
- Define `import.meta.env.VITE_API_URL` como string vacío para simular producción same-origin.
- Usa `style-loader` y `css-loader` para imports CSS.
- Maneja assets `webp`, `png`, `jpg`, `gif`, `svg`, `mp4` como recursos.
- Configura plugins explícitos porque con pnpm Karma no siempre autodescubre plugins.
- Usa Edge como binario compatible cuando Chrome no está instalado en Windows.
- Incluye reporter `coverage` para que `coverageReporter` genere salida real.

Detalle del ajuste Edge/Chrome:

```js
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
if (!process.env.CHROME_BIN && existsSync(edgePath)) {
  process.env.CHROME_BIN = edgePath
}
```

Esto permite que `ChromeHeadless` use Edge headless en este entorno donde Chrome no está instalado.

### Coverage

Se activó coverage agregando `coverage` al array de reporters:

```js
reporters: ['progress', 'kjhtml', 'coverage']
```

El bloque `coverageReporter` ya existía:

```js
coverageReporter: {
  dir: 'coverage/',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' },
  ],
}
```

También se agregó `coverage` a `.gitignore` para no versionar reportes generados.

Además se agregó `coverage` a `globalIgnores` de ESLint:

```js
globalIgnores(['dist', 'coverage'])
```

### Setup de Tests

Archivo:

```txt
src/test/setupTests.js
```

Responsabilidades:

- Registrar matchers de `@testing-library/jasmine-dom`.
- Ejecutar `cleanup()` después de cada spec.

Se descubrió que los matchers de `jasmine-dom` no se podían usar de forma confiable en todos los specs por el orden de bundles de Karma/Webpack. Por eso muchos asserts DOM se dejaron con Jasmine nativo:

```js
expect(element).not.toBeNull()
expect(button.disabled).toBeFalse()
expect(link.getAttribute('href')).toBe('/login')
```

Esto hizo la suite más estable en Edge headless.

### Test Utils

Archivo:

```txt
src/test/testUtils.jsx
```

Helpers creados:

```js
authenticatedUser
authValue(overrides)
renderWithAuth(ui, options)
jsonResponse(payload, options)
```

Uso principal:

- Renderizar componentes con `AuthContext.Provider`.
- Renderizar con `MemoryRouter`.
- Mockear respuestas JSON de `fetch`.
- Evitar llamadas reales al backend.
- Evitar llamadas reales a Google.

### Tests de Servicios

Tests agregados:

```txt
src/test/services/apiConfig.spec.jsx
src/test/services/api.spec.jsx
src/test/services/authService.spec.jsx
src/test/services/proveedorService.spec.jsx
```

Cobertura funcional:

- `API_URL` puede ser string vacío para rewrites same-origin.
- `API_BASE_URL` no debe contener placeholders falsos.
- `apiPost` manda JSON con `credentials: 'include'`.
- `apiGet` no agrega `Content-Type` si no hay body.
- `apiDelete` soporta responses sin JSON.
- Errores backend se transforman en errores ricos.
- Errores de red se envuelven con contexto de endpoint.
- `getGoogleLoginUrl()` devuelve `/oauth2/authorization/google` cuando `API_URL` está vacío.
- `loginWithGoogle()` navega a `/oauth2/authorization/google`.
- `loginWithGoogle()` usa fallback si recibe un objeto sin `href`.
- `getCurrentUser()` llama `/api/auth/me` con cookies.
- `logout()` llama `/api/auth/logout` con método POST y cookies.
- `proveedorService` construye endpoints correctos para listar, crear, actualizar y eliminar.

### Tests de Rutas y Páginas

Tests agregados:

```txt
src/test/routes/ProtectedRoute.spec.jsx
src/test/pages/LoginPage.spec.jsx
src/test/pages/LandingPage.spec.jsx
src/test/pages/AppPages.spec.jsx
src/test/components/AppLayout.spec.jsx
```

Cobertura funcional:

- `ProtectedRoute` muestra loading mientras valida sesión.
- `ProtectedRoute` renderiza contenido si hay usuario autenticado.
- `ProtectedRoute` redirige a `/login` si no hay sesión.
- `Login` muestra textos principales y botón Google.
- `Login` deshabilita el botón mientras `loading` es true.
- `Login` redirige a `/app` o a `state.from.pathname` si ya hay sesión.
- `Login` llama `onLoginWithGoogle()` sin pasar el evento del click.
- `Landing` renderiza contenido público sin requerir autenticación.
- `Landing` manda CTA a `/login` si no hay sesión.
- `Landing` manda CTA a `/app` si hay sesión.
- `AppLayout` muestra usuario y email.
- `AppLayout` muestra links internos correctos.
- `AppLayout` actualiza `aria-expanded` del menú móvil.
- `AppLayout` ejecuta logout y navega al sitio público.
- Páginas privadas renderizan shell y contenido esperado.
- `Proveedores` renderiza proveedores devueltos por backend mockeado.

### Bug del Login Google

Bug reportado:

```txt
En /login el botón "Continuar con Google" se ve, pero al hacer click no navega.
```

Causa raíz:

```jsx
onClick={onLoginWithGoogle}
```

React ejecutaba el handler pasando el evento como primer argumento:

```txt
onLoginWithGoogle(event)
```

Pero `loginWithGoogle` esperaba opcionalmente un objeto tipo location:

```js
loginWithGoogle(locationObject = window.location)
```

Y luego hacía:

```js
locationObject.href = getGoogleLoginUrl()
```

Resultado:

```txt
Intentaba escribir event.href en vez de window.location.href.
```

Fix aplicado en `Login.jsx`:

```jsx
onClick={() => onLoginWithGoogle()}
```

Fix defensivo aplicado en `authService.js`:

```js
const targetLocation = locationObject?.href === undefined ? fallbackLocation : locationObject
targetLocation.href = getGoogleLoginUrl()
```

Test agregado en `LoginPage.spec.jsx`:

```js
expect(onLoginWithGoogle.calls.mostRecent().args).toEqual([])
```

Test agregado en `authService.spec.jsx`:

```js
loginWithGoogle({ currentTarget: {} }, windowLocation)
expect(windowLocation.href).toBe('/oauth2/authorization/google')
```

### Resultados de Validación

Durante esta fase se ejecutaron repetidamente:

```bash
pnpm test
pnpm build
pnpm lint
```

Resultados finales relevantes:

```txt
pnpm test -> 34 SUCCESS
pnpm build -> OK
pnpm lint -> OK en la fase de setup de tests
```

El último `pnpm test` después del fix de login Google ejecutó 34 specs correctamente.

El último `pnpm build` generó el bundle de producción correctamente con Vite.

### Estado Actual del Frontend Después de Esta Fase

Estado funcional:

- Landing pública operativa.
- Login Google visible y corregido para navegar.
- Proxy Vercel funcionando para `/api/health` y `/db-test`.
- Proxy Vercel preparado para `/oauth2/**` y `/login/oauth2/**`.
- Rutas internas protegidas por sesión.
- Servicios API usando cookies con `credentials: 'include'`.
- API base compatible con producción same-origin.
- CRUD proveedores preservado.
- Suite de tests unitarios agregada.
- Coverage reporter activado.
- Build de producción validado.

Estado de despliegue esperado:

```txt
Frontend Vercel:
https://nexora-fronted.vercel.app

Backend Render:
https://nexora-backend-nb85.onrender.com
```

Rutas de diagnóstico validadas por proxy:

```txt
https://nexora-fronted.vercel.app/api/health
https://nexora-fronted.vercel.app/db-test
```

Ruta OAuth esperada desde el botón Google:

```txt
https://nexora-fronted.vercel.app/oauth2/authorization/google
```

Esa ruta debe ser reenviada por Vercel hacia:

```txt
https://nexora-backend-nb85.onrender.com/oauth2/authorization/google
```

### Notas Técnicas Importantes Para Futuro

- No volver a cambiar el botón Google a `onClick={loginWithGoogle}`.
- Mantenerlo como `onClick={() => loginWithGoogle()}` o equivalente.
- No configurar `VITE_API_URL` en Vercel si se quiere usar proxy same-origin.
- Si se configura `VITE_API_URL` en Vercel, el bundle usará esa URL absoluta y se puede volver a problemas de CORS/cookies/OAuth.
- Mantener rewrites OAuth antes del fallback SPA en `vercel.json`.
- No commitear `coverage/`.
- No commitear `.env` real.
- No usar tokens en localStorage/sessionStorage.
- Para tests de navegación, no tocar directamente `window.location` si el navegador headless no lo permite.
- Preferir inyección de objetos `{ href: '' }` o fallback inyectable.

### Pendientes Naturales Después de Esta Fase

Posibles próximos pasos:

1. Verificar manualmente en Vercel que `/login` redirige al flujo real de Google.
2. Confirmar que Google Cloud Console tiene los redirect URIs correctos.
3. Confirmar que backend Render emite cookies compatibles con frontend Vercel.
4. Agregar pruebas para `AuthProvider` si se quiere cubrir retry 401/403.
5. Instrumentar coverage real de código fuente si se quiere porcentaje útil, no solo summary.
6. Agregar test de `vercel.json` o documentación automatizada para evitar romper el orden de rewrites.
7. Expandir tests de CRUD proveedores con create/edit/delete mockeados.
8. Agregar pruebas de accesibilidad básicas para login y navegación interna.
