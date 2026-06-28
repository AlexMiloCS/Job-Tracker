import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import UserController from '../controllers/UserController.js';

const router = express.Router();
const userController = new UserController();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.put('/profile', requireAuth, userController.updateProfile);
router.put('/password', requireAuth, userController.updatePassword);

export default router;
