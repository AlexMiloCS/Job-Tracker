import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import GroqController from '../controllers/GroqController.js';

const router = express.Router();
const groqController = new GroqController();

router.post('/chat', requireAuth, groqController.chat);
router.post('/parse-job', requireAuth, groqController.parseJob);

export default router;
