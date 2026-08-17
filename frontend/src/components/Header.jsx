import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search } from 'lucide-react';

const Header = () => {
  const { user } = useContext(AuthContext);

  // Helper to format role names
  const formatRole = (role) => {
    if (!role) return '';
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'TO';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="header">
      <div className="header-search">
        <Search className="header-search-icon" size={18} />
        <input type="text" placeholder="Search..." aria-label="Search" />
      </div>

      <div className="header-profile">
        <div className="profile-info">
          <div className="profile-name">{user?.name || 'Guest User'}</div>
          <span className="profile-role">{formatRole(user?.role)}</span>
        </div>
        <div className="avatar">
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
};

export default Header;
