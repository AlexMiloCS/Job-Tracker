import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import CVController from '../controllers/CVController.js';

const router = express.Router();
const cvController = new CVController();

router.post('/upload-cv', requireAuth, upload.single('cv'), cvController.uploadCV);
router.delete('/remove-cv', requireAuth, cvController.removeCV);
router.post('/compile-cv', requireAuth, cvController.compileCV);
router.post('/rename-cv', requireAuth, cvController.renameCV);
router.get('/cv-file/:type', requireAuth, cvController.downloadCV);
router.get('/cv-file/:type/:filename', requireAuth, cvController.downloadCV);
router.post('/cv-data', requireAuth, cvController.saveCVData);
router.get('/cv-data', requireAuth, cvController.getCVData);
router.delete('/cv-data', requireAuth, cvController.clearCVData);

export default router;
