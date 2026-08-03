import express from 'express';
import {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  updateMatchResult,
  deleteMatch,
  updateMatchTimer,
} from '../controllers/matchController.js';
import { protect, coach, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getMatches)
  .post(protect, coach, createMatch);

router.route('/:id')
  .get(protect, getMatchById)
  .put(protect, coach, updateMatch)
  .delete(protect, admin, deleteMatch);

router.put('/:id/result', protect, coach, updateMatchResult);
router.put('/:id/timer', protect, coach, updateMatchTimer);

export default router;
