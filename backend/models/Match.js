import mongoose from 'mongoose';

const matchEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Goal', 'Assist', 'YellowCard', 'RedCard', 'Substitution'],
    required: true,
  },
  minute: {
    type: Number,
    required: true,
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  },
  playerOut: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  },
  playerIn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  },
  detail: {
    type: String,
  },
});

const matchSchema = new mongoose.Schema({
  opponentName: {
    type: String,
    default: '',
  },
  homeTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  awayTeamName: {
    type: String,
    default: 'Opponent Team',
  },
  awayTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team', // Optional, if internal derby match
  },
  dateTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
  },
  score: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 },
  },
  events: [matchEventSchema],
  timerStartedAt: {
    type: Date,
  },
  elapsedSeconds: {
    type: Number,
    default: 0,
  },
  isTimerRunning: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Match = mongoose.model('Match', matchSchema);

export default Match;
