import express from 'express';
import { getAreas, createArea } from '../controllers/areaController.js';
import { validacionesCrearArea, revisarErroresArea } from '../middlewares/validarArea.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAreas); 
router.post(
    '/', 
    validacionesCrearArea, 
    revisarErroresArea,    
    createArea             
);

export default router;