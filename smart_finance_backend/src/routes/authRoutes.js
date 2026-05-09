import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Nama wajib diisi.')
      .isLength({ min: 2 })
      .withMessage('Nama minimal 2 karakter.'),
    body('email')
      .isEmail()
      .withMessage('Format email tidak valid.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password minimal 6 karakter.'),
    body('phone')
      .optional()
      .isMobilePhone('id-ID')
      .withMessage('Format nomor telepon tidak valid.'),
  ],
  validate,
  register,
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Format email tidak valid.')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password wajib diisi.'),
  ],
  validate,
  login,
);

router.get('/profile', authenticate, getMe);

router.patch(
  '/profile',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Nama minimal 2 karakter.'),
    body('phone')
      .optional()
      .isMobilePhone('id-ID')
      .withMessage('Format nomor telepon tidak valid.'),
    body('photo_url')
      .optional()
      .isURL()
      .withMessage('Format URL foto tidak valid.'),
  ],
  validate,
  updateProfile,
);

router.patch(
  '/change-password',
  authenticate,
  [
    body('old_password').notEmpty().withMessage('Password lama wajib diisi.'),
    body('new_password')
      .isLength({ min: 6 })
      .withMessage('Password baru minimal 6 karakter.'),
  ],
  validate,
  changePassword,
);

export default router;
