import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <ShieldAlert size={64} color="var(--status-retired)" style={{ marginBottom: '24px' }} />
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Access Denied</h1>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', marginBottom: '24px' }}>
        You do not have the required permissions to view this module. Please contact your administrator if you believe this is an error.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
