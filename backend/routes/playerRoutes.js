import express from 'express';
import {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../controllers/playerController.js';
import { protect, coach, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPlayers)
  .post(protect, coach, createPlayer);

router.route('/:id')
  .get(protect, getPlayerById)
  .put(protect, updatePlayer)
  .delete(protect, admin, deletePlayer);

export default router;
