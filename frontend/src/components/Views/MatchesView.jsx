import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { Plus, Play, X, Calendar, MapPin, Trophy, Star, ChevronRight } from 'lucide-react';

const MatchesView = () => {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals / Live Scoring States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveMatch, setLiveMatch] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [tickedSeconds, setTickedSeconds] = useState(0);

  useEffect(() => {
    if (!liveMatch) return;

    const calculateElapsed = () => {
      if (liveMatch.isTimerRunning && liveMatch.timerStartedAt) {
        const elapsedSinceStart = (Date.now() - new Date(liveMatch.timerStartedAt).getTime()) / 1000;
        return Math.floor((liveMatch.elapsedSeconds || 0) + elapsedSinceStart);
      }
      return Math.floor(liveMatch.elapsedSeconds || 0);
    };

    setTickedSeconds(calculateElapsed());

    if (liveMatch.isTimerRunning) {
      const id = setInterval(() => {
        setTickedSeconds(calculateElapsed());
      }, 1000);
      return () => clearInterval(id);
    }
  }, [liveMatch]);

  useEffect(() => {
    if (tickedSeconds > 0) {
      const currentMinute = Math.min(120, Math.floor(tickedSeconds / 60) + 1);
      setEventMinute(currentMinute);
    }
  }, [tickedSeconds]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleTimerAction = async (action) => {
    try {
      const updated = await api(`/api/matches/${liveMatch._id}/timer`, {
        method: 'PUT',
        body: { action }
      });
      setLiveMatch(updated);
      setHomeScore(updated.score?.home || 0);
      setAwayScore(updated.score?.away || 0);
      setLiveEvents(updated.events || []);
    } catch (err) {
      alert(err.message || 'Failed to update timer');
    }
  };

  // Match Event Form States
  const [eventType, setEventType] = useState('Goal');
  const [eventMinute, setEventMinute] = useState(1);
  const [eventPlayer, setEventPlayer] = useState('');
  const [eventPlayerIn, setEventPlayerIn] = useState('');
  const [eventPlayerOut, setEventPlayerOut] = useState('');
  const [eventDetail, setEventDetail] = useState('');

  // Schedule Match Form States
  const [opponentName, setOpponentName] = useState('');
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [awayTeamName, setAwayTeamName] = useState('Opponent FC');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [tournamentId, setTournamentId] = useState('');

  const isCoachOrAdmin = user.role === 'Admin' || user.role === 'Coach';

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const allMatches = await api('/api/matches');
      setMatches(allMatches);

      const allTeams = await api('/api/teams');
      setTeams(allTeams);

      const allTourneys = await api('/api/tournaments');
      setTournaments(allTourneys);
    } catch (err) {
      setError(err.message || 'Error loading match database');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMatch = async (e) => {
    e.preventDefault();
    try {
      const newMatch = await api('/api/matches', {
        method: 'POST',
        body: {
          opponentName,
          homeTeamId,
          awayTeamId: awayTeamId || null,
          awayTeamName: awayTeamId ? undefined : awayTeamName,
          dateTime,
          location,
          tournamentId: tournamentId || null,
        },
      });
      setMatches([...matches, newMatch]);
      setIsModalOpen(false);
      // Reset form
      setOpponentName('');
      setHomeTeamId('');
      setAwayTeamId('');
      setAwayTeamName('Opponent FC');
      setDateTime('');
      setLocation('');
      setTournamentId('');
      fetchMatches();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelMatch = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled match?')) return;
    try {
      const updated = await api(`/api/matches/${id}`, {
        method: 'PUT',
        body: { status: 'Cancelled' },
      });
      setMatches(matches.map(m => m._id === id ? updated : m));
      fetchMatches();
    } catch (err) {
      setError(err.message);
    }
  };

  const markMatchCompleted = async (id) => {
    try {
      const updated = await api(`/api/matches/${id}`, {
        method: 'PUT',
        body: { status: 'Completed' },
      });
      setMatches(matches.map(m => m._id === id ? updated : m));
      alert('Match status marked as Completed. Player appearances have been logged.');
      setLiveMatch(null);
      fetchMatches();
    } catch (err) {
      setError(err.message);
    }
  };

  // Live Score Action triggers
  const startLiveScoring = async (match) => {
    // Re-fetch match to get fresh lineup populated details
    try {
      const freshMatch = await api(`/api/matches/${match._id}`);
      setLiveMatch(freshMatch);
      setLiveEvents(freshMatch.events || []);
      setHomeScore(freshMatch.score?.home || 0);
      setAwayScore(freshMatch.score?.away || 0);
    } catch (err) {
      setError('Could not initialize live scoring');
    }
  };

  const handleAddLiveEvent = async (e) => {
    e.preventDefault();
    if (!eventPlayer && eventType !== 'Substitution') {
      alert('Please select a player.');
      return;
    }

    try {
      const updated = await api(`/api/matches/${liveMatch._id}/result`, {
        method: 'PUT',
        body: {
          score: { home: homeScore, away: awayScore },
          event: {
            type: eventType,
            minute: eventMinute,
            playerId: eventPlayer || null,
            playerInId: eventPlayerIn || null,
            playerOutId: eventPlayerOut || null,
            detail: eventDetail,
          },
        },
      });

      setLiveMatch(updated);
      setLiveEvents(updated.events || []);
      setHomeScore(updated.score?.home || 0);
      setAwayScore(updated.score?.away || 0);

      // Reset event inputs
      setEventMinute(eventMinute + 1);
      setEventPlayer('');
      setEventPlayerIn('');
      setEventPlayerOut('');
      setEventDetail('');
    } catch (err) {
      setError(err.message || 'Failed to register live event');
    }
  };

  const handleUpdateScoreOnly = async () => {
    try {
      const updated = await api(`/api/matches/${liveMatch._id}/result`, {
        method: 'PUT',
        body: {
          score: { home: homeScore, away: awayScore }
        },
      });
      setLiveMatch(updated);
      alert('Score updated successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading scheduled match logs...</div>;

  return (
    <div className="page-container">
      {error && <div className="alert alert-danger">{error}</div>}

      {!liveMatch ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Match Schedules & Results</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Plan upcoming games, record results, and check league scores.</p>
            </div>
            {isCoachOrAdmin && (
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} />
                <span>Schedule Match</span>
              </button>
            )}
          </div>

          <div className="match-list-grid">
            {matches.map(match => (
              <div key={match._id} className="match-item-card">
                <div className="match-teams-vs">
                  <div className="match-team-col">
                    {match.homeTeam?.logo && (
                      <img src={match.homeTeam.logo} className="match-team-logo-small" alt="" />
                    )}
                    <span>{match.homeTeam?.name}</span>
                  </div>
                  
                  <div className="match-score-pill">
                    {match.status === 'Scheduled' ? 'VS' : `${match.score?.home} - ${match.score?.away}`}
                  </div>

                  <div className="match-team-col away">
                    <span>{match.awayTeam ? match.awayTeam.name : match.awayTeamName}</span>
                    {match.awayTeam?.logo && (
                      <img src={match.awayTeam.logo} className="match-team-logo-small" alt="" />
                    )}
                  </div>
                </div>

                <div className="match-meta-info" style={{ width: '220px', alignItems: 'flex-start', paddingLeft: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {new Date(match.dateTime).toLocaleString()}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {match.location}</div>
                  {match.tournament && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-secondary)' }}>
                      <Trophy size={14} /> {match.tournament.name}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className={`badge ${match.status === 'Completed' ? 'badge-active' : match.status === 'Scheduled' ? 'badge-injured' : 'badge-suspended'}`}>
                    {match.status}
                  </span>

                  {isCoachOrAdmin && match.status === 'Scheduled' && (
                    <>
                      <button className="btn btn-warning" style={{ padding: '6px 12px' }} onClick={() => startLiveScoring(match)}>
                        <Play size={14} />
                        <span>Live Score</span>
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => cancelMatch(match._id)}>
                        Cancel
                      </button>
                    </>
                  )}
                  {isCoachOrAdmin && match.status === 'Completed' && (
                    <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => startLiveScoring(match)}>
                      Edit Events
                    </button>
                  )}
                </div>
              </div>
            ))}

            {matches.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <Calendar size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h3>No Matches Configured</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Create match schedules using the setup wizard.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        // Live score recorder view
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button className="btn btn-secondary" onClick={() => setLiveMatch(null)}>
              Back to Schedules
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              {liveMatch.status !== 'Completed' && (
                <button className="btn btn-primary" onClick={() => markMatchCompleted(liveMatch._id)}>
                  Mark Match Completed
                </button>
              )}
            </div>
          </div>

          <div className="live-tracker-grid">
            <div>
              <div className="live-score-board">
                <span className="badge badge-injured" style={{ textTransform: 'uppercase' }}>
                  {liveMatch.status === 'Completed' ? 'Completed Match' : 'Recording Live Score'}
                </span>
                
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center', marginTop: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.75rem' }}>{liveMatch.homeTeam?.name}</h3>
                    <div style={{ color: 'var(--text-secondary)' }}>Home Team</div>
                  </div>

                  <div className="score-display">
                    {isCoachOrAdmin ? (
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: '80px', fontSize: '2.5rem', textAlign: 'center', height: '80px' }}
                        value={homeScore}
                        onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <span className="large-score">{homeScore}</span>
                    )}

                    <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>-</span>

                    {isCoachOrAdmin ? (
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: '80px', fontSize: '2.5rem', textAlign: 'center', height: '80px' }}
                        value={awayScore}
                        onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <span className="large-score">{awayScore}</span>
                    )}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.75rem' }}>{liveMatch.awayTeam ? liveMatch.awayTeam.name : liveMatch.awayTeamName}</h3>
                    <div style={{ color: 'var(--text-secondary)' }}>Opponent</div>
                  </div>
                </div>

                {isCoachOrAdmin && liveMatch.status !== 'Completed' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', width: '100%' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-secondary)', letterSpacing: '1px', fontFamily: 'monospace' }}>
                      {formatTime(tickedSeconds)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {liveMatch.isTimerRunning ? (
                        <button type="button" className="btn btn-warning" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleTimerAction('pause')}>
                          Pause Clock
                        </button>
                      ) : (
                        <button type="button" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleTimerAction('start')}>
                          {tickedSeconds > 0 ? 'Resume Clock' : 'Start Clock'}
                        </button>
                      )}
                      <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleTimerAction('reset')}>
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                {isCoachOrAdmin && (
                  <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={handleUpdateScoreOnly}>
                    Update Score Only
                  </button>
                )}
              </div>

              {isCoachOrAdmin && (
                <div className="card" style={{ marginTop: '24px' }}>
                  <h3>Record Match Event</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Log goals, assists, yellow/red cards, and substitutions. Logging goals/cards immediately updates player analytics.</p>
                  
                  <form onSubmit={handleAddLiveEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Event Type</label>
                      <select className="form-control" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                        <option value="Goal">Goal</option>
                        <option value="Assist">Assist</option>
                        <option value="YellowCard">Yellow Card</option>
                        <option value="RedCard">Red Card</option>
                        <option value="Substitution">Substitution</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Minute</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        className="form-control"
                        value={eventMinute}
                        onChange={(e) => setEventMinute(parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>

                    {eventType !== 'Substitution' ? (
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Player</label>
                        <select className="form-control" value={eventPlayer} onChange={(e) => setEventPlayer(e.target.value)}>
                          <option value="">-- Choose Player --</option>
                          {liveMatch.homeTeam?.players && Array.isArray(liveMatch.homeTeam.players) && liveMatch.homeTeam.players.length > 0 ? (
                            liveMatch.homeTeam.players.map(p => (
                              <option key={p._id} value={p._id}>#{p.jerseyNumber || '-'} {p.name} ({p.position})</option>
                            ))
                          ) : (
                            <option value="">No Roster Players Found</option>
                          )}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div className="form-group">
                          <label>Player Out</label>
                          <select className="form-control" value={eventPlayerOut} onChange={(e) => setEventPlayerOut(e.target.value)}>
                            <option value="">-- Choose Player --</option>
                            {liveMatch.homeTeam?.players?.map(p => (
                              <option key={p._id} value={p._id}>#{p.jerseyNumber || '-'} {p.name} ({p.position})</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Player In</label>
                          <select className="form-control" value={eventPlayerIn} onChange={(e) => setEventPlayerIn(e.target.value)}>
                            <option value="">-- Choose Player --</option>
                            {liveMatch.homeTeam?.players?.map(p => (
                              <option key={p._id} value={p._id}>#{p.jerseyNumber || '-'} {p.name} ({p.position})</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Event Note</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Header from corner kick"
                        value={eventDetail}
                        onChange={(e) => setEventDetail(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
                      Record Event
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Event Timeline / Ticker */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3>Match Events Timeline</h3>
              <div className="live-event-ticker">
                {liveEvents && liveEvents.length > 0 ? (
                  liveEvents.map((evt, idx) => (
                    <div key={idx} className={`ticker-item ${evt.type === 'YellowCard' ? 'card-y' : evt.type === 'RedCard' ? 'card-r' : evt.type === 'Substitution' ? 'sub' : ''}`}>
                      <div style={{ fontWeight: '800', color: 'var(--accent-secondary)' }}>{evt.minute}'</div>
                      <div>
                        {evt.type === 'Substitution' ? (
                          <span>
                            Sub: <strong>{evt.playerIn?.name}</strong> replaced <strong>{evt.playerOut?.name}</strong>
                          </span>
                        ) : (
                          <span>
                            <strong>{evt.type}</strong> - {evt.player?.name}
                          </span>
                        )}
                        {evt.detail && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{evt.detail}</div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No match events logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Match Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Schedule Match Fixture</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleScheduleMatch}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="homeTeam">Home Team (Your Roster)</label>
                  <select
                    id="homeTeam"
                    className="form-control"
                    value={homeTeamId}
                    onChange={(e) => setHomeTeamId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Team --</option>
                    {teams.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="awayTeam">Is Internal Opponent?</label>
                    <select
                      id="awayTeam"
                      className="form-control"
                      value={awayTeamId}
                      onChange={(e) => setAwayTeamId(e.target.value)}
                    >
                      <option value="">-- No (External Opponent) --</option>
                      {teams.map(t => (
                        // Prevent scheduling team against itself
                        t._id !== homeTeamId && <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {!awayTeamId && (
                    <div className="form-group">
                      <label htmlFor="awayName">Opponent Name</label>
                      <input
                        id="awayName"
                        type="text"
                        className="form-control"
                        value={awayTeamName}
                        onChange={(e) => setAwayTeamName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="matchTime">Date & Time</label>
                  <input
                    id="matchTime"
                    type="datetime-local"
                    className="form-control"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="matchLoc">Location / Venue</label>
                  <input
                    id="matchLoc"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Home Turf Field A"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="matchTourney">Tournament (Optional)</label>
                  <select
                    id="matchTourney"
                    className="form-control"
                    value={tournamentId}
                    onChange={(e) => setTournamentId(e.target.value)}
                  >
                    <option value="">-- None (Friendly Match) --</option>
                    {tournaments.map(tour => (
                      <option key={tour._id} value={tour._id}>{tour.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-header" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesView;
