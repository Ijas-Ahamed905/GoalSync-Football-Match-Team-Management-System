import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { Plus, Edit2, Trash2, X, Upload, ShieldAlert, Award } from 'lucide-react';

const CoachesView = () => {
  const { user } = useContext(AuthContext);
  const [coaches, setCoaches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('General');
  const [experience, setExperience] = useState('');
  const [teamId, setTeamId] = useState('');
  const [photo, setPhoto] = useState('');

  const isAdmin = user.role === 'Admin';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const allCoaches = await api('/api/coaches');
      setCoaches(allCoaches);

      const allTeams = await api('/api/teams');
      setTeams(allTeams);
    } catch (err) {
      setError(err.message || 'Error fetching coaches registry');
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
    setSpecialty('General');
    setExperience('');
    setTeamId('');
    setPhoto('');
    setIsModalOpen(true);
  };

  const openEditModal = (coach) => {
    setEditId(coach._id);
    setName(coach.name);
    setEmail(coach.email || '');
    setSpecialty(coach.specialty || 'General');
    setExperience(coach.experience || '');
    setTeamId(coach.team ? coach.team._id || coach.team : '');
    setPhoto(coach.photo || '');
    setIsModalOpen(true);
  };

  const handleSaveCoach = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email: email || undefined,
        specialty,
        experience: experience ? parseInt(experience) : 0,
        teamId: teamId || null,
        photo,
      };

      if (editId) {
        const updated = await api(`/api/coaches/${editId}`, {
          method: 'PUT',
          body: payload,
        });
        setCoaches(coaches.map(c => c._id === editId ? { ...c, ...updated } : c));
      } else {
        const created = await api('/api/coaches', {
          method: 'POST',
          body: payload,
        });
        setCoaches([...coaches, created]);
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      setError(err.message || 'Error occurred while saving coach profile');
    }
  };

  const handleDeleteCoach = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coach profile?')) return;
    try {
      await api(`/api/coaches/${id}`, { method: 'DELETE' });
      setCoaches(coaches.filter(c => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading coaches database...</div>;

  return (
    <div className="page-container">
      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Coach Directory Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Configure training specialties, experience profiles, and manager roster details.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>Add Coach</span>
          </button>
        )}
      </div>

      <div className="profile-grid">
        {coaches.map(coach => (
          <div key={coach._id} className="card profile-card">
            {coach.photo ? (
              <img src={coach.photo} className="profile-photo" alt={coach.name} />
            ) : (
              <div className="profile-photo-placeholder">
                <span>No Image</span>
              </div>
            )}

            <div className="profile-details">
              <h3>{coach.name}</h3>
              <p style={{ color: 'var(--accent-primary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                {coach.specialty} Coach
              </p>
              <table style={{ marginTop: '12px', borderCollapse: 'collapse', width: '100%', fontSize: '0.8rem' }}>
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)', padding: '2px 0' }}>Experience:</td>
                    <td style={{ fontWeight: '600', padding: '2px 0' }}>{coach.experience} Years</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)', padding: '2px 0' }}>Team:</td>
                    <td style={{ fontWeight: '600', padding: '2px 0' }}>{coach.team?.name || 'Unassigned'}</td>
                  </tr>
                  {coach.email && (
                    <tr>
                      <td style={{ color: 'var(--text-secondary)', padding: '2px 0' }}>Email:</td>
                      <td style={{ fontWeight: '600', padding: '2px 0', wordBreak: 'break-all' }}>{coach.email}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {isAdmin && (
              <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: 'auto' }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEditModal(coach)}>
                  Edit Profile
                </button>
                <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteCoach(coach._id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}

        {coaches.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <Award size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3>No Coaches Registered</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Add trainers and staff profiles to assign to squad templates.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Coach Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editId ? 'Edit Coach Details' : 'Register New Coach'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCoach}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="coachName">Full Name</label>
                  <input
                    id="coachName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Coach Ferguson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="coachEmail">Contact Email</label>
                    <input
                      id="coachEmail"
                      type="email"
                      className="form-control"
                      placeholder="coach@goalsync.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="coachExp">Experience (Years)</label>
                    <input
                      id="coachExp"
                      type="number"
                      min="0"
                      max="60"
                      className="form-control"
                      placeholder="e.g. 10"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="coachSpec">Specialty / Category</label>
                    <select
                      id="coachSpec"
                      className="form-control"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                    >
                      <option value="General">General Manager</option>
                      <option value="Tactical">Tactical Instructor</option>
                      <option value="Goalkeeping">Goalkeeper Trainer</option>
                      <option value="Fitness">Fitness Coach</option>
                      <option value="Defense">Defense Specialist</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="coachTeam">Assign to Team</label>
                    <select
                      id="coachTeam"
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
                  <label>Coach Photo</label>
                  <div className="file-upload-wrapper">
                    {photo ? (
                      <>
                        <img src={photo} className="upload-preview" alt="Preview" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to replace image</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload Profile Image (.png, .jpg)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                  </div>
                </div>
              </div>
              <div className="modal-header" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachesView;
