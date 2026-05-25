import express from 'express';
import { body, param } from 'express-validator';
import {
  adminLogin,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllBookingsAdmin,
  getPendingPayments,
  confirmPayment,
  rejectBooking,
  updateBookingStatus,
  sendZoomLink,
  getAllHealthChecks,
  getAllConsultantsAdmin,
  createConsultant,
  updateConsultant,
  deleteConsultant,
  getAdminStats,
  getRevenueSummary,
  getTransactions,
} from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

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
  adminLogin,
);

router.use(authenticateAdmin);

router.get('/stats', getAdminStats);

router.get('/users', getAllUsers);
router.get('/users/:id', param('id').isInt(), validate, getUserById);
router.patch('/users/:id', param('id').isInt(), validate, updateUser);
router.delete('/users/:id', param('id').isInt(), validate, deleteUser);

router.get('/bookings', getAllBookingsAdmin);
router.get('/bookings/pending-payments', getPendingPayments);
router.post(
  '/bookings/:id/confirm-payment',
  param('id').isInt(),
  validate,
  confirmPayment,
);
router.post(
  '/bookings/:id/reject',
  param('id').isInt(),
  validate,
  rejectBooking,
);
router.patch(
  '/bookings/:id/status',
  param('id').isInt(),
  validate,
  updateBookingStatus,
);
router.post('/bookings/:id/zoom', param('id').isInt(), validate, sendZoomLink);

router.get('/health-checks', getAllHealthChecks);

router.get('/revenue/summary', getRevenueSummary);
router.get('/transactions', getTransactions);

router.get('/consultants', getAllConsultantsAdmin);
router.post(
  '/consultants',
  [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi.'),
    body('specialization')
      .trim()
      .notEmpty()
      .withMessage('Spesialisasi wajib diisi.'),
    body('rate').isInt({ min: 0 }).withMessage('Rate harus berupa angka.'),
    body('experience_years')
      .isInt({ min: 0 })
      .withMessage('Pengalaman harus berupa angka.'),
  ],
  validate,
  createConsultant,
);
router.patch(
  '/consultants/:id',
  param('id').isInt(),
  validate,
  updateConsultant,
);
router.delete(
  '/consultants/:id',
  param('id').isInt(),
  validate,
  deleteConsultant,
);

export default router;
