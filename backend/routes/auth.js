import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import AuthController from '../controllers/AuthController.js';

const router = express.Router();
const authController = new AuthController();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.put('/profile', requireAuth, authController.updateProfile);
router.put('/password', requireAuth, authController.updatePassword);

export default router;
