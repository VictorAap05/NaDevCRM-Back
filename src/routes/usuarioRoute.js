import { Router } from 'express';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../controllers/usuarioController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

import { validacionesCrearUsuario, validacionesActualizarUsuario, revisarErrores } from '../middlewares/validarUsuario.js';

const router = Router();

router.get('/', authMiddleware, getUsuarios);

router.post('/', 
    authMiddleware,            
    validacionesCrearUsuario,  
    revisarErrores,            
    createUsuario              
);

router.put('/:id', 
    authMiddleware, 
    validacionesActualizarUsuario, 
    revisarErrores, 
    updateUsuario
);

router.delete('/:id', 
    authMiddleware, 
    deleteUsuario
);

export default router;