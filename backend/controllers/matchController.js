import Match from '../models/Match.js';
import Player from '../models/Player.js';
import Team from '../models/Team.js';

// @desc    Get all matches
// @route   GET /api/matches
// @access  Private
export const getMatches = async (req, res) => {
  try {
    const matches = await Match.find({})
      .populate('homeTeam', 'name logo')
      .populate('awayTeam', 'name logo')
      .populate('tournament', 'name')
      .populate('events.player', 'name jerseyNumber')
      .populate('events.playerIn', 'name jerseyNumber')
      .populate('events.playerOut', 'name jerseyNumber');
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get match by ID
// @route   GET /api/matches/:id
// @access  Private
export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate({
        path: 'homeTeam',
        select: 'name logo players',
        populate: {
          path: 'players',
          select: 'name jerseyNumber position status'
        }
      })
      .populate('awayTeam', 'name logo')
      .populate('tournament', 'name')
      .populate('events.player', 'name jerseyNumber')
      .populate('events.playerIn', 'name jerseyNumber')
      .populate('events.playerOut', 'name jerseyNumber');

    if (match) {
      res.json(match);
    } else {
      res.status(404).json({ message: 'Match not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create/Schedule a match
// @route   POST /api/matches
// @access  Private (Coach/Admin)
export const createMatch = async (req, res) => {
  const { opponentName, homeTeamId, awayTeamId, awayTeamName, dateTime, location, tournamentId } = req.body;

  try {
    const match = new Match({
      opponentName,
      homeTeam: homeTeamId,
      awayTeam: awayTeamId || null,
      awayTeamName: awayTeamName || 'Opponent Team',
      dateTime,
      location,
      tournament: tournamentId || null,
      status: 'Scheduled',
    });

    const createdMatch = await match.save();
    res.status(201).json(createdMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update match schedule details
// @route   PUT /api/matches/:id
// @access  Private (Coach/Admin)
export const updateMatch = async (req, res) => {
  const { opponentName, homeTeamId, awayTeamId, awayTeamName, dateTime, location, tournamentId, status } = req.body;

  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    match.opponentName = opponentName !== undefined ? opponentName : match.opponentName;
    match.homeTeam = homeTeamId || match.homeTeam;
    match.awayTeam = awayTeamId !== undefined ? awayTeamId : match.awayTeam;
    match.awayTeamName = awayTeamName !== undefined ? awayTeamName : match.awayTeamName;
    match.dateTime = dateTime || match.dateTime;
    match.location = location || match.location;
    match.tournament = tournamentId !== undefined ? tournamentId : match.tournament;
    
    const oldStatus = match.status;
    match.status = status || match.status;

    // Handle stats updates and timer reset if match transitioned to Completed
    if (match.status === 'Completed') {
      match.isTimerRunning = false;
      if (oldStatus !== 'Completed') {
        // Find home team and away team players to increment matchesPlayed
        const team = await Team.findById(match.homeTeam);
        if (team && team.lineup) {
          const activeLineupPlayers = [
            ...(team.lineup.startingXI || []),
            ...(team.lineup.substitutes || [])
          ];
          if (activeLineupPlayers.length > 0) {
            await Player.updateMany(
              { _id: { $in: activeLineupPlayers } },
              { $inc: { 'stats.matchesPlayed': 1 } }
            );
          }
        }
      }
    }

    const updatedMatch = await match.save();
    res.json(updatedMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update match score and log real-time event
// @route   PUT /api/matches/:id/result
// @access  Private (Coach/Admin)
export const updateMatchResult = async (req, res) => {
  const { score, event } = req.body;

  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Update score
    if (score) {
      match.score = {
        home: score.home !== undefined ? score.home : match.score.home,
        away: score.away !== undefined ? score.away : match.score.away,
      };
    }

    // Record Event and update Player statistics accordingly
    if (event && event.type && event.minute !== undefined) {
      const { type, minute, playerId, playerInId, playerOutId, detail } = event;

      const newEvent = {
        type,
        minute,
        player: playerId || null,
        playerIn: playerInId || null,
        playerOut: playerOutId || null,
        detail: detail || '',
      };

      match.events.push(newEvent);

      // Perform real-time stats integration on Player profile
      if (playerId) {
        if (type === 'Goal') {
          await Player.findByIdAndUpdate(playerId, { $inc: { 'stats.goals': 1 } });
        } else if (type === 'Assist') {
          await Player.findByIdAndUpdate(playerId, { $inc: { 'stats.assists': 1 } });
        } else if (type === 'YellowCard') {
          await Player.findByIdAndUpdate(playerId, { $inc: { 'stats.yellowCards': 1 } });
        } else if (type === 'RedCard') {
          await Player.findByIdAndUpdate(playerId, { $inc: { 'stats.redCards': 1, 'status': 'Suspended' } });
        }
      }
    }

    const updatedMatch = await match.save();
    
    // Return populated match
    const populated = await Match.findById(updatedMatch._id)
      .populate({
        path: 'homeTeam',
        select: 'name logo players',
        populate: {
          path: 'players',
          select: 'name jerseyNumber position status'
        }
      })
      .populate('awayTeam', 'name logo')
      .populate('events.player', 'name jerseyNumber')
      .populate('events.playerIn', 'name jerseyNumber')
      .populate('events.playerOut', 'name jerseyNumber');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete match
// @route   DELETE /api/matches/:id
// @access  Private (Admin)
export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (match) {
      await Match.deleteOne({ _id: match._id });
      res.json({ message: 'Match deleted' });
    } else {
      res.status(404).json({ message: 'Match not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update match timer state (start / pause / reset)
// @route   PUT /api/matches/:id/timer
// @access  Private (Coach/Admin)
export const updateMatchTimer = async (req, res) => {
  const { action } = req.body;

  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (action === 'start') {
      match.isTimerRunning = true;
      match.timerStartedAt = new Date();
    } else if (action === 'pause') {
      if (match.isTimerRunning && match.timerStartedAt) {
        const diffSeconds = (new Date() - new Date(match.timerStartedAt)) / 1000;
        match.elapsedSeconds = (match.elapsedSeconds || 0) + diffSeconds;
      }
      match.isTimerRunning = false;
    } else if (action === 'reset') {
      match.isTimerRunning = false;
      match.elapsedSeconds = 0;
      match.timerStartedAt = undefined;
    }

    const updated = await match.save();

    const populated = await Match.findById(updated._id)
      .populate({
        path: 'homeTeam',
        select: 'name logo players',
        populate: {
          path: 'players',
          select: 'name jerseyNumber position status'
        }
      })
      .populate('awayTeam', 'name logo')
      .populate('events.player', 'name jerseyNumber')
      .populate('events.playerIn', 'name jerseyNumber')
      .populate('events.playerOut', 'name jerseyNumber');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
