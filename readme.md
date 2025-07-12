# Aplicación de Scores - Backend & Frontend

## 1. Descripción Breve del Proyecto

Este proyecto es una aplicación web simple que permite la autenticación de usuarios y la gestión de "scores" asociados a códigos únicos. La aplicación consta de un backend desarrollado con Node.js y Express, utilizando PostgreSQL como base de datos gestionada por Prisma ORM, y un frontend construido con React. El objetivo principal es ofrecer un sistema de inicio de sesión basado en RUT y una funcionalidad para obtener (o generar automáticamente si no existe) un score numérico para un código dado. Además, incluye capacidades de autorización basadas en roles para usuarios administradores.

## 2. Tecnologías Utilizadas y Por Qué se Eligieron

### Backend:
* **Node.js & Express:** Entorno de ejecución y framework web robusto para construir APIs RESTful de manera eficiente y escalable.
* **Prisma ORM:** ORM moderno y tipado que simplifica la interacción con la base de datos PostgreSQL, permitiendo definir el esquema de la base de datos en un archivo declarativo (`schema.prisma`) y generando un cliente ORM potente para las operaciones CRUD. Elegido por su facilidad de uso, seguridad de tipos y herramientas de migración.
* **PostgreSQL:** Base de datos relacional de código abierto, potente y confiable, ideal para aplicaciones que requieren integridad de datos y escalabilidad.
* **Bcrypt.js:** Librería para el hashing seguro de contraseñas. Es fundamental para la seguridad, ya que no almacena las contraseñas en texto plano.
* **JSON Web Token (JWT):** Estándar para la creación de tokens de acceso seguros que permiten la autenticación sin estado en APIs REST. Elegido por su simplicidad y amplio soporte en el ecosistema web.
* **CORS:** Middleware para Express que habilita Cross-Origin Resource Sharing, permitiendo que el frontend (en un dominio/puerto diferente) se comunique con el backend.
* **Dotenv:** Para cargar variables de entorno desde un archivo `.env`, manteniendo la configuración sensible fuera del código fuente versionado.
* **Crypto (Módulo de Node.js):** Utilizado para generar valores hash criptográficos, empleados en la función de generación de scores aleatorios deterministas.

### Frontend:
* **React:** Librería de JavaScript para construir interfaces de usuario interactivas y declarativas. Elegido por su popularidad, ecosistema robusto y la capacidad de crear componentes reutilizables.
* **npm:** Gestor de paquetes de Node.js para gestionar las dependencias del frontend.

## 3. Instrucciones de Instalación Paso a Paso

Sigue estos pasos para poner en marcha el proyecto en tu máquina.

### 3.1. Prerrequisitos

Asegúrate de tener instalado lo siguiente:

* **Node.js** (versión LTS recomendada)
* **npm** (viene con Node.js)
* **PostgreSQL** (Servidor de base de datos en ejecución)
* **DBeaver** (Opcional, pero recomendado para la gestión de la base de datos y la verificación)

### 3.2. Configuración de la Base de Datos (PostgreSQL)

Primero, necesitas crear la base de datos a la que se conectará el backend.

1.  **Inicia tu servidor PostgreSQL.**
2.  **Abre DBeaver** (o tu cliente PostgreSQL preferido).
3.  **Conéctate a tu servidor PostgreSQL** (por ejemplo, a la base de datos `postgres` por defecto, usando el usuario `postgres` y tu contraseña).
4.  **Crea una nueva base de datos:**
    * En el "Navegador de Bases de Datos" de DBeaver, haz clic derecho en la carpeta **"Databases" (Bases de Datos)** bajo tu conexión PostgreSQL.
    * Selecciona **"Create New Database" (Crear Nueva Base de Datos)**.
    * Nombra la nueva base de datos: `pruebayol1`.
    * Haz clic en "OK" o "Persist".
    * **Importante:** Si te indica que `pruebayol1` ya existe, pero no la ves, actualiza agresivamente DBeaver (haz clic derecho en tu conexión principal de PostgreSQL y selecciona "Refresh" o F5). Si aun así no la ves, crea una nueva conexión en DBeaver configurada para conectarse directamente a la base de datos `pruebayol1`.

### 3.3. Configuración del Backend

Navega a la carpeta `my-score-backend` en tu terminal.
cd tu-proyecto-principal/my-score-backend

### crea un archivo .env con estas var:
DATABASE_URL="postgresql://postgres:tu_contraseña_bd@localhost:5432/pruebayol1?schema=public"
JWT_SECRET="UNA_CLAVE_SECRETA_MUY_FUERTE_AQUI" # ¡CAMBIAR EN PRODUCCIÓN!

### instala las siguientes dependencias
npm install
npx prisma generate

### migra a la base de datos con
 npx prisma migrate dev --name initial_setup

### correr node server.js

### CONFIGURAR FRONT

cd tu-proyecto-principal/my-score-app
npm install
npm start

Decisiones Técnicas Importantes
RUT como Identificador Único: Se utiliza el RUT como identificador principal único para los usuarios en lugar de un nombre de usuario tradicional. Se asume que el RUT se almacena como una cadena de texto, sin un formato estricto (puntos o guiones) para simplificar la lógica de backend. La validación del formato del RUT se deja al frontend o a una capa de validación más avanzada.

Generación Determinística de Scores: Los scores que no existen se generan basándose en un hash SHA256 del código. Esto asegura que el mismo código siempre genere el mismo score, creando un comportamiento predecible y replicable sin necesidad de intervención manual o una fuente de aleatoriedad externa para cada nuevo score.

Separación de Rol de Usuario y Score: La aplicación maneja usuarios y scores como entidades separadas. Un score no está intrínsecamente ligado a un usuario específico en el modelo actual; cualquier usuario autenticado puede consultar cualquier código.

Middleware de Autenticación/Autorización: Se utilizan middlewares de Express para centralizar la lógica de verificación de tokens JWT y la validación de roles, manteniendo las rutas limpias y enfocadas en su lógica de negocio.

7. Problemas Conocidos o Limitaciones
Validación de RUT: El backend no realiza una validación estricta del formato del RUT (ej. dígito verificador, puntos, guiones). Asume que el RUT proporcionado es válido en formato de cadena.

Interfaz de Usuario Admin: La funcionalidad para que los administradores vean todos los scores solo está implementada en el backend (API). El frontend actual no tiene una interfaz de usuario dedicada para mostrar esta información; se requiere el uso de herramientas como curl o Postman para probarla.

Manejo de Errores Frontend: El manejo de errores en el frontend es básico; solo muestra un mensaje de error general.

Registro de Usuarios Frontend: Actualmente, el registro de usuarios solo se puede realizar a través de la API (por ejemplo, con curl o Postman), no hay una interfaz de usuario de registro en el frontend.

No se pudo conectar correctamente el backend con la base de datos, se perdio mucho tiempo debugeando este error, y al no solucionarlo fue imposible terminar de ejecutar correctamente el proyecto.
