import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { Plus, X, Calendar, Clock, Activity, CheckSquare } from 'lucide-react';

const TrainingView = () => {
  const { user } = useContext(AuthContext);
  const [trainings, setTrainings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals / Attendance states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]); // [{ playerId, status }]

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [teamId, setTeamId] = useState('');
  const [duration, setDuration] = useState(90);

  const isCoachOrAdmin = user.role === 'Admin' || user.role === 'Coach';

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    setLoading(true);
    try {
      const allTrainings = await api('/api/training');
      setTrainings(allTrainings);

      const allTeams = await api('/api/teams');
      setTeams(allTeams);
    } catch (err) {
      setError(err.message || 'Error loading training records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTraining = async (e) => {
    e.preventDefault();
    try {
      const newSession = await api('/api/training', {
        method: 'POST',
        body: { title, description, dateTime, teamId, duration },
      });
      setTrainings([newSession, ...trainings]);
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setDateTime('');
      setTeamId('');
      setDuration(90);
      fetchTrainingData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openAttendanceTracker = (session) => {
    setActiveSession(session);
    // Initialize attendance status mappings from populated playersAttended
    const initialRecords = session.playersAttended.map(record => ({
      playerId: record.player?._id || record.player,
      name: record.player?.name || 'Unknown',
      jersey: record.player?.jerseyNumber || '-',
      status: record.status || 'Present',
    }));
    setAttendanceRecords(initialRecords);
  };

  const updateIndividualStatus = (playerId, newStatus) => {
    setAttendanceRecords(
      attendanceRecords.map(rec => rec.playerId === playerId ? { ...rec, status: newStatus } : rec)
    );
  };

  const handleSaveAttendance = async () => {
    try {
      const formatted = attendanceRecords.map(r => ({
        playerId: r.playerId,
        status: r.status,
      }));

      const updated = await api(`/api/training/${activeSession._id}/attendance`, {
        method: 'PUT',
        body: { attendance: formatted },
      });

      setTrainings(trainings.map(t => t._id === activeSession._id ? updated : t));
      alert('Attendance saved successfully!');
      setActiveSession(null);
      fetchTrainingData();
    } catch (err) {
      setError(err.message || 'Failed to save attendance logs');
    }
  };

  const deleteTrainingSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training session?')) return;
    try {
      await api(`/api/training/${id}`, { method: 'DELETE' });
      setTrainings(trainings.filter(t => t._id !== id));
      if (activeSession && activeSession._id === id) {
        setActiveSession(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading training schedules...</div>;

  return (
    <div className="page-container">
      {error && <div className="alert alert-danger">{error}</div>}

      {!activeSession ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Training Logs & Attendance</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Schedule training drills, record squad attendance, and log workout details.</p>
            </div>
            {isCoachOrAdmin && (
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} />
                <span>Schedule Session</span>
              </button>
            )}
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Assigned Team</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Attendance Marked</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainings.map(session => {
                  const presentCount = session.playersAttended?.filter(p => p.status === 'Present').length || 0;
                  const totalCount = session.playersAttended?.length || 0;
                  const isMarked = totalCount > 0;

                  return (
                    <tr key={session._id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{session.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{session.description || 'No notes.'}</div>
                      </td>
                      <td style={{ fontWeight: '600' }}>{session.team?.name || 'Unassigned'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} style={{ color: 'var(--accent-primary)' }} />
                          {new Date(session.dateTime).toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                          {session.duration} Mins
                        </div>
                      </td>
                      <td>
                        {isMarked ? (
                          <span className="badge badge-active" style={{ fontSize: '0.8rem' }}>
                            {presentCount} / {totalCount} Present
                          </span>
                        ) : (
                          <span className="badge badge-injured" style={{ fontSize: '0.8rem' }}>
                            No Records
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {isCoachOrAdmin && (
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => openAttendanceTracker(session)}>
                              <CheckSquare size={14} />
                              <span>Mark Attendance</span>
                            </button>
                          )}
                          {!isCoachOrAdmin && (
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => openAttendanceTracker(session)}>
                              <span>View List</span>
                            </button>
                          )}
                          {isCoachOrAdmin && (
                            <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => deleteTrainingSession(session._id)}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {trainings.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      <Activity size={32} style={{ margin: '0 auto 10px auto', display: 'block' }} />
                      No training sessions logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        // Attendance Form tracker view
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: '24px' }} onClick={() => setActiveSession(null)}>
            Back to Sessions
          </button>

          <div className="card">
            <h3 style={{ marginBottom: '8px' }}>Attendance Log: {activeSession.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Team: <strong>{activeSession.team?.name}</strong> | Date: {new Date(activeSession.dateTime).toLocaleDateString()}
            </p>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Jersey</th>
                    <th>Player</th>
                    <th>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map(record => (
                    <tr key={record.playerId}>
                      <td style={{ fontWeight: '800' }}>#{record.jersey}</td>
                      <td style={{ fontWeight: '600' }}>{record.name}</td>
                      <td>
                        {isCoachOrAdmin ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className={`btn ${record.status === 'Present' ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                              onClick={() => updateIndividualStatus(record.playerId, 'Present')}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              className={`btn ${record.status === 'Absent' ? 'btn-danger' : 'btn-secondary'}`}
                              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                              onClick={() => updateIndividualStatus(record.playerId, 'Absent')}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              className={`btn ${record.status === 'Excused' ? 'btn-warning' : 'btn-secondary'}`}
                              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                              onClick={() => updateIndividualStatus(record.playerId, 'Excused')}
                            >
                              Excused
                            </button>
                          </div>
                        ) : (
                          <span className={`badge ${record.status === 'Present' ? 'badge-active' : record.status === 'Absent' ? 'badge-suspended' : 'badge-injured'}`}>
                            {record.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isCoachOrAdmin && (
              <button className="btn btn-primary" style={{ marginTop: '24px', width: '200px', justifyContent: 'center' }} onClick={handleSaveAttendance}>
                Save Attendance Sheet
              </button>
            )}
          </div>
        </div>
      )}

      {/* Schedule Training Session Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Schedule Training Session</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTraining}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="sessionTitle">Session Title</label>
                  <input
                    id="sessionTitle"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Tactical Corner Plays"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sessionDesc">Focus / Description</label>
                  <textarea
                    id="sessionDesc"
                    className="form-control"
                    placeholder="E.g. Focus on defense positioning, physical conditioning, keeper drills..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sessionTeam">Target Squad</label>
                  <select
                    id="sessionTeam"
                    className="form-control"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Team --</option>
                    {teams.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="sessionTime">Schedule Time</label>
                    <input
                      id="sessionTime"
                      type="datetime-local"
                      className="form-control"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sessionDur">Duration (Mins)</label>
                    <input
                      id="sessionDur"
                      type="number"
                      min="30"
                      max="300"
                      className="form-control"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 90)}
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
                  Save Training Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingView;
