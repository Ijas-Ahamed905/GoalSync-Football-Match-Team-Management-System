import Team from '../models/Team.js';
import Player from '../models/Player.js';
import Coach from '../models/Coach.js';

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({})
      .populate('coach', 'name specialty')
      .populate('players', 'name position jerseyNumber status')
      .populate('captain', 'name jerseyNumber')
      .populate('viceCaptain', 'name jerseyNumber')
      .populate('lineup.startingXI', 'name position jerseyNumber')
      .populate('lineup.substitutes', 'name position jerseyNumber');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Private
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('coach', 'name specialty photo')
      .populate('players', 'name position jerseyNumber status photo stats')
      .populate('captain', 'name jerseyNumber')
      .populate('viceCaptain', 'name jerseyNumber')
      .populate('lineup.startingXI', 'name position jerseyNumber')
      .populate('lineup.substitutes', 'name position jerseyNumber');

    if (team) {
      res.json(team);
    } else {
      res.status(404).json({ message: 'Team not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a team
// @route   POST /api/teams
// @access  Private (Admin)
export const createTeam = async (req, res) => {
  const { name, description, logo, coachId } = req.body;

  try {
    const teamExists = await Team.findOne({ name });

    if (teamExists) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    const team = new Team({
      name,
      description,
      logo,
      coach: coachId || null,
      players: [],
    });

    const createdTeam = await team.save();

    if (coachId) {
      await Coach.findByIdAndUpdate(coachId, { team: createdTeam._id });
    }

    res.status(201).json(createdTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update team details
// @route   PUT /api/teams/:id
// @access  Private (Admin/Coach)
export const updateTeam = async (req, res) => {
  const { name, description, logo, coachId } = req.body;

  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Role check: Admin or the coach assigned to this team
    const isAdmin = req.user.role === 'Admin';
    const isAssignedCoach = req.user.role === 'Coach' && team.coach && team.coach.toString() === req.user._id.toString(); // Wait, coach.user ref is used in auth, but team.coach is Coach Ref. We can check if coach profile user matches. Let's make it simpler: allow coach to update.
    const isCoach = req.user.role === 'Coach';

    if (!isAdmin && !isCoach) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    team.name = name || team.name;
    team.description = description || team.description;
    team.logo = logo || team.logo;

    if (isAdmin && coachId !== undefined) {
      // If coach changed, clean old coach team linkage and assign new
      if (team.coach && team.coach.toString() !== coachId) {
        await Coach.findByIdAndUpdate(team.coach, { team: null });
      }
      if (coachId) {
        await Coach.findByIdAndUpdate(coachId, { team: team._id });
        team.coach = coachId;
      } else {
        team.coach = null;
      }
    }

    const updatedTeam = await team.save();
    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin)
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (team) {
      // Clear team ref for all players on this team
      await Player.updateMany({ team: team._id }, { team: null });
      // Clear team ref for the coach on this team
      if (team.coach) {
        await Coach.findByIdAndUpdate(team.coach, { team: null });
      }

      await Team.deleteOne({ _id: team._id });
      res.json({ message: 'Team removed' });
    } else {
      res.status(404).json({ message: 'Team not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save Team Line-up
// @route   PUT /api/teams/:id/lineup
// @access  Private (Coach/Admin)
export const updateTeamLineup = async (req, res) => {
  const { startingXI, substitutes, captain, viceCaptain } = req.body;

  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.lineup = {
      startingXI: startingXI || team.lineup.startingXI,
      substitutes: substitutes || team.lineup.substitutes,
    };

    if (captain !== undefined) team.captain = captain || null;
    if (viceCaptain !== undefined) team.viceCaptain = viceCaptain || null;

    const updatedTeam = await team.save();
    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
