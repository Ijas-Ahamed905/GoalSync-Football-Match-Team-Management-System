import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Excused'],
    default: 'Present',
  },
});

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 90,
  },
  playersAttended: [attendanceSchema],
}, {
  timestamps: true,
});

const Training = mongoose.model('Training', trainingSchema);

export default Training;
