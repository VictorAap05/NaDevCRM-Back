import express from 'express';
import { getOportunidades, createOportunidad } from '../controllers/oportunidadController.js';
import { validacionesCrearOportunidad, revisarErroresOportunidad } from '../middlewares/validarOportunidad.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { crearComentario, obtenerComentariosPorOportunidad } from '../controllers/comentarioController.js';

const router = express.Router();


router.get('/', getOportunidades); 

router.post(
    '/', 
    authMiddleware,
    validacionesCrearOportunidad,
    revisarErroresOportunidad,   
    createOportunidad            
);

router.post(
    '/:id/comentarios', 
    authMiddleware, 
    crearComentario
);

router.get('/:id/comentarios', 
    authMiddleware, 
    obtenerComentariosPorOportunidad
);

export default router;