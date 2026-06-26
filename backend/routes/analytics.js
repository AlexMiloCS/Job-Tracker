import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import AnalyticsController from '../controllers/AnalyticsController.js';

const router = express.Router();
const analyticsController = new AnalyticsController();

router.get('/requirements', requireAuth, analyticsController.getRequirementsRadar);

export default router;
