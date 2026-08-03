import Tournament from '../models/Tournament.js';
import Team from '../models/Team.js';
import Match from '../models/Match.js';

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Private
export const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({})
      .populate('teams', 'name logo')
      .populate('winner', 'name logo')
      .populate({
        path: 'fixtures',
        populate: [
          { path: 'homeTeam', select: 'name logo' },
          { path: 'awayTeam', select: 'name logo' }
        ]
      });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a tournament
// @route   POST /api/tournaments
// @access  Private (Coach/Admin)
export const createTournament = async (req, res) => {
  const { name, startDate, endDate } = req.body;

  try {
    const tournament = new Tournament({
      name,
      startDate,
      endDate,
      teams: [],
      fixtures: [],
      status: 'Upcoming',
    });

    const createdTournament = await tournament.save();
    res.status(201).json(createdTournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register teams to tournament
// @route   PUT /api/tournaments/:id/register
// @access  Private (Coach/Admin)
export const registerTeams = async (req, res) => {
  const { teamIds } = req.body; // Array of team IDs

  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    tournament.teams = teamIds || tournament.teams;
    if (tournament.teams.length > 0) {
      tournament.status = 'Ongoing';
    }

    const updatedTournament = await tournament.save();
    res.json(updatedTournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate round-robin fixtures for registered teams
// @route   POST /api/tournaments/:id/fixtures
// @access  Private (Coach/Admin)
export const generateFixtures = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('teams');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (!tournament.teams || tournament.teams.length < 2) {
      return res.status(400).json({ message: 'At least 2 teams are required to generate fixtures' });
    }

    // Clear old fixtures associated with tournament if any
    if (tournament.fixtures && tournament.fixtures.length > 0) {
      await Match.deleteMany({ _id: { $in: tournament.fixtures } });
      tournament.fixtures = [];
    }

    const teams = tournament.teams;
    const generatedMatches = [];
    const baseDate = tournament.startDate || new Date();

    // Simple round-robin schedule algorithm
    let matchIndex = 0;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        // Schedule each match 2 days apart starting from baseDate
        const matchDate = new Date(baseDate);
        matchDate.setDate(matchDate.getDate() + matchIndex * 2);

        const newMatch = new Match({
          homeTeam: teams[i]._id,
          awayTeam: teams[j]._id,
          awayTeamName: teams[j].name,
          dateTime: matchDate,
          location: 'Main Arena',
          tournament: tournament._id,
          status: 'Scheduled',
        });

        const savedMatch = await newMatch.save();
        generatedMatches.push(savedMatch._id);
        matchIndex++;
      }
    }

    tournament.fixtures = generatedMatches;
    await tournament.save();

    const fullyPopulated = await Tournament.findById(tournament._id)
      .populate('teams', 'name logo')
      .populate({
        path: 'fixtures',
        populate: [
          { path: 'homeTeam', select: 'name logo' },
          { path: 'awayTeam', select: 'name logo' }
        ]
      });

    res.json(fullyPopulated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Declare tournament winner
// @route   PUT /api/tournaments/:id/winner
// @access  Private (Coach/Admin)
export const declareWinner = async (req, res) => {
  const { winnerTeamId } = req.body;

  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    tournament.winner = winnerTeamId || null;
    tournament.status = 'Completed';

    const updatedTournament = await tournament.save();
    res.json(updatedTournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
