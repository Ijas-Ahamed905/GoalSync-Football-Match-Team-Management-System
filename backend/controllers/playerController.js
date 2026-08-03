import Player from '../models/Player.js';
import Team from '../models/Team.js';
import User from '../models/User.js';

// @desc    Get all players
// @route   GET /api/players
// @access  Private
export const getPlayers = async (req, res) => {
  try {
    const players = await Player.find({}).populate('team', 'name');
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get player by ID
// @route   GET /api/players/:id
// @access  Private
export const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('team', 'name');
    if (player) {
      res.json(player);
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a player
// @route   POST /api/players
// @access  Private (Coach/Admin)
export const createPlayer = async (req, res) => {
  const { name, email, position, dateOfBirth, status, teamId, jerseyNumber, photo } = req.body;

  try {
    // Check if player with this email exists
    if (email) {
      const existingPlayer = await Player.findOne({ email });
      if (existingPlayer) {
        return res.status(400).json({ message: 'Player with this email already registered' });
      }
    }

    // Check if User exists to link it
    let linkedUser;
    if (email) {
      linkedUser = await User.findOne({ email });
    }

    const player = new Player({
      name,
      email,
      position: position || 'Unknown',
      dateOfBirth,
      status: status || 'Active',
      team: teamId || null,
      jerseyNumber,
      photo,
      user: linkedUser ? linkedUser._id : undefined,
    });

    const createdPlayer = await player.save();

    // If player is created with a team, append them to that team's players list
    if (teamId) {
      await Team.findByIdAndUpdate(teamId, {
        $push: { players: createdPlayer._id }
      });
    }

    res.status(201).json(createdPlayer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a player
// @route   PUT /api/players/:id
// @access  Private (Coach/Admin or Player owner)
export const updatePlayer = async (req, res) => {
  const { name, email, position, dateOfBirth, status, teamId, jerseyNumber, photo, stats } = req.body;

  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Role safety: if user is not coach/admin, they can only edit their own profile details, not stats/team
    const isCoachOrAdmin = req.user.role === 'Admin' || req.user.role === 'Coach';
    const isSelf = player.user && player.user.toString() === req.user._id.toString();

    if (!isCoachOrAdmin && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Fields that Coach/Admin can edit, plus general fields
    player.name = name || player.name;
    player.photo = photo || player.photo;
    player.dateOfBirth = dateOfBirth || player.dateOfBirth;

    if (isCoachOrAdmin) {
      player.position = position || player.position;
      player.status = status || player.status;
      player.jerseyNumber = jerseyNumber !== undefined ? jerseyNumber : player.jerseyNumber;
      
      if (stats) {
        player.stats = {
          goals: stats.goals !== undefined ? stats.goals : player.stats.goals,
          assists: stats.assists !== undefined ? stats.assists : player.stats.assists,
          yellowCards: stats.yellowCards !== undefined ? stats.yellowCards : player.stats.yellowCards,
          redCards: stats.redCards !== undefined ? stats.redCards : player.stats.redCards,
          matchesPlayed: stats.matchesPlayed !== undefined ? stats.matchesPlayed : player.stats.matchesPlayed,
        };
      }

      // Handle team relocation
      if (teamId !== undefined && teamId !== (player.team ? player.team.toString() : null)) {
        // Remove from old team
        if (player.team) {
          await Team.findByIdAndUpdate(player.team, {
            $pull: { players: player._id }
          });
        }
        // Add to new team
        if (teamId) {
          await Team.findByIdAndUpdate(teamId, {
            $push: { players: player._id }
          });
          player.team = teamId;
        } else {
          player.team = null;
        }
      }
    }

    // Look for matching User if email updated
    if (email && email !== player.email) {
      player.email = email;
      const linkedUser = await User.findOne({ email });
      if (linkedUser) {
        player.user = linkedUser._id;
      }
    }

    const updatedPlayer = await player.save();
    res.json(updatedPlayer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Private (Admin)
export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (player) {
      // Pull player from team's roster
      if (player.team) {
        await Team.findByIdAndUpdate(player.team, {
          $pull: { players: player._id }
        });
      }
      await Player.deleteOne({ _id: player._id });
      res.json({ message: 'Player removed' });
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
