import express from 'express';
import { getInsights } from '../controllers/insightController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getInsights);

export default router;
