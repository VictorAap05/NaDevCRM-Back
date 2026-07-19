import { Router } from 'express';
import {loginUsuario } from '../controllers/authController.js';

const router = Router();

router.post('/login', loginUsuario);

export default router;