import { Router } from 'express';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../controllers/clienteController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validacionesCrearCliente, validacionesActualizarCliente } from '../middlewares/validarCliente.js';
import { revisarErrores } from '../middlewares/validarUsuario.js';

const router = Router();

router.get('/', authMiddleware, getClientes);

router.post('/',
    authMiddleware,
    validacionesCrearCliente,
    revisarErrores,
    createCliente
);

router.put('/:id',
    authMiddleware,
    validacionesActualizarCliente,
    revisarErrores,
    updateCliente
);

router.delete('/:id',
    authMiddleware,
    deleteCliente
);

export default router;