# Finca El Criollito - Sistema de Gestión Backend

## Descripción

Esta es una aplicación backend desarrollada en Spring Boot para la gestión de inventario de productos y procesamiento de ventas. Proporciona una API RESTful completa para administrar productos, realizar ventas individuales y múltiples, y consultar el historial de ventas.

## Características

### 🛍️ Gestión de Productos
- **CRUD Completo**: Crear, leer, actualizar y eliminar productos
- **Búsqueda por ID y código único**
- **Validación de códigos duplicados**
- **Control de stock automático**

### 💰 Sistema de Ventas
- **Ventas Individuales**: Procesar venta de un solo producto
- **Ventas Múltiples**: Procesar ventas con múltiples productos en una sola transacción
- **Control de stock**: Validación automática de stock disponible
- **Cálculo automático** de subtotales y totales

### 📊 Reportes y Consultas
- **Historial completo de ventas**
- **Detalles de venta** con información de productos vendidos
- **Ordenamiento por fecha** (más recientes primero)

## Tecnologías Utilizadas

- **Java 17+**
- **Spring Boot 3.x**
- **Spring Data JPA**
- **MySQL Database**
- **Maven**
- **JPA/Hibernate**

## Estructura del Proyecto

src/main/java/com/fincajavier/stockventa/
├── config/
│ └── CorsConfig.java
├── controller/
│ ├── ProductoController.java
│ └── VentaController.java
├── dto/
│ ├── DetalleVentaDTO.java
│ ├── VentaDTO.java
│ ├── VentaRequest.java
│ └── VentaResponse.java
├── model/
│ ├── DetalleVenta.java
│ ├── Producto.java
│ └── Venta.java
├── repository/
│ ├── ProductoRepository.java
│ └── VentaRepository.java
├── service/
│ ├── ProductoService.java
│ └── VentaService.java
└── StockventaApplication.java

## Modelo de Datos

### Producto
- `id` (Long): Identificador único
- `codigo` (String): Código único del producto
- `nombre` (String): Nombre del producto
- `precio` (Double): Precio unitario
- `cantidad` (Integer): Stock disponible

### Venta
- `id` (Long): Identificador único
- `fechaVenta` (LocalDateTime): Fecha y hora de la venta
- `totalVenta` (Double): Total de la venta
- `detalles` (List<DetalleVenta>): Lista de productos vendidos

### DetalleVenta
- `id` (Long): Identificador único
- `venta` (Venta): Venta asociada
- `codigoProducto` (String): Código del producto vendido
- `nombreProducto` (String): Nombre del producto
- `cantidad` (Integer): Cantidad vendida
- `precioUnitario` (Double): Precio unitario al momento de la venta
- `subtotal` (Double): Subtotal (cantidad × precio unitario)

## API Endpoints

### Productos (/api/productos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/productos | Obtener todos los productos |
| GET | /api/productos/{id} | Obtener producto por ID |
| GET | /api/productos/codigo/{codigo} | Obtener producto por código |
| GET | /api/productos/existe/{codigo} | Verificar si existe producto por código |
| POST | /api/productos | Crear nuevo producto |
| PUT | /api/productos/{id} | Actualizar producto existente |
| DELETE | /api/productos/{id} | Eliminar producto |
| POST | /api/productos/venta | Procesar venta (individual o múltiple) |
| POST | /api/productos/venta-multiple | Procesar venta múltiple |

### Ventas (/api/ventas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/ventas | Obtener historial de todas las ventas |

## Configuración y Ejecución

### Prerrequisitos
- Java 17 o superior
- MySQL 8.0 o superior
- Maven 3.6+
- Python (posiblemente)

### Variables de Entorno
Configurar las siguientes variables de entorno:

# Configuración de Base de Datos
DB_URL=mysql://localhost:3306
DB_USER=tu_usuario
DB_PASS=tu_contraseña

### Ejecución

1. Clonar el proyecto
git clone [url-del-repositorio]
cd stockventa

2. Configurar la base de datos
# Crear base de datos manualmente o se creará automáticamente
mysql -u root -p
CREATE DATABASE stockventa;

3. Compilar y ejecutar
mvn clean install
mvn spring-boot:run

La aplicación estará disponible en: http://localhost:8080

## Configuración de CORS

La aplicación está configurada para aceptar peticiones desde:
- http://localhost:5500
- http://127.0.0.1:5500

## Características de Seguridad y Validación

- ✅ Validación de stock antes de procesar ventas
- ✅ Control de códigos de producto duplicados
- ✅ Manejo de transacciones para operaciones críticas
- ✅ Validación de existencia de productos
- ✅ Manejo de errores con respuestas apropiadas

## Base de Datos

El sistema utiliza MySQL y crea automáticamente las siguientes tablas:
- productos: Almacenamiento de información de productos
- ventas: Registro de ventas realizadas
- detalle_venta: Detalle de productos en cada venta

## Desarrollo Frontend

Para desarrollar un frontend, la aplicación acepta peticiones desde puerto 5500. Ejemplo de configuración para desarrollo:

const API_BASE_URL = 'http://localhost:8080/api';
