import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Lock } from 'lucide-react';

const SettingsView = () => {
  const { changePassword } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await changePassword(currentPassword, newPassword);
      setSuccess(data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password. Please verify current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div>
        <h2>Security Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Update your account security details and credentials.</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Change Password</h3>

        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currPass">Current Password</label>
            <input
              id="currPass"
              type="password"
              className="form-control"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPass">New Password</label>
            <input
              id="newPass"
              type="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confPass">Confirm New Password</label>
            <input
              id="confPass"
              type="password"
              className="form-control"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
            <Lock size={16} />
            <span>{loading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;
