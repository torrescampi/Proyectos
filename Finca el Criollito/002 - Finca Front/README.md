# Finca El Criollito - Sistema de Gestión Frontend

## Descripción

Frontend web para el sistema de gestión de inventario y ventas de Finca El Criollito. Desarrollado con HTML5, CSS3 y JavaScript, proporciona una interfaz moderna y responsive para interactuar con la API backend de Finca El Criollito.

## Características

### 🎯 Funcionalidades Principales
- **Gestión Completa de Productos**: CRUD de productos con validación en tiempo real
- **Sistema de Ventas**: Procesamiento de ventas individuales y múltiples
- **Control de Stock**: Validación automática de inventario
- **Historial de Ventas**: Consulta completa de transacciones
- **Reportes Automáticos**: Generación de reportes diarios en PDF
- **Contador de Ventas del Día**: Seguimiento en tiempo real de ingresos

### 🎨 Interfaz de Usuario
- **Diseño Responsive**: Adaptable a dispositivos móviles y tablets
- **Tema Verde Claro**: Colores suaves inspirados en naturaleza
- **Navegación por Pestañas**: Organización intuitiva de funcionalidades
- **Animaciones Suaves**: Transiciones y efectos visuales
- **Iconografía FontAwesome**: Iconos consistentes en toda la aplicación

### ⚡ Experiencia de Usuario
- **Búsqueda en Tiempo Real**: Filtrado instantáneo de productos
- **Scanner USB**: Compatibilidad con pistolas de código de barras
- **Validación en Tiempo Real**: Feedback inmediato de errores
- **Carga Asíncrona**: Sin recargas de página
- **Notificaciones**: Mensajes de confirmación y error

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Flexbox, Grid, Variables CSS, Animaciones
- **JavaScript ES6+**: Fetch API, Async/Await, DOM Manipulation
- **Bootstrap 5.1.3**: Componentes UI y sistema de grid
- **FontAwesome 6.0**: Iconografía
- **API REST**: Comunicación con backend Spring Boot

## Estructura del Proyecto

finca-frontend/
├── index.html # Página principal
├── css/
│ └── style.css # Estilos principales
├── js/
│ └── app.js # Lógica de la aplicación

## Configuración

### Requisitos Previos
- Servidor backend StockVenta ejecutándose en puerto 8080
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para CDN de Bootstrap y FontAwesome)

### URLs del Backend
```javascript
const API_URL = 'http://localhost:8080/api/productos';
const API_VENTAS_URL = 'http://localhost:8080/api/ventas';
```

### Ejecución
Asegurar que el backend esté ejecutándose

bash
# En el directorio del backend
mvn spring-boot:run
Servir el frontend

bash
# Opción 1: Servidor local (Python)
python -m http.server 5500

# Opción 2: Servidor local (Node.js)
npx http-server -p 5500

# Opción 3: Abrir directamente el archivo
# Navegar a index.html en el navegador
Acceder a la aplicación

text
http://localhost:5500
Estructura de la Interfaz
1. Header/Navbar
Logo y nombre: "Finca El Criollito"

Contador de ventas del día: Muestra ingresos acumulados

Fecha y hora actual: Actualización en tiempo real

2. Sistema de Pestañas
Venta: Interfaz principal de procesamiento de ventas

Productos: Gestión de inventario

Historial de Ventas: Consulta de transacciones

3. Pestaña de Venta
Panel Izquierdo - Productos Disponibles
Búsqueda por código: Campo con botón de búsqueda

Búsqueda por nombre: Filtrado en tiempo real

Tabla de productos: Código, nombre, precio, stock, cantidad, acciones

Controles de tabla: Contador y botón expandir/contraer

Panel Derecho - Productos Agregados
Lista de productos seleccionados

Controles de cantidad: Botones +/- y input numérico

Eliminación individual y limpieza total

Resumen de venta: Contador de productos y total a pagar

Botón "Confirmar Venta"

4. Pestaña de Productos
Formulario de Producto (Izquierda)
Campos: Código (con scanner), Nombre, Precio, Cantidad en stock

Botones: Guardar Producto, Cancelar

Tabla de Inventario (Derecha)
Columnas: ID, Código, Nombre, Precio, Stock, Acciones

Indicadores visuales de stock (rojo/amarillo/verde)

Acciones: Editar, Eliminar

5. Pestaña de Historial de Ventas
Tabla de ventas: ID, Fecha/Hora, Total, Productos

Botones: Actualizar, Generar Reporte PDF

Funcionalidades Detalladas
Gestión de Productos
Cargar, crear, editar y eliminar productos

Validación de campos obligatorios y formatos

Indicadores visuales de nivel de stock

Sistema de Ventas
Búsqueda por código o nombre

Selección múltiple de productos

Validación de stock en tiempo real

Cálculo automático de totales

Procesamiento de ventas individuales y múltiples

Carrito de Compras
Almacenamiento en memoria (productosVenta)

Modificación de cantidades con botones +/- o input directo

Eliminación individual o limpieza total

Validación de stock disponible

Scanner USB
Compatibilidad con pistolas de código de barras

Detección automática de código escaneado

Integración directa con el campo de búsqueda

Reportes y Estadísticas
Historial completo de ventas

Reporte diario en formato PDF

Cálculo automático de métricas y totales

Agrupación de productos vendidos

API Integration
Endpoints Utilizados
javascript
// Productos
GET    /api/productos                 // Listar todos
GET    /api/productos/{id}           // Obtener por ID
GET    /api/productos/codigo/{codigo} // Obtener por código
POST   /api/productos                 // Crear producto
PUT    /api/productos/{id}           // Actualizar producto
DELETE /api/productos/{id}           // Eliminar producto

// Ventas
GET    /api/ventas                   // Historial de ventas
POST   /api/productos/venta          // Procesar venta
POST   /api/productos/venta-multiple // Venta múltiple
Responsive Design
Breakpoints
> 1200px: Desktop completo

992px - 1200px: Desktop ajustado

768px - 992px: Tablet

576px - 768px: Móvil grande

< 576px: Móvil pequeño

Adaptaciones Móviles
Tablas convertidas a cards con datos apilados

Formularios en columna única

Botones con tamaños adaptados

Navegación simplificada y colapsable

Variables CSS Personalizadas
css
:root {
    --primary-color: #5a8c5a;      /* Verde principal */
    --secondary-color: #7ba87b;    /* Verde secundario */
    --accent-color: #a8c6a8;       /* Verde acento */
    --earth-color: #c4a582;        /* Color tierra */
    --sun-color: #f7d56e;          /* Color sol */
    --border-radius: 12px;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    --transition: all 0.3s ease;
}
Manejo de Estado
javascript
// Variables globales principales
let productosVenta = [];           // Carrito de compras
let todosLosProductos = [];        // Cache de productos
let ventaDia = 0;                 // Acumulado del día
let ultimaFecha = new Date().toDateString(); // Control cambio de día
Características Avanzadas
Contador de Venta del Día
Reinicio automático al cambio de día (00:00)

Cálculo en tiempo real de todas las ventas del día

Persistencia durante la sesión del usuario

Optimizaciones
Debouncing en búsquedas por nombre

Cache local de productos

Event delegation para elementos dinámicos

Lazy loading de contenido

Compatibilidad
Navegadores Soportados
✅ Chrome 90+

✅ Firefox 88+

✅ Safari 14+

✅ Edge 90+

Dispositivos
✅ Desktop (Windows, macOS, Linux)

✅ Tablet (iOS, Android)

✅ Móvil (iOS, Android)

Personalización
Modificación de Colores
Editar variables CSS en :root:

css
:root {
    --primary-color: #tu_color;
    --secondary-color: #tu_color;
    /* ... más variables */
}
Configuración de API
Modificar constantes en app.js:

javascript
const API_URL = 'http://tu-servidor:8080/api/productos';
Solución de Problemas
Problemas Comunes
Error de CORS: Verificar configuración en backend

Conexión rechazada: Asegurar que backend esté ejecutándose

Scanner no funciona: Verificar configuración de pistola USB

Estilos no cargan: Verificar conexión a CDN

Debugging
javascript
// Habilitar logs detallados
console.log('🔍 Debug:', variable);
// Verificar conexión API
fetch(API_URL).then(r => console.log('Status:', r.status));
Próximas Mejoras
Modo oscuro

Sincronización offline

Exportación a Excel

Gráficos de ventas

Múltiples usuarios

Backup automático
