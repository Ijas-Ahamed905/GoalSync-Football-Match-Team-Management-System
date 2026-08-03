// import React, { useContext } from 'react';
// import { AuthContext } from '../../context/AuthContext.jsx';
// import {
//   LayoutDashboard,
//   Users,
//   Calendar,
//   Trophy,
//   Activity,
//   Newspaper,
//   FileText,
//   UserCheck,
//   Award,
//   Settings,
//   LogOut,
//   X
// } from 'lucide-react';

// const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
//   const { user, logout } = useContext(AuthContext);

//   if (!user) return null;

//   const role = user.role;

//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Coach', 'Player'] },
//     { id: 'teams', label: 'Teams & Rosters', icon: Users, roles: ['Admin', 'Coach', 'Player'] },
//     { id: 'matches', label: 'Match Schedules', icon: Calendar, roles: ['Admin', 'Coach', 'Player'] },
//     { id: 'training', label: 'Training logs', icon: Activity, roles: ['Admin', 'Coach', 'Player'] },
//     { id: 'tournaments', label: 'Tournaments', icon: Trophy, roles: ['Admin', 'Coach', 'Player'] },
//     { id: 'news', label: 'Club Announcements', icon: Newspaper, roles: ['Admin', 'Coach', 'Player'] },
    
//     // Admin / Coach Specific
//     { id: 'players', label: 'Player Accounts', icon: UserCheck, roles: ['Admin', 'Coach'] },
//     { id: 'coaches', label: 'Coach Profiles', icon: Award, roles: ['Admin'] },
//     { id: 'reports', label: 'Reports Generator', icon: FileText, roles: ['Admin', 'Coach'] },
    
//     // User Self
//     { id: 'settings', label: 'Change Password', icon: Settings, roles: ['Admin', 'Coach', 'Player'] },
//   ];

//   const filteredItems = menuItems.filter(item => item.roles.includes(role));

//   return (
//     <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
//       <div className="sidebar-brand" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//           <Activity size={28} className="brand-icon" />
//           <span className="brand-text">GoalSync</span>
//         </div>
//         <button
//           className="mobile-menu-btn"
//           style={{ padding: '4px' }}
//           onClick={() => setIsOpen(false)}
//         >
//           <X size={20} />
//         </button>
//       </div>
      
//       <ul className="sidebar-menu">
//         {filteredItems.map(item => {
//           const Icon = item.icon;
//           return (
//             <li key={item.id}>
//               <a
//                 onClick={() => {
//                   setActiveTab(item.id);
//                   setIsOpen(false);
//                 }}
//                 className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
//               >
//                 <Icon size={20} />
//                 <span>{item.label}</span>
//               </a>
//             </li>
//           );
//         })}
//       </ul>

//       <div className="sidebar-footer">
//         <div className="user-profile-badge" style={{ marginBottom: '16px' }}>
//           <div className="user-avatar-placeholder">
//             {user.name.substring(0, 2).toUpperCase()}
//           </div>
//           <div className="user-badge-info">
//             <h4>{user.name}</h4>
//             <span>{user.role}</span>
//           </div>
//         </div>
//         <a onClick={logout} className="sidebar-item" style={{ color: 'var(--accent-danger)' }}>
//           <LogOut size={20} />
//           <span>Log Out</span>
//         </a>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Trophy,
  Activity,
  Newspaper,
  FileText,
  UserCheck,
  Award,
  Settings,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const role = user.role;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Coach', 'Player'],
    },
    {
      id: 'teams',
      label: 'Teams & Rosters',
      icon: Users,
      roles: ['Admin', 'Coach', 'Player'],
    },
    {
      id: 'matches',
      label: 'Match Schedules',
      icon: Calendar,
      roles: ['Admin', 'Coach', 'Player'],
    },
    {
      id: 'training',
      label: 'Training Logs',
      icon: Activity,
      roles: ['Admin', 'Coach', 'Player'],
    },
    {
      id: 'tournaments',
      label: 'Tournaments',
      icon: Trophy,
      roles: ['Admin', 'Coach', 'Player'],
    },
    {
      id: 'news',
      label: 'Club Announcements',
      icon: Newspaper,
      roles: ['Admin', 'Coach', 'Player'],
    },

    // Admin / Coach
    {
      id: 'players',
      label: 'Player Accounts',
      icon: UserCheck,
      roles: ['Admin', 'Coach'],
    },
    {
      id: 'coaches',
      label: 'Coach Profiles',
      icon: Award,
      roles: ['Admin'],
    },
    {
      id: 'reports',
      label: 'Reports Generator',
      icon: FileText,
      roles: ['Admin', 'Coach'],
    },

    // All Users
    {
      id: 'settings',
      label: 'Change Password',
      icon: Settings,
      roles: ['Admin', 'Coach', 'Player'],
    },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Sidebar Header */}
      <div
        className="sidebar-brand"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '22px',
            fontWeight: 'bold',
          }}
        >
          GoalSync
        </div>

        <button
          className="mobile-menu-btn"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
          }}
          onClick={() => setIsOpen(false)}
        >
          <X size={22} />
        </button>
      </div>

      {/* Sidebar Menu */}
      <ul className="sidebar-menu">
        {filteredItems.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`sidebar-item ${
                  activeTab === item.id ? 'active' : ''
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          className="user-profile-badge"
          style={{ marginBottom: '16px' }}
        >
          <div className="user-avatar-placeholder">
            {user.name.substring(0, 2).toUpperCase()}
          </div>

          <div className="user-badge-info">
            <h4>{user.name}</h4>
            <span>{user.role}</span>
          </div>
        </div>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
          className="sidebar-item"
          style={{ color: 'var(--accent-danger)' }}
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;