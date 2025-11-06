import { Router } from 'express';
import authController from '../controllers/authController.js';
import {authenticate} from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/register - Register a new user
router.post('/register', authController.register);

// POST /api/auth/login - Login user and return JWT token
router.post('/login', authController.login);

router.get('/user-info',authenticate,authController.userInfo); // Protect user info route
router.get('/user-info/:userId',authController.userInfoById); 

router.patch('/update',authenticate,authController.updateProfileController);
router.delete('/delete',authenticate,authController.deleteProfileController);

export default router;