import express from 'express';

import {
  getAllConsultants,
  getConsultantById,
} from '../controllers/consultantController.js';

import { getAvailableSlots } from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', getAllConsultants);

router.get('/:id', getConsultantById);

router.get('/:id/available-slots', getAvailableSlots);

export default router;
