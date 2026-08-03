import express from 'express';
import {
  getNews,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController.js';
import { protect, coach } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getNews)
  .post(protect, coach, createNews);

router.route('/:id')
  .put(protect, coach, updateNews)
  .delete(protect, coach, deleteNews);

export default router;
