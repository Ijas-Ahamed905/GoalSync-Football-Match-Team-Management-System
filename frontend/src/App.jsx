import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import Sidebar from './components/Common/Sidebar.jsx';

// Import Views
import DashboardView from './components/Views/DashboardView.jsx';
import TeamsView from './components/Views/TeamsView.jsx';
import MatchesView from './components/Views/MatchesView.jsx';
import TrainingView from './components/Views/TrainingView.jsx';
import TournamentsView from './components/Views/TournamentsView.jsx';
import NewsView from './components/Views/NewsView.jsx';
import PlayersView from './components/Views/PlayersView.jsx';
import CoachesView from './components/Views/CoachesView.jsx';
import ReportsView from './components/Views/ReportsView.jsx';
import SettingsView from './components/Views/SettingsView.jsx';

// Import Auth Screens
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import ForgotPassword from './components/Auth/ForgotPassword.jsx';
import PublicHomeView from './components/Views/PublicHomeView.jsx';
import { Sun, Moon, Menu } from 'lucide-react';

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState('public'); // public, login, register, forgot
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0e17', color: '#f3f4f6' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Booting GoalSync Portal...</div>
      </div>
    );
  }

  // Render Auth screens if user not logged in
  if (!user) {
    if (authView === 'register') {
      return <Register setAuthView={setAuthView} />;
    }
    if (authView === 'forgot') {
      return <ForgotPassword setAuthView={setAuthView} />;
    }
    if (authView === 'login') {
      return <Login setAuthView={setAuthView} />;
    }
    return <PublicHomeView onLoginClick={() => setAuthView('login')} theme={theme} toggleTheme={toggleTheme} />;
  }

  // Render layout container
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'teams':
        return <TeamsView />;
      case 'matches':
        return <MatchesView />;
      case 'training':
        return <TrainingView />;
      case 'tournaments':
        return <TournamentsView />;
      case 'news':
        return <NewsView />;
      case 'players':
        return <PlayersView />;
      case 'coaches':
        return <CoachesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const getPageHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'teams': return 'Squad Roster planning';
      case 'matches': return 'Fixtures Schedule Board';
      case 'training': return 'Squad Training Log';
      case 'tournaments': return 'Leagues & Tournaments';
      case 'news': return 'Club Announcements Board';
      case 'players': return 'Player Registry';
      case 'coaches': return 'Coaching Registry';
      case 'reports': return 'Printable Reports Generator';
      case 'settings': return 'Account Security';
      default: return 'Portal';
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      
      <div className="main-content">
        <header className="main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
              style={{ padding: '6px', marginRight: '8px' }}
            >
              <Menu size={22} />
            </button>
            <div className="header-title">
              <h1>{getPageHeaderTitle()}</h1>
            </div>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Session Role: <strong style={{ color: 'var(--accent-primary)' }}>{user.role}</strong>
            </span>
          </div>
        </header>
        
        {renderView()}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
