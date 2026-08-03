import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow players who are not users yet (or don't have emails)
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  photo: {
    type: String, // Base64 data URL
  },
  position: {
    type: String,
    enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Unknown'],
    default: 'Unknown',
  },
  dateOfBirth: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Active', 'Injured', 'Suspended'],
    default: 'Active',
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  jerseyNumber: {
    type: Number,
  },
  stats: {
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

const Player = mongoose.model('Player', playerSchema);

export default Player;
