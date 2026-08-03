import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { Plus, Edit2, Trash2, X, Search, Upload, ShieldAlert, Award } from 'lucide-react';

const PlayersView = () => {
  const { user } = useContext(AuthContext);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  // detail profile inspector state
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // form modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('Unknown');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [status, setStatus] = useState('Active');
  const [teamId, setTeamId] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [photo, setPhoto] = useState('');

  // Increment statistics form states
  const [statsGoals, setStatsGoals] = useState(0);
  const [statsAssists, setStatsAssists] = useState(0);
  const [statsYellowCards, setStatsYellowCards] = useState(0);
  const [statsRedCards, setStatsRedCards] = useState(0);
  const [statsMatchesPlayed, setStatsMatchesPlayed] = useState(0);

  const isCoachOrAdmin = user.role === 'Admin' || user.role === 'Coach';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const allPlayers = await api('/api/players');
      setPlayers(allPlayers);

      const allTeams = await api('/api/teams');
      setTeams(allTeams);
    } catch (err) {
      setError(err.message || 'Error fetching player roster');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPhoto(reader.result);
      };
      reader.onerror = (error) => {
        console.error('Error uploading photo file: ', error);
      };
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setEmail('');
    setPosition('Unknown');
    setDateOfBirth('');
    setStatus('Active');
    setTeamId('');
    setJerseyNumber('');
    setPhoto('');
    // Stats reset
    setStatsGoals(0);
    setStatsAssists(0);
    setStatsYellowCards(0);
    setStatsRedCards(0);
    setStatsMatchesPlayed(0);
    setIsModalOpen(true);
  };

  const openEditModal = (player) => {
    setEditId(player._id);
    setName(player.name);
    setEmail(player.email || '');
    setPosition(player.position || 'Unknown');
    setDateOfBirth(player.dateOfBirth ? player.dateOfBirth.substring(0, 10) : '');
    setStatus(player.status || 'Active');
    setTeamId(player.team ? player.team._id || player.team : '');
    setJerseyNumber(player.jerseyNumber || '');
    setPhoto(player.photo || '');
    // Stats
    setStatsGoals(player.stats?.goals || 0);
    setStatsAssists(player.stats?.assists || 0);
    setStatsYellowCards(player.stats?.yellowCards || 0);
    setStatsRedCards(player.stats?.redCards || 0);
    setStatsMatchesPlayed(player.stats?.matchesPlayed || 0);
    setIsModalOpen(true);
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email: email || undefined,
        position,
        dateOfBirth: dateOfBirth || undefined,
        status,
        teamId: teamId || null,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : undefined,
        photo,
        stats: {
          goals: parseInt(statsGoals) || 0,
          assists: parseInt(statsAssists) || 0,
          yellowCards: parseInt(statsYellowCards) || 0,
          redCards: parseInt(statsRedCards) || 0,
          matchesPlayed: parseInt(statsMatchesPlayed) || 0,
        }
      };

      if (editId) {
        const updated = await api(`/api/players/${editId}`, {
          method: 'PUT',
          body: payload,
        });
        setPlayers(players.map(p => p._id === editId ? { ...p, ...updated } : p));
        if (selectedPlayer && selectedPlayer._id === editId) {
          setSelectedPlayer({ ...selectedPlayer, ...updated });
        }
      } else {
        const created = await api('/api/players', {
          method: 'POST',
          body: payload,
        });
        setPlayers([...players, created]);
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      setError(err.message || 'Error occurred while saving player profile');
    }
  };

  const handleDeletePlayer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    try {
      await api(`/api/players/${id}`, { method: 'DELETE' });
      setPlayers(players.filter(p => p._id !== id));
      if (selectedPlayer && selectedPlayer._id === id) {
        setSelectedPlayer(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Search & Filters integration
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (player.jerseyNumber && player.jerseyNumber.toString().includes(searchTerm));
    
    // Team filter: Check team ID matches
    const playerTeamId = player.team?._id || player.team;
    const matchesTeam = teamFilter ? playerTeamId === teamFilter : true;
    
    // Position filter: check position
    const matchesPosition = positionFilter ? player.position === positionFilter : true;

    return matchesSearch && matchesTeam && matchesPosition;
  });

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading roster list...</div>;

  return (
    <div className="page-container">
      {error && <div className="alert alert-danger">{error}</div>}

      {!selectedPlayer ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Player Roster Management</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Edit details, track active status, and check aggregate metrics.</p>
            </div>
            {isCoachOrAdmin && (
              <button className="btn btn-primary" onClick={openAddModal}>
                <Plus size={18} />
                <span>Register Player</span>
              </button>
            )}
          </div>

          {/* Filters Bar */}
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by player name or jersey..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="select-filter"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
            >
              <option value="">All Teams</option>
              {teams.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>

            <select
              className="select-filter"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="">All Positions</option>
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Forward">Forward</option>
            </select>
          </div>

          {/* Cards Grid */}
          <div className="profile-grid">
            {filteredPlayers.map(player => (
              <div key={player._id} className="card profile-card">
                {player.photo ? (
                  <img src={player.photo} className="profile-photo" alt={player.name} />
                ) : (
                  <div className="profile-photo-placeholder">
                    <span>No Image</span>
                  </div>
                )}

                <div className="profile-details">
                  <h3>{player.name}</h3>
                  <p style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                    #{player.jerseyNumber || 'unassigned'} | {player.position}
                  </p>
                  <p style={{ fontSize: '0.8rem' }}>
                    Team: <strong>{player.team?.name || 'Unassigned'}</strong>
                  </p>
                  <span className={`badge badge-${player.status.toLowerCase()}`} style={{ marginTop: '8px' }}>
                    {player.status}
                  </span>
                </div>

                <div className="profile-stats">
                  <div className="profile-stat-item">
                    <span>Goals</span>
                    <strong>{player.stats?.goals || 0}</strong>
                  </div>
                  <div className="profile-stat-item">
                    <span>Assists</span>
                    <strong>{player.stats?.assists || 0}</strong>
                  </div>
                  <div className="profile-stat-item">
                    <span>Apps</span>
                    <strong>{player.stats?.matchesPlayed || 0}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '10px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedPlayer(player)}>
                    Profile
                  </button>
                  {isCoachOrAdmin && (
                    <>
                      <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => openEditModal(player)}>
                        <Edit2 size={14} />
                      </button>
                      {user.role === 'Admin' && (
                        <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeletePlayer(player._id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {filteredPlayers.length === 0 && (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <ShieldAlert size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h3>No Players Found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Check your filters or register a new player profile.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        // Detailed Player Profile Screen (Requirement 3: View Player Profile)
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: '24px' }} onClick={() => setSelectedPlayer(null)}>
            Back to Roster list
          </button>

          <div className="card">
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
              {selectedPlayer.photo ? (
                <img src={selectedPlayer.photo} className="profile-photo" style={{ width: '140px', height: '140px' }} alt="" />
              ) : (
                <div className="profile-photo-placeholder" style={{ width: '140px', height: '140px' }}>
                  No Photo
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h2 style={{ fontSize: '2.25rem' }}>{selectedPlayer.name}</h2>
                  <span className={`badge badge-${selectedPlayer.status?.toLowerCase()}`}>
                    {selectedPlayer.status}
                  </span>
                </div>

                <p style={{ color: 'var(--accent-primary)', fontSize: '1.1rem', fontWeight: '600', marginTop: '6px' }}>
                  #{selectedPlayer.jerseyNumber || 'N/A'} | {selectedPlayer.position}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ASSIGNED TEAM</span>
                    <div style={{ fontWeight: '700' }}>{selectedPlayer.team?.name || 'Unassigned'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>CONTACT EMAIL</span>
                    <div style={{ fontWeight: '700' }}>{selectedPlayer.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>DATE OF BIRTH</span>
                    <div style={{ fontWeight: '700' }}>
                      {selectedPlayer.dateOfBirth ? new Date(selectedPlayer.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Season Performance Statistics</h3>
              <div className="grid-stats">
                <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--bg-tertiary)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>GOALS</div>
                  <strong style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}>{selectedPlayer.stats?.goals || 0}</strong>
                </div>
                <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--bg-tertiary)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ASSISTS</div>
                  <strong style={{ fontSize: '2rem', color: 'var(--accent-secondary)' }}>{selectedPlayer.stats?.assists || 0}</strong>
                </div>
                <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--bg-tertiary)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>APPEARANCES</div>
                  <strong style={{ fontSize: '2rem', color: 'var(--accent-info)' }}>{selectedPlayer.stats?.matchesPlayed || 0}</strong>
                </div>
                <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--bg-tertiary)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>DISCIPLINE CARDS</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '6px' }}>
                    <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{selectedPlayer.stats?.yellowCards || 0} Yellow</span>
                    <span style={{ color: 'var(--accent-danger)', fontWeight: 'bold' }}>{selectedPlayer.stats?.redCards || 0} Red</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Player Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Player Information' : 'Register New Player'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSavePlayer}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label htmlFor="playerName">Full Name</label>
                  <input
                    id="playerName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="playerEmail">Contact Email</label>
                    <input
                      id="playerEmail"
                      type="email"
                      className="form-control"
                      placeholder="e.g. player@goalsync.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="playerJersey">Jersey Number</label>
                    <input
                      id="playerJersey"
                      type="number"
                      min="1"
                      max="99"
                      className="form-control"
                      placeholder="e.g. 10"
                      value={jerseyNumber}
                      onChange={(e) => setJerseyNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="playerPosition">Position</label>
                    <select
                      id="playerPosition"
                      className="form-control"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    >
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="playerStatus">Roster Status</label>
                    <select
                      id="playerStatus"
                      className="form-control"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Injured">Injured</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="playerDob">Date of Birth</label>
                    <input
                      id="playerDob"
                      type="date"
                      className="form-control"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="playerTeam">Assign to Team</label>
                    <select
                      id="playerTeam"
                      className="form-control"
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value)}
                    >
                      <option value="">-- No Team --</option>
                      {teams.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Player Photo</label>
                  <div className="file-upload-wrapper">
                    {photo ? (
                      <>
                        <img src={photo} className="upload-preview" alt="Preview" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to replace photo</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload Player Image (.png, .jpg)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                  </div>
                </div>

                {/* Edit Stats manually if Coach/Admin editing */}
                {editId && (
                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px' }}>
                    <h4 style={{ marginBottom: '12px' }}>Edit Statistics (Override)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>Goals</label>
                        <input type="number" className="form-control" value={statsGoals} onChange={(e) => setStatsGoals(parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>Assists</label>
                        <input type="number" className="form-control" value={statsAssists} onChange={(e) => setStatsAssists(parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>Apps</label>
                        <input type="number" className="form-control" value={statsMatchesPlayed} onChange={(e) => setStatsMatchesPlayed(parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>Yellow Cards</label>
                        <input type="number" className="form-control" value={statsYellowCards} onChange={(e) => setStatsYellowCards(parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>Red Cards</label>
                        <input type="number" className="form-control" value={statsRedCards} onChange={(e) => setStatsRedCards(parseInt(e.target.value) || 0)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-header" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersView;
