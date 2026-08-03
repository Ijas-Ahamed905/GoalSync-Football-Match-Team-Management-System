import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load routes
import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import trainingRoutes from './routes/trainingRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Middlewares
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Parse requests - increased limits to accommodate base64 image strings
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Welcome root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to GoalSync MERN API' });
});

// Mounting routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/reports', reportRoutes);

// Fallback middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
