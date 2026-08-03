import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Mail, Lock, User, Activity, Trophy, ShieldAlert } from 'lucide-react';

const Register = ({ setAuthView }) => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Player');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, role);
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
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
          <h2>Join the Sports Evolution.</h2>
          <p>
            Create an account to join your sports club dashboard. Gain access to rosters, coaches registry database, training calendar boards, and match event recorders.
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
          <div className="auth-header" style={{ marginBottom: '20px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <Activity size={28} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', background: 'linear-gradient(to right, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '4px' }}>Create Account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Sign up to access your team dashboard</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="animated-input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="animated-input-field"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <User size={18} />
            </div>

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
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="animated-input-field"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
              <Lock size={18} />
            </div>

            <div className="animated-input-group">
              <label htmlFor="role" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>Register As</label>
              <select
                id="role"
                className="form-select-custom"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Player">Player</option>
                <option value="Coach">Coach</option>
                <option value="Admin">Admin / Club Registrar</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '12px', borderRadius: '50px', padding: '12px' }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} className="animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : 'Sign Up & Launch'}
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

          <div className="auth-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', fontSize: '0.85rem' }}>
            <span>Already have an account? </span>
            <button className="btn-link" style={{ fontWeight: '700' }} onClick={() => setAuthView('login')}>
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
