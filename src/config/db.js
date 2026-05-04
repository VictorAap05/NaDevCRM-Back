import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuración del pool de conexiones usando la URL de Supabase
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requerido para conexiones seguras con Supabase/Render
  }
});

pool.on('connect', () => {
  console.log('Conexión exitosa a la base de datos');
});