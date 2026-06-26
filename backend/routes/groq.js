import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import GroqController from '../controllers/GroqController.js';

const router = express.Router();
const groqController = new GroqController();

router.post('/chat', requireAuth, groqController.chat);
router.post('/parse-job', requireAuth, groqController.parseJob);
router.post('/parse-cv-upload', requireAuth, upload.single('cvPdf'), groqController.parseCvUpload);

export default router;
