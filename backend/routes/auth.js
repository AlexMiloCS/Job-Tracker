import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import AuthController from '../controllers/AuthController.js';

const router = express.Router();
const authController = new AuthController();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.put('/profile', requireAuth, authController.updateProfile);
router.post('/upload-cv', requireAuth, upload.single('cv'), authController.uploadCV);
router.delete('/remove-cv', requireAuth, authController.removeCV);
router.post('/compile-cv', requireAuth, authController.compileCV);
router.post('/rename-cv', requireAuth, authController.renameCV);
router.get('/cv-file/:type', requireAuth, authController.downloadCV);
router.get('/cv-file/:type/:filename', requireAuth, authController.downloadCV);
router.post('/cv-data', requireAuth, authController.saveCVData);
router.get('/cv-data', requireAuth, authController.getCVData);
router.delete('/cv-data', requireAuth, authController.clearCVData);
router.put('/password', requireAuth, authController.updatePassword);

export default router;
