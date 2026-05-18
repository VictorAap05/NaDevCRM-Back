import { Router } from 'express';
import { registrarUsuario, loginUsuario } from '../controllers/authController.js';
import { validacionesCrearUsuario, revisarErrores } from '../middlewares/validarUsuario.js';

const router = Router();

router.post('/login', loginUsuario);

export default router;