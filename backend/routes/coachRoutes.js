import express from 'express';
import {
  getCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach,
} from '../controllers/coachController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCoaches)
  .post(protect, admin, createCoach);

router.route('/:id')
  .get(protect, getCoachById)
  .put(protect, updateCoach)
  .delete(protect, admin, deleteCoach);

export default router;
