import express from 'express';
import {
  getDashboardSummary,
  getPlayerReport,
  getTeamReport,
  getMatchReport,
  getTournamentReport,
  getAttendanceReport,
  getGoalScorerReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardSummary);
router.get('/players', protect, getPlayerReport);
router.get('/teams', protect, getTeamReport);
router.get('/matches', protect, getMatchReport);
router.get('/tournaments', protect, getTournamentReport);
router.get('/attendance', protect, getAttendanceReport);
router.get('/goals', protect, getGoalScorerReport);

export default router;
