import Team from '../models/Team.js';
import Player from '../models/Player.js';
import Coach from '../models/Coach.js';
import Match from '../models/Match.js';
import Tournament from '../models/Tournament.js';
import Training from '../models/Training.js';

// @desc    Get dashboard aggregate statistics
// @route   GET /api/reports/dashboard
// @access  Private
export const getDashboardSummary = async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments();
    const totalPlayers = await Player.countDocuments();
    const totalCoaches = await Coach.countDocuments();

    const upcomingMatches = await Match.find({ status: 'Scheduled' })
      .populate('homeTeam', 'name logo')
      .populate('awayTeam', 'name logo')
      .sort({ dateTime: 1 })
      .limit(5);

    const completedMatches = await Match.find({ status: 'Completed' })
      .populate('homeTeam', 'name logo')
      .populate('awayTeam', 'name logo')
      .sort({ dateTime: -1 })
      .limit(5);

    const tournaments = await Tournament.find({})
      .populate('winner', 'name')
      .sort({ createdAt: -1 });

    const tournamentSummary = tournaments.map(t => ({
      _id: t._id,
      name: t.name,
      status: t.status,
      teamCount: t.teams ? t.teams.length : 0,
      winner: t.winner ? t.winner.name : 'N/A',
      fixtureCount: t.fixtures ? t.fixtures.length : 0,
    }));

    res.json({
      totalTeams,
      totalPlayers,
      totalCoaches,
      upcomingMatches,
      completedMatches,
      tournamentSummary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get player report
// @route   GET /api/reports/players
// @access  Private
export const getPlayerReport = async (req, res) => {
  try {
    const players = await Player.find({}).populate('team', 'name').sort({ name: 1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get team report
// @route   GET /api/reports/teams
// @access  Private
export const getTeamReport = async (req, res) => {
  try {
    const teams = await Team.find({})
      .populate('coach', 'name')
      .populate('players', 'name jerseyNumber status position')
      .populate('captain', 'name')
      .populate('viceCaptain', 'name');

    const formattedTeams = teams.map(t => ({
      _id: t._id,
      name: t.name,
      description: t.description || 'No description',
      coach: t.coach ? t.coach.name : 'No Coach assigned',
      playerCount: t.players ? t.players.length : 0,
      captain: t.captain ? t.captain.name : 'N/A',
      viceCaptain: t.viceCaptain ? t.viceCaptain.name : 'N/A',
    }));

    res.json(formattedTeams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get match schedule and scores report
// @route   GET /api/reports/matches
// @access  Private
export const getMatchReport = async (req, res) => {
  try {
    const matches = await Match.find({})
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .populate('tournament', 'name')
      .sort({ dateTime: -1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tournament standings and history report
// @route   GET /api/reports/tournaments
// @access  Private
export const getTournamentReport = async (req, res) => {
  try {
    const tournaments = await Tournament.find({})
      .populate('teams', 'name')
      .populate('winner', 'name')
      .sort({ createdAt: -1 });

    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance reports and percentage metrics
// @route   GET /api/reports/attendance
// @access  Private
export const getAttendanceReport = async (req, res) => {
  try {
    const sessions = await Training.find({}).populate('playersAttended.player', 'name');
    const players = await Player.find({}).populate('team', 'name');

    const attendanceStats = players.map(player => {
      let sessionsListed = 0;
      let sessionsPresent = 0;
      let sessionsAbsent = 0;
      let sessionsExcused = 0;

      sessions.forEach(session => {
        const record = session.playersAttended.find(
          r => r.player && r.player._id.toString() === player._id.toString()
        );

        if (record) {
          sessionsListed++;
          if (record.status === 'Present') sessionsPresent++;
          else if (record.status === 'Absent') sessionsAbsent++;
          else if (record.status === 'Excused') sessionsExcused++;
        }
      });

      const percentage = sessionsListed > 0 
        ? Math.round((sessionsPresent / sessionsListed) * 100) 
        : 100; // default to 100 if no training sessions listed yet

      return {
        playerId: player._id,
        playerName: player.name,
        teamName: player.team ? player.team.name : 'Unassigned',
        sessionsListed,
        sessionsPresent,
        sessionsAbsent,
        sessionsExcused,
        percentage,
      };
    });

    res.json({
      sessionsCount: sessions.length,
      attendanceStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get goal scorers leaderboard report
// @route   GET /api/reports/goals
// @access  Private
export const getGoalScorerReport = async (req, res) => {
  try {
    const players = await Player.find({ 'stats.goals': { $gt: -1 } })
      .populate('team', 'name')
      .sort({ 'stats.goals': -1, 'stats.assists': -1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
