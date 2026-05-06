import express from 'express';
import { register, login, getMe, uploadProfilePicture } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin, checkValidation } from '../validations/authValidators.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { upload } from '../middleware/upload.js';


const router = express.Router();

router.post('/register', authLimiter, validateRegister, checkValidation, register);
router.post('/login', authLimiter, validateLogin, checkValidation, login);
router.get('/me', protect, getMe);
router.post('/profile_upload', protect, upload.single('profile_picture'), uploadProfilePicture);

export default router;