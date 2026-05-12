import { Router } from 'express';
import { getClientes, createCliente } from '../controllers/clienteController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// El '/' aquí significa que la ruta será exactamente http://localhost:3000/api/clientes
router.get('/', authMiddleware, getClientes);
router.post('/', authMiddleware, createCliente);

export default router;