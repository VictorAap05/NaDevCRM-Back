import express from 'express';
import { getOportunidades, createOportunidad } from '../controllers/oportunidadController.js';
import { validacionesCrearOportunidad, revisarErroresOportunidad } from '../middlewares/validarOportunidad.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/', getOportunidades); 

router.post(
    '/', 
   
    validacionesCrearOportunidad,
    revisarErroresOportunidad,   
    createOportunidad            
);

export default router;