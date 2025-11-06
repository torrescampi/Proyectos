README.txt
===========

Conjunto de Proyectos Full Stack - Java / Spring Boot / MySQL / JWT + HTML5 / JavaScript / CSS

Descripción General:

Este repositorio contiene un conjunto de proyectos full stack desarrollados con:

Backend: Java + Spring Boot, utilizando Maven como sistema de construcción, MySQL como base de datos relacional, y autenticación basada en tokens JWT.

Frontend: HTML5, JavaScript vanilla y CSS para interfaces web responsivas que se conectan a los APIs del backend.

Todos los proyectos están organizados en subcarpetas dentro del mismo repositorio y versionados con Git.

Tecnologías Utilizadas:

Backend:
Java 17 o superior

Spring Boot 3.x

Maven

MySQL 8.x

JWT (Json Web Token)

Frontend:
HTML5

JavaScript (ES6+)

CSS3

Fetch API para consumo de servicios REST

Control de Versiones:
Git

Requisitos Previos:

Para Backend:
Java JDK 17+

Maven

Servidor MySQL activo

Para Frontend:
Servidor web (puede usarse el servidor integrado de Spring Boot o cualquier servidor estático)

Navegador web moderno

IDE recomendado:
IntelliJ IDEA (Backend)

VS Code (Frontend)

Estructura de Proyectos:

Los proyectos siguen una estructura modular:

text
proyecto-ejemplo/
├── backend/          # Código Spring Boot + Java
├── frontend/         # Archivos HTML, JS, CSS
└── README.md         # Documentación específica del proyecto
Pasos para Ejecutar un Proyecto:

Opción 1: Ejecutar Solo Backend
Clonar el repositorio:

bash
git clone https://github.com/torrescampi/proyectos.git
Ingresar a la carpeta del backend del proyecto:

bash
cd proyecto-usuarios/backend
Configurar application.properties con los datos de tu base de datos MySQL.

Ejecutar el proyecto con Maven:

bash
mvn spring-boot:run
Opción 2: Ejecutar Frontend con Backend
Seguir los pasos de la Opción 1 para ejecutar el backend.

En otra terminal, ingresar a la carpeta frontend:

bash
cd proyecto-usuarios/frontend
Servir los archivos estáticos:

Opción A: Usar un servidor web simple de Python:

bash
python -m http.server 8080
Opción B: Usar Live Server en VS Code

Opción C: Colocar los archivos frontend en src/main/resources/static de Spring Boot

Acceder a la aplicación desde el navegador: http://localhost:8080

Características de los Proyectos Frontend:
Interfaz responsive y moderna

Consumo de APIs REST mediante Fetch API

Manejo de autenticación JWT

Gestión de estados de la aplicación

Validación de formularios en cliente

Manejo de errores y loading states

Autor:

Estanislao Torres Campi
Desarrollador Full Stack - Java / Spring Boot / JavaScript
Contacto: estanislaotorres@gmail.com

Repositorio:

https://github.com/torrescampi/Proyectos

Nota: Cada proyecto contiene su propia documentación detallada en su respectiva carpeta, incluyendo endpoints disponibles, estructura de base de datos, y guías de configuración específicas.
