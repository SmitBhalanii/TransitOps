import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Shield
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to check role access
  const hasAccess = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  // Define nav links with permissions
  const links = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      roles: ['admin', 'fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst']
    },
    {
      to: '/fleet',
      label: 'Fleet',
      icon: <Truck size={20} />,
      roles: ['admin', 'fleet_manager', 'dispatcher', 'financial_analyst']
    },
    {
      to: '/drivers',
      label: 'Drivers',
      icon: <Users size={20} />,
      roles: ['admin', 'fleet_manager', 'safety_officer']
    },
    {
      to: '/trips',
      label: 'Trips',
      icon: <Route size={20} />,
      roles: ['admin', 'dispatcher', 'safety_officer']
    },
    {
      to: '/maintenance',
      label: 'Maintenance',
      icon: <Wrench size={20} />,
      roles: ['admin', 'fleet_manager']
    },
    {
      to: '/fuel-expenses',
      label: 'Fuel & Expenses',
      icon: <Fuel size={20} />,
      roles: ['admin', 'financial_analyst']
    },
    {
      to: '/analytics',
      label: 'Analytics',
      icon: <BarChart3 size={20} />,
      roles: ['admin', 'fleet_manager', 'financial_analyst']
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: <SettingsIcon size={20} />,
      roles: ['admin']
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>
          <Shield size={24} color="#d97706" />
          TransitOps
        </h2>
        <span>Smart Transport Operations</span>
      </div>

      <ul className="sidebar-nav">
        {links.map((link) => {
          if (!hasAccess(link.roles)) return null;
          return (
            <li key={link.to} className="sidebar-nav-item">
              <NavLink to={link.to} className="sidebar-link">
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
