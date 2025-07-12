// src/config/index.ts
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde .env

export const PORT = process.env.PORT || 3000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// Puedes añadir más configuraciones aquí