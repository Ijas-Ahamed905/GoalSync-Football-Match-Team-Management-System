import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  fixtures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming',
  },
}, {
  timestamps: true,
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;
