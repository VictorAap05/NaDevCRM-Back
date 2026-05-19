import { Router } from 'express';
import { getAudit } from '../controllers/auditController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, getAudit);

export default router;