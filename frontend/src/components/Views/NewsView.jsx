import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { Plus, Edit2, Trash2, X, Newspaper, Calendar, User } from 'lucide-react';

const NewsView = () => {
  const { user } = useContext(AuthContext);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isCoachOrAdmin = user.role === 'Admin' || user.role === 'Coach';

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const allNews = await api('/api/news');
      setNews(allNews);
    } catch (err) {
      setError(err.message || 'Error fetching announcements feed');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setTitle('');
    setContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditId(post._id);
    setTitle(post.title);
    setContent(post.content);
    setIsModalOpen(true);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const updated = await api(`/api/news/${editId}`, {
          method: 'PUT',
          body: { title, content },
        });
        setNews(news.map(item => item._id === editId ? updated : item));
      } else {
        const created = await api('/api/news', {
          method: 'POST',
          body: { title, content },
        });
        setNews([created, ...news]);
      }
      setIsModalOpen(false);
      setTitle('');
      setContent('');
    } catch (err) {
      setError(err.message || 'Failed to save news announcement');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api(`/api/news/${id}`, { method: 'DELETE' });
      setNews(news.filter(item => item._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading announcements feed...</div>;

  return (
    <div className="page-container">
      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Club News & Announcements</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Read and publish notifications, match reviews, or schedule updates.</p>
        </div>
        {isCoachOrAdmin && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>Publish Post</span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {news.map(post => (
          <div key={post._id} className="card" style={{ padding: '24px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{post.title}</h3>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} /> By {post.author?.name || 'Club Staff'} ({post.author?.role || 'Coach'})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {isCoachOrAdmin && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => openEditModal(post)}>
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeletePost(post._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {post.content}
            </p>
          </div>
        ))}

        {news.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <Newspaper size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3>No Announcements Yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Check back later for match circulars and team training updates.</p>
          </div>
        )}
      </div>

      {/* Add / Edit News Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editId ? 'Edit Announcement Post' : 'Publish Announcement'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSavePost}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="newsTitle">Post Title</label>
                  <input
                    id="newsTitle"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Tryouts for Upcoming League matches"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newsContent">Post Body Content</label>
                  <textarea
                    id="newsContent"
                    className="form-control"
                    placeholder="Write detailed announcements content here..."
                    style={{ minHeight: '180px' }}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-header" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsView;
