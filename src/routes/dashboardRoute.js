import express from 'express';
import { 
    getAdminDashboardStats, 
    getJefeDashboardStats, 
    getResponsableDashboardStats 
} from '../controllers/dashboardController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/admin', authMiddleware, getAdminDashboardStats);
router.get('/jefe', authMiddleware, getJefeDashboardStats);
router.get('/responsable', authMiddleware, getResponsableDashboardStats);

export default router;