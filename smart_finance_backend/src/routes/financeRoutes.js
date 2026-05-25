import express from 'express';
import {
  getAkumulasiBulanan,
  saveDailyLog,
} from '../controllers/akumulasiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/akumulasi-bulanan', authenticate, getAkumulasiBulanan);
router.post('/daily-log', authenticate, saveDailyLog);

export default router;
