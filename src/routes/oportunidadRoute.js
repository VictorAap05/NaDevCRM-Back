import express from 'express';
import {
    getOportunidades,
    getOportunidadById,
    createOportunidad,
    updateOportunidad
} from '../controllers/oportunidadController.js';
import {
    validacionesCrearOportunidad,
    validacionesActualizarOportunidad,
    revisarErroresOportunidad
} from '../middlewares/validarOportunidad.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { crearComentario, obtenerComentariosPorOportunidad } from '../controllers/comentarioController.js';

const router = express.Router();

router.get('/', authMiddleware, getOportunidades);

router.get('/:id', authMiddleware, getOportunidadById);

router.post(
    '/',
    authMiddleware,
    validacionesCrearOportunidad,
    revisarErroresOportunidad,
    createOportunidad
);

// Edición — el permiso se valida dentro del controlador (creador, resp. comercial, resp. técnico, o admin)
router.put(
    '/:id',
    authMiddleware,
    validacionesActualizarOportunidad,
    revisarErroresOportunidad,
    updateOportunidad
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