import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import clienteRoutes from './src/routes/clienteRoute.js'; 
import usuariosRoutes from './src/routes/usuarioRoute.js';
import auditRoutes from './src/routes/auditRoute.js';

dotenv.config();
const app = express();


const corsOptions = {
    origin: process.env.FRONTEND_URL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'],    // Cabeceras permitidas
};
app.use(cors(corsOptions));
app.use(express.json());

// Registro de rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes); 
app.use('/api/usuarios', usuariosRoutes); 
app.use('/api/audit', auditRoutes); 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));