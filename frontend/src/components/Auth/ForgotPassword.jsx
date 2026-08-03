import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Mail, Key, Lock, Activity, Trophy, ShieldAlert, Award } from 'lucide-react';

const ForgotPassword = ({ setAuthView }) => {
  const { forgotPassword, resetPassword } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = request reset token, 2 = enter token and new password
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      setMessage(data.message || 'Verification token sent.');
      if (data.resetToken) {
        // Autofill or display the mock token for the user
        setResetToken(data.resetToken);
        setMessage(`Security Token generated: "${data.resetToken}". Please use this token below to reset your password.`);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Error occurred. Please check email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await resetPassword(email, resetToken, newPassword);
      setMessage(data.message || 'Password reset successfully!');
      setTimeout(() => {
        setAuthView('login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Reset failed. Verify details and try again.');
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
          <h2>Secure Club Portals.</h2>
          <p>
            Recover access to your member dashboard. Confirm your registered club email address to request a secure password recovery token, then reset your password details.
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', background: 'linear-gradient(to right, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '4px' }}>Reset Password</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Recover your secure portal access details</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="alert alert-success" style={{ fontSize: '0.85rem' }}>
              <Award size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>{message}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestToken}>
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

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '16px', borderRadius: '50px', padding: '12px' }}
                disabled={loading}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : 'Request Reset Token'}
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
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="animated-input-group">
                <label htmlFor="token">Security Token</label>
                <input
                  id="token"
                  type="text"
                  className="animated-input-field"
                  placeholder="Enter Code"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
                <Key size={18} />
              </div>

              <div className="animated-input-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  className="animated-input-field"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
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
                    <span>Updating Password...</span>
                  </div>
                ) : 'Reset Password'}
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
          )}

          <div className="auth-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', fontSize: '0.85rem' }}>
            <span>Remembered your password? </span>
            <button className="btn-link" style={{ fontWeight: '700' }} onClick={() => setAuthView('login')}>
              Back to Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
