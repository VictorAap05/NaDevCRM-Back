import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.on('connect', () => {
  console.log('Conexión exitosa a la base de datos');
});

// --- AGREGA ESTA PARTE AL FINAL ---
export default {
  query: (text, params) => pool.query(text, params),
};