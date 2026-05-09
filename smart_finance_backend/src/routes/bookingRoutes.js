import express from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('consultant_id')
      .isInt({ min: 1 })
      .withMessage('Konsultan wajib dipilih.'),
    body('booking_date')
      .isDate()
      .withMessage('Format tanggal tidak valid (YYYY-MM-DD).'),
    body('booking_time')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Format waktu tidak valid (HH:MM).'),
    body('duration_minutes')
      .optional()
      .isInt({ min: 30, max: 180 })
      .withMessage('Durasi antara 30-180 menit.'),
    body('consultation_method')
      .optional()
      .isIn(['chat', 'video_meeting'])
      .withMessage('Metode konsultasi tidak valid.'),
    body('health_check_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID health check tidak valid.'),
    body('topic')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Topik maksimal 500 karakter.'),
  ],
  validate,
  createBooking,
);

router.get('/', getUserBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

export default router;
