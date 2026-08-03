import Training from '../models/Training.js';
import Player from '../models/Player.js';

// @desc    Get all training sessions
// @route   GET /api/training
// @access  Private
export const getTrainings = async (req, res) => {
  try {
    const sessions = await Training.find({})
      .populate('team', 'name')
      .populate('playersAttended.player', 'name jerseyNumber position');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a training session
// @route   POST /api/training
// @access  Private (Coach/Admin)
export const createTraining = async (req, res) => {
  const { title, description, dateTime, teamId, duration } = req.body;

  try {
    // Automatically populate team's active players into attendance sheet as default "Present"
    const activePlayers = await Player.find({ team: teamId, status: 'Active' });
    const defaultAttendance = activePlayers.map(p => ({
      player: p._id,
      status: 'Present',
    }));

    const session = new Training({
      title,
      description,
      dateTime,
      team: teamId,
      duration: duration || 90,
      playersAttended: defaultAttendance,
    });

    const createdSession = await session.save();
    res.status(201).json(createdSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update training session details
// @route   PUT /api/training/:id
// @access  Private (Coach/Admin)
export const updateTraining = async (req, res) => {
  const { title, description, dateTime, duration } = req.body;

  try {
    const session = await Training.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Training session not found' });
    }

    session.title = title || session.title;
    session.description = description !== undefined ? description : session.description;
    session.dateTime = dateTime || session.dateTime;
    session.duration = duration || session.duration;

    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record player attendance for a session
// @route   PUT /api/training/:id/attendance
// @access  Private (Coach/Admin)
export const recordAttendance = async (req, res) => {
  const { attendance } = req.body; // Array: [{ playerId: string, status: 'Present' | 'Absent' | 'Excused' }]

  try {
    const session = await Training.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Training session not found' });
    }

    if (attendance && Array.isArray(attendance)) {
      session.playersAttended = attendance.map(item => ({
        player: item.playerId,
        status: item.status,
      }));
    }

    const updatedSession = await session.save();
    const populated = await Training.findById(updatedSession._id)
      .populate('team', 'name')
      .populate('playersAttended.player', 'name jerseyNumber position');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete training session
// @route   DELETE /api/training/:id
// @access  Private (Coach/Admin)
export const deleteTraining = async (req, res) => {
  try {
    const session = await Training.findById(req.params.id);

    if (session) {
      await Training.deleteOne({ _id: session._id });
      res.json({ message: 'Training session deleted' });
    } else {
      res.status(404).json({ message: 'Training session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
