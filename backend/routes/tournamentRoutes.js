import express from 'express';
import {
  getTournaments,
  createTournament,
  registerTeams,
  generateFixtures,
  declareWinner,
} from '../controllers/tournamentController.js';
import { protect, coach } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTournaments)
  .post(protect, coach, createTournament);

router.put('/:id/register', protect, coach, registerTeams);
router.post('/:id/fixtures', protect, coach, generateFixtures);
router.put('/:id/winner', protect, coach, declareWinner);

export default router;
