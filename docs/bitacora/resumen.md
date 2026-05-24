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
