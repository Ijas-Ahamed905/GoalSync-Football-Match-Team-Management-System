import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { FileText, Printer, Download } from 'lucide-react';

const ReportsView = () => {
  const [reportType, setReportType] = useState('players');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (reportType === 'players') {
        data = await api('/api/reports/players');
      } else if (reportType === 'teams') {
        data = await api('/api/reports/teams');
      } else if (reportType === 'matches') {
        data = await api('/api/reports/matches');
      } else if (reportType === 'tournaments') {
        data = await api('/api/reports/tournaments');
      } else if (reportType === 'attendance') {
        data = await api('/api/reports/attendance');
      } else if (reportType === 'goals') {
        data = await api('/api/reports/goals');
      }
      setReportData(data);
    } catch (err) {
      setError(err.message || 'Failed to generate report query');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderReportContent = () => {
    if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Compiling report records...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!reportData) return null;

    switch (reportType) {
      case 'players':
        return (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Email</th>
                  <th>Position</th>
                  <th>Jersey</th>
                  <th>Team</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(player => (
                  <tr key={player._id}>
                    <td style={{ fontWeight: '600' }}>{player.name}</td>
                    <td>{player.email || 'N/A'}</td>
                    <td>{player.position}</td>
                    <td style={{ fontWeight: '800' }}>#{player.jerseyNumber || '-'}</td>
                    <td style={{ fontWeight: '600' }}>{player.team?.name || 'Unassigned'}</td>
                    <td>
                      <span className={`badge badge-${player.status.toLowerCase()}`}>
                        {player.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'teams':
        return (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Coach Assigned</th>
                  <th>Registered Players</th>
                  <th>Captain</th>
                  <th>Vice Captain</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(team => (
                  <tr key={team._id}>
                    <td style={{ fontWeight: '700' }}>{team.name}</td>
                    <td>{team.coach}</td>
                    <td>{team.playerCount} Players</td>
                    <td style={{ fontWeight: '600' }}>{team.captain}</td>
                    <td style={{ fontWeight: '600' }}>{team.viceCaptain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'matches':
        return (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Home Team</th>
                  <th>Score</th>
                  <th>Away Team / Opponent</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(match => (
                  <tr key={match._id}>
                    <td style={{ fontWeight: '600' }}>{match.homeTeam?.name}</td>
                    <td style={{ fontWeight: '800', textAlign: 'center' }}>
                      {match.status === 'Completed' ? `${match.score?.home} - ${match.score?.away}` : 'VS'}
                    </td>
                    <td style={{ fontWeight: '600' }}>{match.awayTeam ? match.awayTeam.name : match.awayTeamName}</td>
                    <td>{new Date(match.dateTime).toLocaleString()}</td>
                    <td>{match.location}</td>
                    <td>
                      <span className={`badge ${match.status === 'Completed' ? 'badge-active' : 'badge-injured'}`}>
                        {match.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'tournaments':
        return (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tournament Name</th>
                  <th>Teams count</th>
                  <th>Fixtures count</th>
                  <th>Winner / Champion</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(tour => (
                  <tr key={tour._id}>
                    <td style={{ fontWeight: '700' }}>{tour.name}</td>
                    <td>{tour.teams ? tour.teams.length : 0} Teams</td>
                    <td>{tour.fixtures ? tour.fixtures.length : 0} Matches</td>
                    <td style={{ color: 'var(--accent-secondary)', fontWeight: '700' }}>
                      {tour.winner ? tour.winner.name : 'Not Decided'}
                    </td>
                    <td>
                      <span className={`badge ${tour.status === 'Completed' ? 'badge-active' : 'badge-injured'}`}>
                        {tour.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'attendance':
        return (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Squad</th>
                  <th>Drills Scheduled</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Excused</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {reportData.attendanceStats?.map(record => (
                  <tr key={record.playerId}>
                    <td style={{ fontWeight: '600' }}>{record.playerName}</td>
                    <td style={{ fontWeight: '500' }}>{record.teamName}</td>
                    <td>{record.sessionsListed} Drill Sessions</td>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{record.sessionsPresent}</td>
                    <td style={{ color: 'var(--accent-danger)', fontWeight: '600' }}>{record.sessionsAbsent}</td>
                    <td style={{ color: 'var(--accent-secondary)', fontWeight: '600' }}>{record.sessionsExcused}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', width: '45px' }}>{record.percentage}%</span>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                          <div style={{ width: `${record.percentage}%`, height: '100%', backgroundColor: record.percentage > 75 ? 'var(--accent-primary)' : 'var(--accent-secondary)' }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'goals':
        return (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player Name</th>
                  <th>Assigned Team</th>
                  <th>Matches Played</th>
                  <th>Goals Scored</th>
                  <th>Assists Provided</th>
                  <th>Yellow / Red Cards</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((player, index) => (
                  <tr key={player._id}>
                    <td style={{ fontWeight: '800', color: 'var(--accent-secondary)' }}>#{index + 1}</td>
                    <td style={{ fontWeight: '600' }}>{player.name}</td>
                    <td style={{ fontWeight: '500' }}>{player.team?.name || 'Unassigned'}</td>
                    <td>{player.stats?.matchesPlayed || 0}</td>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: '800', fontSize: '1.05rem' }}>{player.stats?.goals || 0}</td>
                    <td style={{ color: 'var(--accent-secondary)', fontWeight: '600' }}>{player.stats?.assists || 0}</td>
                    <td>
                      <span style={{ color: 'var(--accent-secondary)' }}>{player.stats?.yellowCards || 0} Y</span> /{' '}
                      <span style={{ color: 'var(--accent-danger)' }}>{player.stats?.redCards || 0} R</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Club Reports & Analytics</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Compile details for rosters, league fixture statistics, scorer boards, and attendances.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handlePrint} disabled={loading || error}>
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <label style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select Report Category</label>
        <select
          className="select-filter"
          style={{ minWidth: '220px' }}
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="players">Player Details List</option>
          <option value="teams">Teams Summary Breakdown</option>
          <option value="matches">Matches Schedule & Scores</option>
          <option value="tournaments">Tournaments & Standing History</option>
          <option value="attendance">Squad Attendance Percentage</option>
          <option value="goals">Goal Scorers Leaderboard</option>
        </select>
      </div>

      <div className="card" style={{ padding: '32px' }} id="printable-report-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
              {reportType === 'players' && 'Players Roster Directory Report'}
              {reportType === 'teams' && 'Club Squad Summary Directory'}
              {reportType === 'matches' && 'Club Match Results Ledger'}
              {reportType === 'tournaments' && 'Regional League Cup Standings'}
              {reportType === 'attendance' && 'Squad Attendance Performance Log'}
              {reportType === 'goals' && 'Top Scorers Season Leaderboard'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GoalSync Club Management Systems API</span>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div>Date Compiled: {new Date().toLocaleDateString()}</div>
            <div>Status: Verified Official</div>
          </div>
        </div>

        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportsView;
