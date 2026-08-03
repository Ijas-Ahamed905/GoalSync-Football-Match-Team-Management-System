import mongoose from 'mongoose';

const coachSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  specialty: {
    type: String,
    default: 'General',
  },
  experience: {
    type: Number,
    default: 0,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  photo: {
    type: String, // Base64 data URL
  },
}, {
  timestamps: true,
});

const Coach = mongoose.model('Coach', coachSchema);

export default Coach;
