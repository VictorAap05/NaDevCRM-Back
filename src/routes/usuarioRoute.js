import { Router } from 'express';
import { getUsuarios, createUsuario } from '../controllers/usuarioController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, getUsuarios);
router.post('/', authMiddleware, createUsuario);

export default router;