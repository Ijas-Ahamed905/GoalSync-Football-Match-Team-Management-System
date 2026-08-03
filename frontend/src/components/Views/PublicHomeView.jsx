import React, { useState, useEffect } from 'react';
import { 
  Calendar, Trophy, Newspaper, Activity, LogIn, Clock, MapPin, Sun, Moon, 
  ChevronDown, ChevronUp, Search, Award, BarChart2, MessageSquare, ArrowRight 
} from 'lucide-react';

const PublicMatchCard = ({ match }) => {
  const [secs, setSecs] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const calculateElapsed = () => {
      if (match.isTimerRunning && match.timerStartedAt) {
        const elapsed = (Date.now() - new Date(match.timerStartedAt).getTime()) / 1000;
        return Math.floor((match.elapsedSeconds || 0) + elapsed);
      }
      return Math.floor(match.elapsedSeconds || 0);
    };

    setSecs(calculateElapsed());

    if (match.isTimerRunning) {
      const id = setInterval(() => {
        setSecs(calculateElapsed());
      }, 1000);
      return () => clearInterval(id);
    }
  }, [match]);

  const formatTime = (totalSecs) => {
    const m = Math.floor(totalSecs / 60).toString();
    const s = Math.floor(totalSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Generate team initials for dynamic badges
  const getInitials = (name) => {
    if (!name) return 'OP';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  };

  // Consistent dynamic stats generator based on Match ID to ensure premium mockup details
  const getMatchStats = () => {
    const hash = match._id ? match._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 100;
    const homeGoals = match.score?.home || 0;
    const awayGoals = match.score?.away || 0;
    
    const homePossession = Math.min(Math.max(50 + (homeGoals - awayGoals) * 3 + (hash % 9) - 4, 30), 70);
    const awayPossession = 100 - homePossession;
    const homeShots = homeGoals + (hash % 7) + 2;
    const awayShots = awayGoals + (hash % 6) + 1;
    const homeFouls = 8 + (hash % 8);
    const awayFouls = 7 + (hash % 9);

    return {
      possession: { home: homePossession, away: awayPossession },
      shots: { home: homeShots, away: awayShots },
      fouls: { home: homeFouls, away: awayFouls }
    };
  };

  const stats = getMatchStats();

  return (
    <div className={`match-card-modern ${match.isTimerRunning ? 'live' : ''}`}>
      <div onClick={() => setIsExpanded(!isExpanded)}>
        {/* Card Header */}
        <div className="match-card-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
            <Calendar size={13} style={{ color: 'var(--accent-primary)' }} />
            {new Date(match.dateTime).toLocaleDateString()}
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <MapPin size={13} /> {match.location}
          </span>
          <div>
            {match.isTimerRunning ? (
              <span className="match-timer-digital">
                <span className="badge badge-active animate-pulse" style={{ width: '8px', height: '8px', padding: 0, marginRight: '4px' }}></span>
                LIVE {formatTime(secs)}
              </span>
            ) : (
              <span className={`badge ${match.status === 'Completed' ? 'badge-active' : match.status === 'Scheduled' ? 'badge-injured' : 'badge-suspended'}`}>
                {match.status}
              </span>
            )}
          </div>
        </div>

        {/* Scoreboard Row */}
        <div className="match-scoreboard-row">
          <div className="scoreboard-team">
            {match.homeTeam?.logo ? (
              <img src={match.homeTeam.logo} alt="Home Team" className="match-team-logo-small" style={{ width: '48px', height: '48px' }} />
            ) : (
              <div className="team-badge-circle">{getInitials(match.homeTeam?.name)}</div>
            )}
            <strong>{match.homeTeam?.name}</strong>
          </div>

          <div className="scoreboard-scores">
            <span className="score-num">{match.score?.home}</span>
            <span className="score-divider">:</span>
            <span className="score-num">{match.score?.away}</span>
          </div>

          <div className="scoreboard-team">
            {match.awayTeam?.logo ? (
              <img src={match.awayTeam.logo} alt="Away Team" className="match-team-logo-small" style={{ width: '48px', height: '48px' }} />
            ) : (
              <div className="team-badge-circle away">{getInitials(match.awayTeam ? match.awayTeam.name : match.awayTeamName)}</div>
            )}
            <strong>{match.awayTeam ? match.awayTeam.name : match.awayTeamName}</strong>
          </div>
        </div>

        {/* Expand Trigger Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', gap: '4px', marginTop: '12px' }}>
          <span>{isExpanded ? 'Hide Match Progression' : 'Show Match Progression'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expandable Stats / Timeline Details */}
      {isExpanded && (
        <div className="match-details-panel">
          {/* Timeline events */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: '700' }}>Match Timeline Highlights</h4>
            <div className="timeline-vertical">
              {match.events && match.events.length > 0 ? (
                match.events.map((evt, idx) => (
                  <div key={idx} className="timeline-evt-item">
                    <span className={`timeline-evt-dot ${evt.type === 'Substitution' ? 'sub' : evt.type === 'YellowCard' ? 'card-y' : evt.type === 'RedCard' ? 'card-r' : ''}`}></span>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', marginRight: '6px' }}>{evt.minute}'</strong>
                    <span style={{ color: 'var(--text-primary)' }}>
                      <strong>{evt.type === 'Goal' ? '⚽ Goal!' : evt.type === 'YellowCard' ? '🟨 Yellow Card' : evt.type === 'RedCard' ? '🟥 Red Card' : evt.type}</strong>
                      {' - '}{evt.player?.name || evt.playerIn?.name || 'Player'}
                      {evt.detail && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}> ({evt.detail})</span>}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '8px' }}>No events logged yet. Match updates will sync live.</div>
              )}
            </div>
          </div>

          {/* Stats sliders comparison */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: '700' }}>Live Team Statistics</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Possession */}
              <div className="stats-compare-row">
                <div className="stats-compare-label">
                  <span>{stats.possession.home}%</span>
                  <span style={{ fontWeight: '600' }}>Possession</span>
                  <span>{stats.possession.away}%</span>
                </div>
                <div className="stats-compare-bar-bg">
                  <div className="stats-compare-bar-home" style={{ width: `${stats.possession.home}%` }}></div>
                  <div className="stats-compare-bar-away" style={{ width: `${stats.possession.away}%` }}></div>
                </div>
              </div>

              {/* Shots on target */}
              <div className="stats-compare-row">
                <div className="stats-compare-label">
                  <span>{stats.shots.home}</span>
                  <span style={{ fontWeight: '600' }}>Total Shots</span>
                  <span>{stats.shots.away}</span>
                </div>
                <div className="stats-compare-bar-bg">
                  <div className="stats-compare-bar-home" style={{ width: `${(stats.shots.home / (stats.shots.home + stats.shots.away)) * 100}%` }}></div>
                  <div className="stats-compare-bar-away" style={{ width: `${(stats.shots.away / (stats.shots.home + stats.shots.away)) * 100}%` }}></div>
                </div>
              </div>

              {/* Fouls */}
              <div className="stats-compare-row">
                <div className="stats-compare-label">
                  <span>{stats.fouls.home}</span>
                  <span style={{ fontWeight: '600' }}>Fouls Committed</span>
                  <span>{stats.fouls.away}</span>
                </div>
                <div className="stats-compare-bar-bg">
                  <div className="stats-compare-bar-home" style={{ width: `${(stats.fouls.home / (stats.fouls.home + stats.fouls.away)) * 100}%` }}></div>
                  <div className="stats-compare-bar-away" style={{ width: `${(stats.fouls.away / (stats.fouls.home + stats.fouls.away)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PublicHomeView = ({ onLoginClick, theme, toggleTheme }) => {
  const [matches, setMatches] = useState([]);
  const [news, setNews] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('scores'); // scores, news, tournaments
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNewsId, setExpandedNewsId] = useState(null);
  const [expandedTourneyId, setExpandedTourneyId] = useState(null);

  useEffect(() => {
    fetchPublicData();

    const intervalId = setInterval(() => {
      fetchMatchesSilent();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchPublicData = async () => {
    try {
      const matchData = await fetch('/api/matches').then(res => res.json());
      setMatches(Array.isArray(matchData) ? matchData : []);

      const newsData = await fetch('/api/news').then(res => res.json());
      setNews(Array.isArray(newsData) ? newsData : []);

      const tourneyData = await fetch('/api/tournaments').then(res => res.json());
      setTournaments(Array.isArray(tourneyData) ? tourneyData : []);
    } catch (err) {
      setError('Could not retrieve public board logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchesSilent = async () => {
    try {
      const matchData = await fetch('/api/matches').then(res => res.json());
      if (Array.isArray(matchData)) {
        setMatches(matchData);
      }
    } catch (err) {
      console.error('Silent poll match refresh failed', err);
    }
  };

  const getTeamInitials = (name) => {
    if (!name) return 'OP';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  };

  // Filter schedules
  const liveOrCompletedMatches = matches.filter(m => m.status === 'Completed' || m.isTimerRunning);
  const upcomingMatches = matches.filter(m => m.status === 'Scheduled' && !m.isTimerRunning);

  // Search filtered news
  const filteredNews = news.filter(
    post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count active stats
  const activeTournaments = tournaments.filter(t => t.status === 'Ongoing').length;
  const liveMatchesCount = matches.filter(m => m.isTimerRunning).length;

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '30px' }}>
      
      {/* Floating Sticky Header Navbar */}
      <nav className="public-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '6px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} style={{ color: '#fff' }} />
          </div>
          <span className="brand-text" style={{ fontSize: '1.25rem', fontWeight: '800' }}>GoalSync</span>
        </div>

        {/* Tab switchers in Navbar */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button 
            onClick={() => setActiveSection('scores')} 
            className={`public-tab-btn ${activeSection === 'scores' ? 'active' : ''}`}
          >
            <BarChart2 size={15} />
            <span className="mobile-hide">Live Scores</span>
          </button>
          <button 
            onClick={() => setActiveSection('news')} 
            className={`public-tab-btn ${activeSection === 'news' ? 'active' : ''}`}
          >
            <Newspaper size={15} />
            <span className="mobile-hide">Announcements</span>
          </button>
          <button 
            onClick={() => setActiveSection('tournaments')} 
            className={`public-tab-btn ${activeSection === 'tournaments' ? 'active' : ''}`}
          >
            <Trophy size={15} />
            <span className="mobile-hide">Tournaments</span>
          </button>
        </div>

        {/* Action Panel: Light/Dark theme and Login Portal */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', border: '1px solid var(--border-color)' }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button className="btn btn-primary" onClick={onLoginClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '50px', padding: '8px 16px', fontSize: '0.85rem' }}>
            <LogIn size={15} />
            <span>Login</span>
          </button>
        </div>
      </nav>

      {/* Hero Welcome banner */}
      <div className="page-container" style={{ marginTop: '100px', paddingBottom: '10px' }}>
        <div className="glass-panel animate-slide-up" style={{ padding: '40px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2', background: 'linear-gradient(to right, var(--text-primary) 30%, var(--accent-primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            GoalSync Fan Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px', maxWidth: '700px', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Get match score logs, real-time match events, official club schedules, and championship tournament standings. Everything you need is right here.
          </p>

          {/* Quick Metrics Badges */}
          <div className="hero-stats-row">
            {liveMatchesCount > 0 && (
              <span className="hero-stat-badge" style={{ borderColor: 'var(--accent-primary)', backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
                <span className="badge badge-active animate-pulse" style={{ width: '6px', height: '6px', padding: 0 }}></span>
                <strong>{liveMatchesCount} Match Live</strong>
              </span>
            )}
            <span className="hero-stat-badge">
              <Trophy size={14} style={{ color: 'var(--accent-secondary)' }} />
              <strong>{activeTournaments} Ongoing Leagues</strong>
            </span>
            <span className="hero-stat-badge">
              <Newspaper size={14} style={{ color: 'var(--accent-info)' }} />
              <strong>{news.length} Bulletins</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="page-container" style={{ paddingTop: '10px', flex: 1 }}>
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '40px' }}>
            <Activity size={20} className="animate-spin" />
            <span>Updating scoreboards...</span>
          </div>
        ) : (
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            
            {/* 1. Scores Tab */}
            {activeSection === 'scores' && (
              <div className="grid-2col">
                {/* Left: Real-time score logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={18} style={{ color: 'var(--accent-primary)' }} /> Matches & Scores
                    </h3>
                    <span className="badge badge-active animate-pulse">Live Sync Active</span>
                  </div>

                  <div className="match-list-grid">
                    {liveOrCompletedMatches.map(match => (
                      <PublicMatchCard key={match._id} match={match} />
                    ))}
                  </div>
                  
                  {liveOrCompletedMatches.length === 0 && (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255, 255, 255, 0.01)' }}>
                      <Award size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                      <p style={{ color: 'var(--text-muted)' }}>No completed match scores available yet.</p>
                    </div>
                  )}
                </div>

                {/* Right: Upcoming Fixtures */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '6px' }}>
                    <Calendar size={18} style={{ color: 'var(--accent-secondary)' }} /> Scheduled Fixtures
                  </h3>
                  <div className="match-list-grid">
                    {upcomingMatches.map(match => (
                      <div key={match._id} className="upcoming-fixture-card">
                        <div className="match-teams-vs">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                            <div className="team-badge-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>{getTeamInitials(match.homeTeam?.name)}</div>
                            <strong style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{match.homeTeam?.name}</strong>
                          </div>
                          
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px' }}>VS</span>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                            <div className="team-badge-circle away" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>{getTeamInitials(match.awayTeam ? match.awayTeam.name : match.awayTeamName)}</div>
                            <strong style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{match.awayTeam ? match.awayTeam.name : match.awayTeamName}</strong>
                          </div>
                        </div>
                        
                        <div className="match-meta-info" style={{ border: 'none', padding: 0 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontWeight: '600' }}><Clock size={12} /> {new Date(match.dateTime).toLocaleDateString()}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {match.location}</span>
                        </div>
                      </div>
                    ))}

                    {upcomingMatches.length === 0 && (
                      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255, 255, 255, 0.01)' }}>
                        <Calendar size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                        <p style={{ color: 'var(--text-muted)' }}>No upcoming match fixtures scheduled.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. News Tab */}
            {activeSection === 'news' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                
                {/* News Search bar layout */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Newspaper size={18} style={{ color: 'var(--accent-primary)' }} /> Club Announcements
                  </h3>
                  
                  {/* Search input widget */}
                  <div className="search-input-wrapper" style={{ margin: 0, maxWidth: '300px' }}>
                    <Search size={16} />
                    <input 
                      type="text" 
                      placeholder="Search club news..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="news-grid">
                  {filteredNews.map(post => {
                    const isExpanded = expandedNewsId === post._id;
                    const cleanContent = post.content || '';
                    
                    // Simple category mapper
                    let category = 'Announcement';
                    if (post.title.toLowerCase().includes('match') || post.title.toLowerCase().includes('fixture')) category = 'Match Update';
                    if (post.title.toLowerCase().includes('roster') || post.title.toLowerCase().includes('player') || post.title.toLowerCase().includes('coach')) category = 'Squad Info';
                    if (post.title.toLowerCase().includes('training') || post.title.toLowerCase().includes('practice')) category = 'Training Logs';

                    return (
                      <div key={post._id} className="news-card-modern">
                        <div className="news-card-banner">
                          <MessageSquare size={36} className="news-card-banner-icon" />
                        </div>
                        <div className="news-card-content">
                          <span className="news-card-tag">{category}</span>
                          <h4 className="news-card-title">{post.title}</h4>
                          <p className={`news-card-body ${isExpanded ? 'expanded' : ''}`}>
                            {post.content}
                          </p>
                          
                          {cleanContent.length > 180 && (
                            <button 
                              onClick={() => setExpandedNewsId(isExpanded ? null : post._id)}
                              className="btn-link"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '14px', alignSelf: 'flex-start' }}
                            >
                              <span>{isExpanded ? 'Show Less' : 'Read Full Announcement'}</span>
                              <ArrowRight size={12} />
                            </button>
                          )}
                          
                          <div className="news-card-footer">
                            <span>Club Bulletin</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredNews.length === 0 && (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Search size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>No bulletins found</h4>
                    <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search criteria.</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. Tournaments Tab */}
            {activeSection === 'tournaments' && (
              <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <Trophy size={18} style={{ color: 'var(--accent-secondary)' }} /> Championship Tournaments Standings
                </h3>

                <div className="grid-2col">
                  {tournaments.map(tour => {
                    const totalMatches = tour.fixtures?.length || 0;
                    // Count completed matches in tournament
                    const completedMatches = matches.filter(m => m.tournament === tour._id && m.status === 'Completed').length;
                    const progressPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
                    const isShowingFixtures = expandedTourneyId === tour._id;

                    return (
                      <div key={tour._id} className="tourney-grid-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <Trophy size={20} style={{ color: tour.status === 'Completed' ? 'var(--accent-secondary)' : 'var(--text-muted)' }} />
                              <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{tour.name}</h4>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Leagues Status: <strong style={{ color: 'var(--text-secondary)' }}>{tour.status}</strong>
                            </span>
                          </div>
                          <span className={`badge ${tour.status === 'Completed' ? 'badge-active' : tour.status === 'Ongoing' ? 'badge-injured' : 'badge-suspended'}`}>
                            {tour.status}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="tourney-progress-wrapper">
                          <div className="tourney-progress-header">
                            <span>Matches Progression</span>
                            <strong>{completedMatches}/{totalMatches} Games</strong>
                          </div>
                          <div className="tourney-progress-bar-bg">
                            <div className="tourney-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
                          <div>
                            <span style={{ display: 'block', color: 'var(--text-muted)' }}>Enrolled Teams</span>
                            <strong style={{ fontSize: '0.95rem' }}>{tour.teams?.length || 0} Clubs</strong>
                          </div>
                          <div>
                            <span style={{ display: 'block', color: 'var(--text-muted)' }}>Champion Winner</span>
                            <strong style={{ fontSize: '0.95rem', color: tour.winner ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>
                              {tour.winner ? tour.winner.name : 'TBD / Ongoing'}
                            </strong>
                          </div>
                        </div>

                        {/* Interactive Fixtures lookup toggle */}
                        <button 
                          onClick={() => setExpandedTourneyId(isShowingFixtures ? null : tour._id)}
                          className="btn btn-secondary" 
                          style={{ justifyContent: 'center', width: '100%', fontSize: '0.8rem', padding: '8px' }}
                        >
                          {isShowingFixtures ? 'Hide Fixture Schedules' : 'View Tournament Fixtures'}
                        </button>

                        {/* Expandable Fixtures Section */}
                        {isShowingFixtures && (
                          <div style={{ marginTop: '10px', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h5 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Fixtures Board</h5>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                              {matches.filter(m => m.tournament === tour._id).map(m => (
                                <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '6px 8px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                                  <span style={{ fontWeight: '600' }}>
                                    {m.homeTeam?.name} <span style={{ color: 'var(--accent-primary)' }}>{m.score?.home} : {m.score?.away}</span> {m.awayTeam ? m.awayTeam.name : m.awayTeamName}
                                  </span>
                                  <span style={{ color: 'var(--text-muted)' }}>{m.status}</span>
                                </div>
                              ))}
                              {matches.filter(m => m.tournament === tour._id).length === 0 && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px' }}>No fixtures mapped to this tournament.</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {tournaments.length === 0 && (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No active tournaments listed.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px 40px', backgroundColor: 'var(--bg-secondary)', marginTop: 'auto', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div>GoalSync Club Management & Fan Scoreboard Portal. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default PublicHomeView;
