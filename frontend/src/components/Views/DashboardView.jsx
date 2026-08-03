import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { Users, Calendar, Trophy, Award, Activity, HeartPulse } from 'lucide-react';

const DashboardView = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user.role === 'Admin' || user.role === 'Coach') {
          const dashboardData = await api('/api/reports/dashboard');
          setData(dashboardData);
        } else if (user.role === 'Player') {
          // Find matching player details
          const players = await api('/api/players');
          const me = players.find(p => p.email === user.email);
          if (me) {
            setPlayerInfo(me);
          }
          // Fetch attendance details
          const attReport = await api('/api/reports/attendance');
          const myAtt = attReport.attendanceStats.find(a => a.playerName === user.name);
          setData({ myAttendance: myAtt });
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard information');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading dashboard information...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (user.role === 'Player') {
    return (
      <div className="page-container">
        <div style={{ marginBottom: '8px' }}>
          <h2>Welcome back, {user.name}!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Here is your player performance scorecard and personal profile.</p>
        </div>

        {playerInfo ? (
          <>
            <div className="grid-stats">
              <div className="card stat-card">
                <div className="stat-info">
                  <h3>Matches Played</h3>
                  <p>{playerInfo.stats?.matchesPlayed || 0}</p>
                </div>
                <div className="stat-icon blue">
                  <Activity size={24} />
                </div>
              </div>

              <div className="card stat-card">
                <div className="stat-info">
                  <h3>Goals Scored</h3>
                  <p>{playerInfo.stats?.goals || 0}</p>
                </div>
                <div className="stat-icon">
                  <Trophy size={24} />
                </div>
              </div>

              <div className="card stat-card">
                <div className="stat-info">
                  <h3>Assists Provided</h3>
                  <p>{playerInfo.stats?.assists || 0}</p>
                </div>
                <div className="stat-icon orange">
                  <Award size={24} />
                </div>
              </div>

              <div className="card stat-card">
                <div className="stat-info">
                  <h3>Attendance</h3>
                  <p>{data?.myAttendance ? `${data.myAttendance.percentage}%` : '100%'}</p>
                </div>
                <div className="stat-icon">
                  <HeartPulse size={24} />
                </div>
              </div>
            </div>

            <div className="grid-2col">
              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Player Information Profile</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  {playerInfo.photo ? (
                    <img src={playerInfo.photo} className="profile-photo" alt={playerInfo.name} />
                  ) : (
                    <div className="profile-photo-placeholder" style={{ width: '100px', height: '100px' }}>
                      No Photo
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontSize: '1.25rem' }}>{playerInfo.name}</h4>
                    <p style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{playerInfo.position}</p>
                    <table style={{ marginTop: '12px', borderCollapse: 'collapse', width: '100%' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '4px 0', color: 'var(--text-secondary)', width: '120px' }}>Jersey Number:</td>
                          <td style={{ padding: '4px 0', fontWeight: '600' }}>#{playerInfo.jerseyNumber || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 0', color: 'var(--text-secondary)' }}>Current Status:</td>
                          <td style={{ padding: '4px 0' }}>
                            <span className={`badge badge-${playerInfo.status?.toLowerCase()}`}>
                              {playerInfo.status}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 0', color: 'var(--text-secondary)' }}>Assigned Team:</td>
                          <td style={{ padding: '4px 0', fontWeight: '600' }}>{playerInfo.team?.name || 'Unassigned'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 0', color: 'var(--text-secondary)' }}>Birth Date:</td>
                          <td style={{ padding: '4px 0' }}>{playerInfo.dateOfBirth ? new Date(playerInfo.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Discipline Card Violations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>
                  <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(245,158,11,0.05)' }}>
                    <div style={{ width: '20px', height: '30px', backgroundColor: 'var(--accent-secondary)', borderRadius: '2px', margin: '0 auto 12px auto' }}></div>
                    <h5 style={{ color: 'var(--text-secondary)' }}>Yellow Cards</h5>
                    <p style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px' }}>{playerInfo.stats?.yellowCards || 0}</p>
                  </div>
                  <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(239,68,68,0.05)' }}>
                    <div style={{ width: '20px', height: '30px', backgroundColor: 'var(--accent-danger)', borderRadius: '2px', margin: '0 auto 12px auto' }}></div>
                    <h5 style={{ color: 'var(--text-secondary)' }}>Red Cards</h5>
                    <p style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px' }}>{playerInfo.stats?.redCards || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="card">
            <h3>Player Profile Pending Linkage</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              Your user profile email has not been linked to a roster player by the Coach yet. Please inform your coach to add your details with email: <strong>{user.email}</strong>.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Admin & Coach view
  return (
    <div className="page-container">
      <div>
        <h2>System Executive Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of club components, pending matchups, and tournaments.</p>
      </div>

      <div className="grid-stats">
        <div className="card stat-card">
          <div className="stat-info">
            <h3>Registered Teams</h3>
            <p>{data?.totalTeams || 0}</p>
          </div>
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-info">
            <h3>Active Players</h3>
            <p>{data?.totalPlayers || 0}</p>
          </div>
          <div className="stat-icon">
            <Activity size={24} />
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-info">
            <h3>Coaches Assigned</h3>
            <p>{data?.totalCoaches || 0}</p>
          </div>
          <div className="stat-icon orange">
            <Award size={24} />
          </div>
        </div>
      </div>

      <div className="grid-2col">
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Upcoming Scheduled Fixtures</h3>
          <div className="match-list-grid">
            {data?.upcomingMatches && data.upcomingMatches.length > 0 ? (
              data.upcomingMatches.map(match => (
                <div key={match._id} className="match-item-card" style={{ padding: '12px 18px' }}>
                  <div className="match-teams-vs" style={{ gap: '10px' }}>
                    <span style={{ fontWeight: '600' }}>{match.homeTeam?.name}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>VS</span>
                    <span style={{ fontWeight: '600' }}>{match.awayTeam ? match.awayTeam.name : match.awayTeamName}</span>
                  </div>
                  <div className="match-meta-info" style={{ width: '130px' }}>
                    <span>{new Date(match.dateTime).toLocaleDateString()}</span>
                    <span>{match.location}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No upcoming matches scheduled.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Ongoing Tournament Standings</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Teams</th>
                  <th>Fixtures</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.tournamentSummary && data.tournamentSummary.length > 0 ? (
                  data.tournamentSummary.map(tour => (
                    <tr key={tour._id}>
                      <td style={{ fontWeight: '600' }}>{tour.name}</td>
                      <td>{tour.teamCount} Teams</td>
                      <td>{tour.fixtureCount} matches</td>
                      <td>
                        <span className={`badge ${tour.status === 'Completed' ? 'badge-active' : 'badge-injured'}`}>
                          {tour.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tournament logs configured.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
