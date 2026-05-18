import { Router } from 'express';
import { getUsuarios, createUsuario } from '../controllers/usuarioController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

import { validacionesCrearUsuario, revisarErrores } from '../middlewares/validarUsuario.js';

const router = Router();

router.get('/', authMiddleware, getUsuarios);

router.post('/', 
    authMiddleware,            
    validacionesCrearUsuario,  
    revisarErrores,            
    createUsuario              
);

export default router;