import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import clienteRoutes from './src/routes/clienteRoute.js'; 
import usuariosRoutes from './src/routes/usuarioRoute.js';
import auditRoutes from './src/routes/auditRoute.js';
import oportunidadRoutes from './src/routes/oportunidadRoute.js';
import areaRoutes from './src/routes/areaRoute.js'; 
import dashboardRoutes from './src/routes/dashboardRoute.js';

dotenv.config();
const app = express();
app.disable('x-powered-by');

const corsOptions = {
    origin: process.env.FRONTEND_URL, 
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'],   
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes); 
app.use('/api/usuarios', usuariosRoutes); 
app.use('/api/audit', auditRoutes); 
app.use('/api/oportunidades', oportunidadRoutes); 
app.use('/api/areas', areaRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));