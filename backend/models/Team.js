import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  logo: {
    type: String, // Base64 data URL
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  },
  viceCaptain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  },
  lineup: {
    startingXI: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    }],
    substitutes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    }],
  },
}, {
  timestamps: true,
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
