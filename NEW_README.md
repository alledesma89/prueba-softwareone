# Gestión de Tareas - Angular App

Aplicación de gestión de tareas desarrollada con Angular 17+ y Material Design. Permite crear, editar, eliminar y visualizar tareas, con un dashboard que muestra estadísticas mediante gráficos. Este proyecto ha sido desarrollado siguiendo una serie de requisitos técnicos específicos, detallados a continuación.

## Características principales

- ✨ Interfaz moderna con Angular Material
- 📱 Diseño responsive
- 📊 Dashboard con gráficos estadísticos
- ⚡ Componentes standalone
- 🔄 Gestión de estado con RxJS
- 🎨 Tema personalizado y animaciones
- 🔐 Interceptores HTTP para autenticación y manejo de errores
- 🚀 Carga diferida (Lazy Loading) para optimización del rendimiento
- 📝 Formularios reactivos con validaciones síncronas y asíncronas
- 🛡️ Manejo global de errores y servicio de logging
- 🧪 Cobertura de tests unitarios para componentes y servicios
- 🍪 Gestión de cookies y almacenamiento local
- 🌐 Consumo de APIs públicas con operaciones CRUD, paginación y filtrado
- ⚙️ Optimización de la detección de cambios con estrategia OnPush y TrackBy
- 🌐 PWA (Progressive Web App) con Service Worker y Web App Manifest

## Instalación y ejecución

### Requisitos previos
- Node.js 18+
- npm 9+
- Angular CLI 17+

### Pasos de instalación

1.  Clonar el repositorio:
    ```bash
    git clone https://github.com/alledesma89/prueba-softwareone/
    cd prueba-softwareone
    ```

2.  Instalar dependencias:
    ```bash
    npm install
    ```

3.  Iniciar la aplicación:
    ```bash
    # Terminal 1: Servidor de desarrollo
    ng serve

    # Terminal 2: API mock (opcional, para persistencia)
    npm run serve:mock
    ```

4.  Abrir el navegador en `http://localhost:4200` 
ng serve

## Estructura del proyecto

```
src/
├── app/
│   ├── core/              # Servicios, interceptores, modelos
│   ├── features/          # Módulos funcionales (dashboard, home, tasks)
│   │   ├── dashboard/     # Dashboard con gráficos
│   │   └── tasks/        # Gestión de tareas (listado, formulario)
│   └── shared/           # Componentes, directivas, pipes, validadores compartidos
│   └── standalone/       # Componentes standalone (loading-spinner, task-quick-view)
```

## Capturas de pantalla

Las capturas de pantalla se encuentran en `public/screenshoots/` y muestran la interfaz de usuario de la aplicación.

## Tecnologías utilizadas

- Angular 17
- Angular Material
- RxJS
- Chart.js
- TypeScript
- SCSS

## Decisiones Técnicas Clave y Cumplimiento de Requisitos

A continuación, se detalla cómo se han abordado los requisitos técnicos del proyecto, incluyendo el estado de cumplimiento:

### 1. 🧩 Componentes y Módulos

*   **Crea una aplicación Angular que tenga al menos tres componentes diferentes organizados en módulos siguiendo la arquitectura feature-based.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** La aplicación está organizada en módulos de características (`dashboard`, `home`, `tasks`) dentro de `src/app/features/`, cada uno con sus propios componentes, siguiendo una arquitectura modular clara.
*   **Implementa comunicación entre componentes usando:**
    *   **Input/Output properties:**
        *   **Estado:** ✅ **CUMPLIDO**
        *   **Detalle:** Se demuestra la comunicación a través de `@Input()` y `@Output()` en componentes como `AlertComponent` (utilizado en `TaskListComponent`) para pasar datos y emitir eventos.
    *   **Services con observables:**
        *   **Estado:** ✅ **CUMPLIDO**
        *   **Detalle:** La comunicación entre componentes y la capa de datos se realiza extensivamente mediante servicios que exponen `Observable`s, como `TaskService` para la gestión de tareas.
    *   **ViewChild/ViewChildren (al menos un caso):**
        *   **Estado:** ✅ **CUMPLIDO**
        *   **Detalle:** En `TaskListComponent`, se utiliza `@ViewChild` para acceder a instancias de `MatPaginator`, `MatSort` y un elemento de búsqueda (`searchInput`), permitiendo la interacción directa con estos elementos del DOM.

### 2. ⚡ Lazy Loading

*   **Implementa lazy loading para al menos dos módulos de manera diferida.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** Los módulos `DashboardModule` y `TasksModule` se cargan de forma diferida utilizando `loadChildren` en la configuración de rutas (`app.routes.ts` y `app-routing.module.ts`). El componente `HomeComponent` también se carga de forma diferida con `loadComponent`.
*   **Configura preloading strategy para optimizar la carga.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** Se ha configurado `PreloadAllModules` como estrategia de precarga en `app-routing.module.ts`, lo que permite cargar módulos de forma asíncrona en segundo plano después de que la aplicación inicial se haya cargado.

### 3. 🔐 Interceptors

*   **AuthInterceptor: Añade token de autenticación a solicitudes protegidas.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** Se ha implementado `AuthInterceptor` en `src/app/core/interceptors/auth.interceptor.ts`. Este interceptor, en conjunto con un `AuthService` (placeholder), añade automáticamente un encabezado `Authorization` con un token (simulado) a las solicitudes HTTP salientes. Está registrado globalmente en `app.config.ts`.
*   **ErrorInterceptor: Maneja errores HTTP globalmente y redirige según el código de error.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** `ErrorInterceptor` en `src/app/core/interceptors/error.interceptor.ts` intercepta las respuestas HTTP con errores, permitiendo un manejo centralizado de los mismos.

### 4. 🔄 Change Detection

*   **Configura al menos un componente con OnPush strategy.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** `TaskListComponent` está configurado con `ChangeDetectionStrategy.OnPush` para optimizar el rendimiento de la detección de cambios.
*   **Demuestra el uso adecuado de ChangeDetectorRef.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** En `TaskListComponent`, se inyecta `ChangeDetectorRef` y se utiliza `this.cdr.markForCheck()` después de operaciones asíncronas (como la eliminación de tareas o la exportación) para asegurar que la vista se actualice correctamente bajo la estrategia `OnPush`.
*   **Implementa TrackBy functions en listas para optimizar rendimiento.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** La función `trackByTaskId` se ha implementado y se utiliza en la directiva `*matRowDef` de la tabla de tareas en `TaskListComponent` para mejorar el rendimiento al renderizar listas grandes.

### 5. 🆓 Componentes Standalone

*   **Crea al menos dos componentes standalone:**
    *   **Un componente de utilidad (ej: loading spinner, alert).**
        *   **Estado:** ✅ **CUMPLIDO**
        *   **Detalle:** `LoadingSpinnerComponent` (en `src/app/standalone/loading-spinner`) y `AlertComponent` (en `src/app/shared/components/alert`) son componentes standalone de utilidad.
    *   **Un componente de negocio que consuma un service.**
        *   **Estado:** ✅ **CUMPLIDO**
        *   **Detalle:** `TaskQuickViewComponent` (en `src/app/standalone/task-quick-view`) es un componente standalone que inyecta y utiliza `TaskService` para mostrar detalles de una tarea.

### 6. 🌐 Llamada a APIs Públicas

*   **Utiliza JSONPlaceholder API (https://jsonplaceholder.typicode.com/).**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** `TaskService` utiliza `https://jsonplaceholder.typicode.com/posts` como endpoint principal para la gestión de tareas.
*   **Implementa operaciones CRUD (Create, Read, Update, Delete).**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** `TaskService` implementa métodos para `getTasks` (Read), `getTaskById` (Read), `createTask` (Create), `updateTask` (Update), `patchTask` (Update parcial) y `deleteTask` (Delete).
*   **Maneja estados de loading, error y success.**
    *   **Estado:** ✅ **CUMPLIDO (Parcialmente)**
    *   **Detalle:** `TaskService` incluye un método `handleError` para la gestión de errores HTTP. Componentes como `TaskQuickViewComponent` y `TaskListComponent` gestionan estados de carga (`isLoading`) y muestran mensajes de error. El estado de éxito se maneja implícitamente tras la finalización de las operaciones.
*   **Implementa paginación o filtrado.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** `TaskService.getTasks` acepta un objeto `TaskFilters` para aplicar filtros a las solicitudes. `TaskListComponent` implementa paginación y filtrado por estado, prioridad, fecha y búsqueda de texto.

### 7. 🍪 Gestión de Cookies y Almacenamiento Local

*   **Implementa un service que gestione: Cookies, LocalStorage, SessionStorage. Incluye métodos para setear, obtener y limpiar datos.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** `StorageService` (en `src/app/core/services/storage.service.ts`) proporciona métodos para interactuar con `localStorage`, `sessionStorage` y `document.cookie`, incluyendo operaciones de `set`, `get`, `remove` y `clear` para cada tipo de almacenamiento.
    *   **Observación Importante:** Aunque la funcionalidad de gestión de almacenamiento está implementada, la aplicación **no incluye una interfaz de usuario para solicitar el consentimiento explícito del usuario** para el uso de cookies o almacenamiento local. Esto podría ser un requisito legal en ciertas jurisdicciones (como GDPR) y debería considerarse para futuras mejoras si la aplicación es de cara al público.

### 8. 📝 Reactive Forms y Validaciones

*   **Crea al menos un formulario reactivo con validaciones síncronas y asíncronas.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** `TaskFormComponent` (en `src/app/features/tasks/components/task-form`) implementa un formulario reactivo (`FormGroup`) para la creación y edición de tareas. Incluye validadores síncronos (`Validators.required`, `Validators.minLength`) y un validador asíncrono (`titleUniqueValidator`).
*   **Implementa validadores personalizados.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** Se utiliza un validador personalizado asíncrono (`titleUniqueValidator`) para asegurar la unicidad del título de la tarea.
*   **Maneja errores de validación de forma user-friendly.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** La plantilla de `TaskFormComponent` utiliza `<mat-error>` para mostrar mensajes de error de validación claros y contextuales al usuario.

### 9. 🛡️ Error Handling y Logging

*   **Implementa un ErrorHandler global personalizado.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** `GlobalErrorHandler` (en `src/app/core/services/global-error-handler.ts`) implementa la interfaz `ErrorHandler` de Angular, proporcionando un mecanismo centralizado para capturar y procesar errores de tiempo de ejecución en toda la aplicación.
*   **Crea un service de logging que registre errores y eventos importantes.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** `LoggingService` (en `src/app/core/services/logging.service.ts`) ofrece métodos para registrar errores (`logError`), eventos (`logEvent`) y advertencias (`logWarning`), con la capacidad de enviar estos logs a un endpoint remoto (simulado).
*   **Maneja diferentes tipos de errores (HTTP, validación, runtime).**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** Los errores HTTP son gestionados por `ErrorInterceptor`, los errores de validación por los formularios reactivos y los errores de tiempo de ejecución por `GlobalErrorHandler`.

### 10. 🧪 Testing Unitario

*   **Escribe tests unitarios para al menos 2 components y 1 service.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** Se han implementado tests unitarios para `TaskListComponent`, `StorageService` y `ErrorInterceptor`, cubriendo los requisitos de componentes y servicios.
*   **Utiliza mocks y spies apropiadamente.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** Los tests hacen uso de `jasmine.createSpyObj` y `spyOn` para simular dependencias y controlar el comportamiento de funciones externas, asegurando un aislamiento adecuado para las pruebas unitarias.
*   **Alcanza un buen nivel de cobertura en los archivos testeados.**
    *   **Estado:** 🟡 **PENDIENTE DE VERIFICAR**
    *   **Detalle:** La verificación de la cobertura de código requiere la ejecución de las pruebas y la revisión del informe generado, lo cual no se puede realizar en este entorno.

### 11. 🚀 PWA - BONUS (Opcional)

*   **Service Worker para cache offline.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** La aplicación está configurada para utilizar un Service Worker (`ngsw-worker.js`) a través de `provideServiceWorker` en `app.config.ts`, lo que permite el almacenamiento en caché de recursos y la funcionalidad offline.
*   **Web App Manifest.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** Se incluye un `manifest.webmanifest` en la raíz del proyecto, proporcionando metadatos para la instalación de la PWA.
*   **Notificaciones push (simuladas).**
    *   **Estado:** 🟡 **PENDIENTE DE VERIFICAR**
    *   **Detalle:** No se encontró evidencia directa de la implementación de notificaciones push simuladas.
*   **Funcionalidad offline básica.**
    *   **Estado:** ✅ **CUMPLIDO**
    *   **Detalle:** La configuración del Service Worker proporciona la base para una funcionalidad offline, permitiendo que la aplicación funcione sin conexión a internet para los recursos cacheados.

## Reporte de Cobertura

El proyecto está configurado para generar reportes de cobertura de código utilizando Karma y `karma-coverage`. Para generar el reporte, ejecuta el siguiente comando:

```bash
ng test --no-watch --code-coverage
```

Una vez finalizada la ejecución de las pruebas, el reporte de cobertura se encontrará en la carpeta `coverage/` en la raíz del proyecto. Puedes abrir `coverage/<project-name>/index.html` en tu navegador para visualizar el reporte detallado.

## Mejoras futuras

-   Implementar autenticación completa con un backend real.
-   Añadir filtros avanzados y búsqueda más potente.
-   Exportación de datos en otros formatos.
-   Notificaciones push reales.
-   Sincronización en tiempo real de tareas.
-   Integración con calendarios externos.
-   Más tipos de visualizaciones y reportes en el dashboard.
-   Personalización de temas por parte del usuario.
-   Implementar una interfaz de usuario para el consentimiento de cookies/almacenamiento local.
