import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { Plus, Edit2, Trash2, X, ShieldAlert, Award, User, Upload } from 'lucide-react';

const TeamsView = () => {
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Detail View State
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [coachId, setCoachId] = useState('');

  // Lineup Config State
  const [isLineupEditing, setIsLineupEditing] = useState(false);
  const [startingXI, setStartingXI] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [captain, setCaptain] = useState('');
  const [viceCaptain, setViceCaptain] = useState('');

  const isCoachOrAdmin = user.role === 'Admin' || user.role === 'Coach';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const allTeams = await api('/api/teams');
      setTeams(allTeams);

      if (isCoachOrAdmin) {
        const allCoaches = await api('/api/coaches');
        setCoaches(allCoaches);
        const allPlayers = await api('/api/players');
        setPlayers(allPlayers);
      }
    } catch (err) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setLogo(reader.result);
      };
      reader.onerror = (error) => {
        console.error('Error uploading file: ', error);
      };
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setLogo('');
    setCoachId('');
    setIsModalOpen(true);
  };

  const openEditModal = (team) => {
    setEditId(team._id);
    setName(team.name);
    setDescription(team.description || '');
    setLogo(team.logo || '');
    setCoachId(team.coach ? team.coach._id : '');
    setIsModalOpen(true);
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const updated = await api(`/api/teams/${editId}`, {
          method: 'PUT',
          body: { name, description, logo, coachId: coachId || null },
        });
        setTeams(teams.map(t => t._id === editId ? { ...t, ...updated } : t));
        if (selectedTeam && selectedTeam._id === editId) {
          setSelectedTeam({ ...selectedTeam, ...updated });
        }
      } else {
        const created = await api('/api/teams', {
          method: 'POST',
          body: { name, description, logo, coachId: coachId || null },
        });
        setTeams([...teams, created]);
      }
      setIsModalOpen(false);
      fetchInitialData(); // Refresh to ensure coach populate resolves
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team? All assigned roster players will be unassigned.')) return;
    try {
      await api(`/api/teams/${id}`, { method: 'DELETE' });
      setTeams(teams.filter(t => t._id !== id));
      if (selectedTeam && selectedTeam._id === id) {
        setSelectedTeam(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Lineup management triggers
  const startEditLineup = (team) => {
    setStartingXI(team.lineup?.startingXI?.map(p => p._id) || []);
    setSubstitutes(team.lineup?.substitutes?.map(p => p._id) || []);
    setCaptain(team.captain?._id || '');
    setViceCaptain(team.viceCaptain?._id || '');
    setIsLineupEditing(true);
  };

  const saveLineup = async () => {
    try {
      const updated = await api(`/api/teams/${selectedTeam._id}/lineup`, {
        method: 'PUT',
        body: { startingXI, substitutes, captain: captain || null, viceCaptain: viceCaptain || null },
      });
      
      // Re-fetch current team info to populate all fields
      const refreshedTeam = await api(`/api/teams/${selectedTeam._id}`);
      setSelectedTeam(refreshedTeam);
      
      // Update team in list
      setTeams(teams.map(t => t._id === selectedTeam._id ? refreshedTeam : t));
      setIsLineupEditing(false);
    } catch (err) {
      setError(err.message || 'Lineup save failed');
    }
  };

  const toggleStartingXI = (playerId) => {
    if (startingXI.includes(playerId)) {
      setStartingXI(startingXI.filter(id => id !== playerId));
    } else {
      if (startingXI.length >= 11) {
        alert('Starting XI is capped at 11 players maximum.');
        return;
      }
      setStartingXI([...startingXI, playerId]);
      // Remove from subs if already there
      setSubstitutes(substitutes.filter(id => id !== playerId));
    }
  };

  const toggleSubstitutes = (playerId) => {
    if (substitutes.includes(playerId)) {
      setSubstitutes(substitutes.filter(id => id !== playerId));
    } else {
      setSubstitutes([...substitutes, playerId]);
      // Remove from starting XI if already there
      setStartingXI(startingXI.filter(id => id !== playerId));
    }
  };

  // Football pitch renderer helper based on positions of starting players
  const renderPitchLineup = (lineupPlayers, captId) => {
    const goalkeeper = lineupPlayers.filter(p => p.position === 'Goalkeeper');
    const defenders = lineupPlayers.filter(p => p.position === 'Defender');
    const midfielders = lineupPlayers.filter(p => p.position === 'Midfielder');
    const forwards = lineupPlayers.filter(p => p.position === 'Forward');
    const unk = lineupPlayers.filter(p => p.position !== 'Goalkeeper' && p.position !== 'Defender' && p.position !== 'Midfielder' && p.position !== 'Forward');

    // Grouping rows
    const rows = [
      { id: 'fwd', players: forwards },
      { id: 'mid', players: midfielders },
      { id: 'def', players: defenders },
      { id: 'gk', players: goalkeeper },
    ];

    if (unk.length > 0) {
      rows[1].players = [...rows[1].players, ...unk]; // Put unks in midfield row
    }

    return (
      <div className="football-pitch">
        <div className="pitch-center-circle"></div>
        <div className="pitch-penalty-area-top"></div>
        <div className="pitch-penalty-area-bottom"></div>
        
        {rows.map(row => (
          <div key={row.id} className="pitch-row">
            {row.players.map(p => (
              <div key={p._id} className={`pitch-player-node ${p._id === captId ? 'captain' : ''}`}>
                <div className="pitch-jersey">
                  {p.jerseyNumber || '?'}
                </div>
                <span className="pitch-player-name">
                  {p.name} {p._id === captId ? '(C)' : ''}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading roster and teams records...</div>;

  return (
    <div className="page-container">
      {error && <div className="alert alert-danger">{error}</div>}

      {!selectedTeam ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Team Management</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Add teams, assign coaches, and view squad lineups.</p>
            </div>
            {user.role === 'Admin' && (
              <button className="btn btn-primary" onClick={openAddModal}>
                <Plus size={18} />
                <span>Create Team</span>
              </button>
            )}
          </div>

          <div className="grid-3col">
            {teams.map(team => (
              <div key={team._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                      <ShieldAlert size={28} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{team.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600', marginTop: '2px' }}>
                      Coach: {team.coach ? team.coach.name : 'Unassigned'}
                    </p>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1 }}>
                  {team.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <button className="btn btn-secondary" onClick={() => setSelectedTeam(team)}>
                    View squad
                  </button>

                  {user.role === 'Admin' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => openEditModal(team)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteTeam(team._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {teams.length === 0 && (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <ShieldAlert size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h3>No Teams Enrolled</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Create teams from the dashboard to populate roster listings.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        // Detailed Team squad profile
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: '24px' }} onClick={() => setSelectedTeam(null)}>
            Back to Team list
          </button>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {selectedTeam.logo && (
                  <img src={selectedTeam.logo} alt={selectedTeam.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <div>
                  <h2 style={{ fontSize: '2rem' }}>{selectedTeam.name} Squad</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>{selectedTeam.description || 'No description.'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MANAGER / COACH</div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{selectedTeam.coach ? selectedTeam.coach.name : 'None Assigned'}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2col">
            {/* Squad List */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3>Roster List ({selectedTeam.players?.length || 0} Players)</h3>
                {isCoachOrAdmin && (
                  <button className="btn btn-secondary" onClick={() => startEditLineup(selectedTeam)}>
                    Manage Lineup / Captains
                  </button>
                )}
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Jersey</th>
                      <th>Player</th>
                      <th>Position</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTeam.players && selectedTeam.players.length > 0 ? (
                      selectedTeam.players.map(player => (
                        <tr key={player._id}>
                          <td style={{ fontWeight: '800' }}>#{player.jerseyNumber || '-'}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {player.name}
                              {selectedTeam.captain && selectedTeam.captain._id === player._id && (
                                <span style={{ color: 'var(--accent-secondary)', fontSize: '0.75rem', fontWeight: 'bold' }}>(C)</span>
                              )}
                              {selectedTeam.viceCaptain && selectedTeam.viceCaptain._id === player._id && (
                                <span style={{ color: 'var(--accent-info)', fontSize: '0.75rem', fontWeight: 'bold' }}>(VC)</span>
                              )}
                            </div>
                          </td>
                          <td style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>{player.position}</td>
                          <td>
                            <span className={`badge badge-${player.status.toLowerCase()}`}>
                              {player.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No players registered to this team.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lineup Visualizer */}
            <div className="pitch-container">
              <h3>Match Starting XI Lineup</h3>
              {selectedTeam.lineup?.startingXI && selectedTeam.lineup.startingXI.length > 0 ? (
                renderPitchLineup(selectedTeam.lineup.startingXI, selectedTeam.captain?._id)
              ) : (
                <div style={{ height: '350px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', border: '1px dashed var(--border-color)' }}>
                  <User size={40} style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No starting XI selected for this team.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Roster / Lineup Editing Drawer / Modal */}
      {isLineupEditing && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h2>Configure Squad Line-up</h2>
              <button className="modal-close-btn" onClick={() => setIsLineupEditing(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ marginBottom: '12px' }}>Roster Players</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Select players to assign to starting lineup (Max 11) or substitutes list.</p>
                
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedTeam.players?.map(player => {
                    const isStarting = startingXI.includes(player._id);
                    const isSub = substitutes.includes(player._id);
                    return (
                      <div key={player._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                        <div>
                          <strong>{player.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({player.position})</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className={`btn ${isStarting ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            onClick={() => toggleStartingXI(player._id)}
                          >
                            Starting XI
                          </button>
                          <button
                            type="button"
                            className={`btn ${isSub ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            onClick={() => toggleSubstitutes(player._id)}
                          >
                            Sub
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '12px' }}>Role Assignments</h4>
                
                <div className="form-group">
                  <label>Assign Captain</label>
                  <select className="form-control" value={captain} onChange={(e) => setCaptain(e.target.value)}>
                    <option value="">-- Choose Captain --</option>
                    {selectedTeam.players?.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assign Vice Captain</label>
                  <select className="form-control" value={viceCaptain} onChange={(e) => setViceCaptain(e.target.value)}>
                    <option value="">-- Choose Vice Captain --</option>
                    {selectedTeam.players?.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong>Starting XI Count:</strong> {startingXI.length} / 11</div>
                  <div><strong>Substitutes Count:</strong> {substitutes.length}</div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', marginTop: '30px', justifyContent: 'center' }} onClick={saveLineup}>
                  Save Match Line-up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Team Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editId ? 'Edit Team Details' : 'Create New Team'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveTeam}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="teamName">Team Name</label>
                  <input
                    id="teamName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. GoalSync FC"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="teamDesc">Description</label>
                  <textarea
                    id="teamDesc"
                    className="form-control"
                    placeholder="Add team description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Team Logo</label>
                  <div className="file-upload-wrapper">
                    {logo ? (
                      <>
                        <img src={logo} className="upload-preview" alt="Logo preview" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to replace logo</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload Team Logo (.png, .jpg)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="teamCoach">Assign Coach</label>
                  <select
                    id="teamCoach"
                    className="form-control"
                    value={coachId}
                    onChange={(e) => setCoachId(e.target.value)}
                  >
                    <option value="">-- No Coach --</option>
                    {coaches.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.specialty})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-header" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsView;
