import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Mail, Lock, Activity, Trophy, ShieldAlert, Award } from 'lucide-react';

const Login = ({ setAuthView }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left visual branding panel */}
      <div className="auth-visual-panel">
        <div className="auth-visual-branding">
          <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', background: 'linear-gradient(to right, #fff, var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GoalSync</span>
        </div>

        <div className="auth-visual-quote">
          <h2>Unlock Your Squad's True Potential.</h2>
          <p>
            Experience sports analytics and roster management refined. GoalSync lets club registrar admins, trainers, and athletes align rosters, track attendance logs, and capture real-time match events instantly.
          </p>

          <div className="auth-visual-metrics">
            <div className="auth-metric-item">
              <div className="auth-metric-val">100%</div>
              <div className="auth-metric-lbl">Squad Sync</div>
            </div>
            <div className="auth-metric-item">
              <div className="auth-metric-val" style={{ color: 'var(--accent-secondary)' }}>LIVE</div>
              <div className="auth-metric-lbl">Game Ticker</div>
            </div>
            <div className="auth-metric-item">
              <div className="auth-metric-val" style={{ color: 'var(--accent-info)' }}>PRO</div>
              <div className="auth-metric-lbl">Roster Tool</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Trophy size={14} style={{ color: 'var(--accent-secondary)' }} />
          <span>Championing local sports club management portals</span>
        </div>
      </div>

      {/* Right form input panel */}
      <div className="auth-form-panel">
        <div className="auth-form-glass-card animate-slide-up">
          <div className="auth-header" style={{ marginBottom: '24px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <Activity size={28} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', background: 'linear-gradient(to right, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '4px' }}>Portal Sign In</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Access your secure member dashboard</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="animated-input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="animated-input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={18} />
            </div>

            <div className="animated-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label htmlFor="password" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  className="btn-link"
                  style={{ fontSize: '0.8rem', fontWeight: '600' }}
                  onClick={() => setAuthView('forgot')}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                className="animated-input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={18} />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '16px', borderRadius: '50px', padding: '12px' }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} className="animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : 'Access Dashboard'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px', borderRadius: '50px', padding: '12px' }}
              onClick={() => setAuthView('public')}
            >
              Back to Homepage
            </button>
          </form>

          <div className="auth-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', fontSize: '0.85rem' }}>
            <span>Don't have an account yet? </span>
            <button className="btn-link" style={{ fontWeight: '700' }} onClick={() => setAuthView('register')}>
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
