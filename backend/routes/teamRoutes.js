import express from 'express';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  updateTeamLineup,
} from '../controllers/teamController.js';
import { protect, coach, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTeams)
  .post(protect, admin, createTeam);

router.route('/:id')
  .get(protect, getTeamById)
  .put(protect, coach, updateTeam)
  .delete(protect, admin, deleteTeam);

router.put('/:id/lineup', protect, coach, updateTeamLineup);

export default router;
