import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import clienteRoutes from './src/routes/clienteRoute.js'; 
import usuariosRoutes from './src/routes/usuarioRoute.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Registro de rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes); 
app.use('/api/usuarios', usuariosRoutes); 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));