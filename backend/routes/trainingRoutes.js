import express from 'express';
import {
  getTrainings,
  createTraining,
  updateTraining,
  recordAttendance,
  deleteTraining,
} from '../controllers/trainingController.js';
import { protect, coach } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTrainings)
  .post(protect, coach, createTraining);

router.route('/:id')
  .put(protect, coach, updateTraining)
  .delete(protect, coach, deleteTraining);

router.put('/:id/attendance', protect, coach, recordAttendance);

export default router;
