import Coach from '../models/Coach.js';
import Team from '../models/Team.js';
import User from '../models/User.js';

// @desc    Get all coaches
// @route   GET /api/coaches
// @access  Private
export const getCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find({}).populate('team', 'name');
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get coach by ID
// @route   GET /api/coaches/:id
// @access  Private
export const getCoachById = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id).populate('team', 'name');
    if (coach) {
      res.json(coach);
    } else {
      res.status(404).json({ message: 'Coach not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a coach
// @route   POST /api/coaches
// @access  Private (Admin)
export const createCoach = async (req, res) => {
  const { name, email, specialty, experience, teamId, photo } = req.body;

  try {
    if (email) {
      const existingCoach = await Coach.findOne({ email });
      if (existingCoach) {
        return res.status(400).json({ message: 'Coach with this email already registered' });
      }
    }

    // Look for matching user
    let linkedUser;
    if (email) {
      linkedUser = await User.findOne({ email });
    }

    const coach = new Coach({
      name,
      email,
      specialty: specialty || 'General',
      experience: experience || 0,
      team: teamId || null,
      photo,
      user: linkedUser ? linkedUser._id : undefined,
    });

    const createdCoach = await coach.save();

    // Assign coach to team if teamId is provided
    if (teamId) {
      await Team.findByIdAndUpdate(teamId, { coach: createdCoach._id });
    }

    res.status(201).json(createdCoach);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update coach
// @route   PUT /api/coaches/:id
// @access  Private (Admin or Coach self)
export const updateCoach = async (req, res) => {
  const { name, email, specialty, experience, teamId, photo } = req.body;

  try {
    const coach = await Coach.findById(req.params.id);

    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    const isAdmin = req.user.role === 'Admin';
    const isSelf = coach.user && coach.user.toString() === req.user._id.toString();

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to update this coach profile' });
    }

    coach.name = name || coach.name;
    coach.photo = photo || coach.photo;
    
    if (isAdmin) {
      coach.specialty = specialty || coach.specialty;
      coach.experience = experience !== undefined ? experience : coach.experience;

      // Handle team relocation for coach
      if (teamId !== undefined && teamId !== (coach.team ? coach.team.toString() : null)) {
        // Clear from old team
        if (coach.team) {
          await Team.findByIdAndUpdate(coach.team, { coach: null });
        }
        // Assign to new team
        if (teamId) {
          await Team.findByIdAndUpdate(teamId, { coach: coach._id });
          coach.team = teamId;
        } else {
          coach.team = null;
        }
      }
    }

    if (email && email !== coach.email) {
      coach.email = email;
      const linkedUser = await User.findOne({ email });
      if (linkedUser) {
        coach.user = linkedUser._id;
      }
    }

    const updatedCoach = await coach.save();
    res.json(updatedCoach);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete coach
// @route   DELETE /api/coaches/:id
// @access  Private (Admin)
export const deleteCoach = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);

    if (coach) {
      // Clear team coach reference
      if (coach.team) {
        await Team.findByIdAndUpdate(coach.team, { coach: null });
      }
      await Coach.deleteOne({ _id: coach._id });
      res.json({ message: 'Coach removed' });
    } else {
      res.status(404).json({ message: 'Coach not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
