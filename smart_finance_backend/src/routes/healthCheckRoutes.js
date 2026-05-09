import express from 'express';
import { body } from 'express-validator';
import {
  createHealthCheck,
  getHealthCheckHistory,
  getHealthCheckById,
  simulateHealthCheck,
} from '../controllers/healthCheckController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

const healthCheckValidation = [
  body('monthly_income')
    .isInt({ min: 1 })
    .withMessage('Pemasukan bulanan wajib diisi dan harus lebih dari 0.'),
  body('monthly_expenses')
    .isInt({ min: 0 })
    .withMessage('Pengeluaran bulanan wajib diisi.'),
  body('monthly_debt_payment')
    .isInt({ min: 0 })
    .withMessage('Cicilan utang bulanan wajib diisi.'),
  body('emergency_fund')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Dana darurat tidak boleh negatif.'),
  body('total_debt')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total utang tidak boleh negatif.'),
];

router.post('/simulate', healthCheckValidation, validate, simulateHealthCheck);
router.post(
  '/',
  authenticate,
  healthCheckValidation,
  validate,
  createHealthCheck,
);
router.get('/history', authenticate, getHealthCheckHistory);
router.get('/:id', authenticate, getHealthCheckById);

export default router;
