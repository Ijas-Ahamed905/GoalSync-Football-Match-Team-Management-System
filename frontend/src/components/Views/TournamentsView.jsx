import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { Plus, X, Trophy, Calendar, CheckCircle, ShieldAlert } from 'lucide-react';

const TournamentsView = () => {
  const { user } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // detail / edit views state
  const [selectedTourney, setSelectedTourney] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [enrolledTeamIds, setEnrolledTeamIds] = useState([]);
  const [declaredWinner, setDeclaredWinner] = useState('');

  const isCoachOrAdmin = user.role === 'Admin' || user.role === 'Coach';

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const allTourneys = await api('/api/tournaments');
      setTournaments(allTourneys);

      const allTeams = await api('/api/teams');
      setTeams(allTeams);
    } catch (err) {
      setError(err.message || 'Error fetching tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    try {
      const created = await api('/api/tournaments', {
        method: 'POST',
        body: { name, startDate, endDate },
      });
      setTournaments([...tournaments, created]);
      setIsModalOpen(false);
      setName('');
      setStartDate('');
      setEndDate('');
      fetchTournaments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEnrollTeams = async () => {
    try {
      const updated = await api(`/api/tournaments/${selectedTourney._id}/register`, {
        method: 'PUT',
        body: { teamIds: enrolledTeamIds },
      });
      
      const refreshed = await api('/api/tournaments');
      setTournaments(refreshed);
      
      const updatedSelected = refreshed.find(t => t._id === selectedTourney._id);
      setSelectedTourney(updatedSelected);
      setEnrollModalOpen(false);
      alert('Teams registered to tournament successfully.');
    } catch (err) {
      setError(err.message || 'Error registering teams');
    }
  };

  const triggerGenerateFixtures = async () => {
    if (!window.confirm('Are you sure you want to generate match fixtures? This will erase any existing matches for this tournament.')) return;
    try {
      const updated = await api(`/api/tournaments/${selectedTourney._id}/fixtures`, {
        method: 'POST',
      });
      
      const refreshed = await api('/api/tournaments');
      setTournaments(refreshed);
      
      const updatedSelected = refreshed.find(t => t._id === selectedTourney._id);
      setSelectedTourney(updatedSelected);
      alert('Round-robin match fixtures created successfully!');
    } catch (err) {
      setError(err.message || 'Fixtures generation failed');
    }
  };

  const handleDeclareWinner = async () => {
    if (!declaredWinner) return;
    try {
      const updated = await api(`/api/tournaments/${selectedTourney._id}/winner`, {
        method: 'PUT',
        body: { winnerTeamId: declaredWinner },
      });
      
      const refreshed = await api('/api/tournaments');
      setTournaments(refreshed);
      
      const updatedSelected = refreshed.find(t => t._id === selectedTourney._id);
      setSelectedTourney(updatedSelected);
      alert('Winner declared! Tournament status marked as Completed.');
    } catch (err) {
      setError(err.message || 'Failed to declare winner');
    }
  };

  const toggleTeamSelection = (teamId) => {
    if (enrolledTeamIds.includes(teamId)) {
      setEnrolledTeamIds(enrolledTeamIds.filter(id => id !== teamId));
    } else {
      setEnrolledTeamIds([...enrolledTeamIds, teamId]);
    }
  };

  const openEnrollModal = (tourney) => {
    setEnrolledTeamIds(tourney.teams?.map(t => t._id) || []);
    setEnrollModalOpen(true);
  };

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading tournaments schedule database...</div>;

  return (
    <div className="page-container">
      {error && <div className="alert alert-danger">{error}</div>}

      {!selectedTourney ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Tournament Management</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Create cup events, register squads, and track winners.</p>
            </div>
            {isCoachOrAdmin && (
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} />
                <span>Create Tournament</span>
              </button>
            )}
          </div>

          <div className="grid-3col">
            {tournaments.map(tourney => (
              <div key={tourney._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--accent-secondary)', width: '46px', height: '46px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>{tourney.name}</h3>
                    <span className={`badge ${tourney.status === 'Completed' ? 'badge-active' : tourney.status === 'Ongoing' ? 'badge-injured' : 'badge-suspended'}`} style={{ marginTop: '4px' }}>
                      {tourney.status}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Calendar size={14} />
                    Start: {tourney.startDate ? new Date(tourney.startDate).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>Teams: {tourney.teams?.length || 0} Registered</div>
                  <div>Fixtures: {tourney.fixtures?.length || 0} matches</div>
                </div>

                {tourney.winner && (
                  <div style={{ backgroundColor: 'rgba(16,185,129,0.05)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '0.8rem' }}>Champion: <strong>{tourney.winner.name}</strong></span>
                  </div>
                )}

                <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }} onClick={() => setSelectedTourney(tourney)}>
                  View Details & Fixtures
                </button>
              </div>
            ))}

            {tournaments.length === 0 && (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <Trophy size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h3>No Tournaments Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Set up a tournament to generate match fixtures.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        // Detailed Tournament inspector screen
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: '24px' }} onClick={() => setSelectedTourney(null)}>
            Back to Tournament List
          </button>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h2>{selectedTourney.name}</h2>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.9rem' }}>
                  <span>Status: <strong>{selectedTourney.status}</strong></span>
                  <span>Registered Teams: <strong>{selectedTourney.teams?.length || 0}</strong></span>
                </div>
              </div>

              {isCoachOrAdmin && selectedTourney.status !== 'Completed' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" onClick={() => openEnrollModal(selectedTourney)}>
                    Register/Manage Teams
                  </button>
                  <button className="btn btn-secondary" disabled={selectedTourney.teams?.length < 2} onClick={triggerGenerateFixtures}>
                    Generate Fixtures
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid-2col">
            {/* Registered Teams */}
            <div className="card">
              <h3>Participating Teams ({selectedTourney.teams?.length || 0})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {selectedTourney.teams?.map(t => (
                  <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                    {t.logo && <img src={t.logo} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} alt="" />}
                    <strong>{t.name}</strong>
                  </div>
                ))}

                {(!selectedTourney.teams || selectedTourney.teams.length === 0) && (
                  <p style={{ color: 'var(--text-secondary)' }}>No teams enrolled in this cup yet.</p>
                )}
              </div>

              {isCoachOrAdmin && selectedTourney.status === 'Ongoing' && !selectedTourney.winner && (
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '24px', paddingTop: '20px' }}>
                  <h4>Declare Tournament Champion</h4>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <select className="form-control" value={declaredWinner} onChange={(e) => setDeclaredWinner(e.target.value)}>
                      <option value="">-- Choose Winning Team --</option>
                      {selectedTourney.teams?.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                    <button className="btn btn-primary" onClick={handleDeclareWinner}>
                      Declare
                    </button>
                  </div>
                </div>
              )}

              {selectedTourney.winner && (
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '24px', paddingTop: '20px', textAlign: 'center' }}>
                  <Trophy size={48} style={{ color: 'var(--accent-secondary)', margin: '0 auto 12px auto', display: 'block' }} />
                  <h3>Winner: {selectedTourney.winner.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>This tournament has concluded.</p>
                </div>
              )}
            </div>

            {/* Generated Matches */}
            <div className="card">
              <h3>Match Fixtures ({selectedTourney.fixtures?.length || 0})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', maxHeight: '420px', overflowY: 'auto' }}>
                {selectedTourney.fixtures?.map(fixture => (
                  <div key={fixture._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', borderLeft: '3px solid var(--accent-primary)' }}>
                    <div>
                      <strong>{fixture.homeTeam?.name}</strong>{' '}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>VS</span>{' '}
                      <strong>{fixture.awayTeam ? fixture.awayTeam.name : fixture.awayTeamName}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {new Date(fixture.dateTime).toLocaleDateString()} | {fixture.location}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800' }}>
                        {fixture.status === 'Completed' ? `${fixture.score?.home} - ${fixture.score?.away}` : 'Scheduled'}
                      </div>
                      <span className="badge" style={{ fontSize: '0.7rem', padding: '2px 6px', marginTop: '4px' }}>
                        {fixture.status}
                      </span>
                    </div>
                  </div>
                ))}

                {(!selectedTourney.fixtures || selectedTourney.fixtures.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                    <ShieldAlert size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    No match fixtures generated. Register teams and generate.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Teams Modal */}
      {enrollModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Enroll Teams in Tournament</h2>
              <button className="modal-close-btn" onClick={() => setEnrollModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {teams.map(team => {
                  const isEnrolled = enrolledTeamIds.includes(team._id);
                  return (
                    <div key={team._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                      <div>
                        <strong>{team.name}</strong> <span style={{ color: 'var(--text-muted)' }}>(Coach: {team.coach ? team.coach.name : 'None'})</span>
                      </div>
                      <button
                        type="button"
                        className={`btn ${isEnrolled ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => toggleTeamSelection(team._id)}
                      >
                        {isEnrolled ? 'Enrolled' : 'Enroll'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-header" style={{ justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEnrollModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleEnrollTeams}>
                Register Squads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Tournament Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Tournament</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTournament}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="tourName">Tournament Name</label>
                  <input
                    id="tourName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Summer Cup 2026"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tourStart">Start Date</label>
                    <input
                      id="tourStart"
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tourEnd">End Date</label>
                    <input
                      id="tourEnd"
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-header" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsView;
