import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, loading, error } = useContext(AuthContext);
  const [email, setEmail] = useState('raven.k@transitops.in');
  const [password, setPassword] = useState('DispatchSecure2026!');
  const [role, setRole] = useState('dispatcher');
  const [formError, setFormError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!email || !password || !role) {
      setFormError('Please fill out all fields');
      return;
    }
    
    const success = await login(email, password, role);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="login-page-wrapper" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', minHeight: '100vh', background: '#0b0c10' }}>
      {/* Left Column: Brand panel */}
      <div className="login-brand" style={{ background: '#12141c', borderRight: '1px solid #242838', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Shield size={36} color="#d97706" />
            <h1 style={{ fontSize: '28px', color: '#f3f4f6', fontWeight: 700 }}>TransitOps</h1>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>Smart Transport Operations Platform</p>
        </div>

        <div style={{ margin: '48px 0' }}>
          <h3 style={{ color: '#f3f4f6', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>One login, four roles:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span>
              Fleet Manager
            </li>
            <li style={{ color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span>
              Dispatcher
            </li>
            <li style={{ color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span>
              Safety Officer
            </li>
            <li style={{ color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span>
              Financial Analyst
            </li>
          </ul>
        </div>

        <div style={{ color: '#6b7280', fontSize: '11px' }}>
          TRANSITOPS &copy; 2026 &bull; RBAC ENABLED
        </div>
      </div>

      {/* Right Column: Form panel */}
      <div className="login-form-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f3f4f6', marginBottom: '8px' }}>Sign in to your account</h2>
          <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Enter your credentials to continue</p>
          
          {(formError || error) && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{formError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@transitops.in"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role (RBAC)</label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="admin">Administrator</option>
                <option value="fleet_manager">Fleet Manager</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="safety_officer">Safety Officer</option>
                <option value="financial_analyst">Financial Analyst</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#d97706' }} defaultChecked />
                Remember me
              </label>
              <a href="#forgot" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '13px' }}>Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', borderTop: '1px solid #242838', paddingTop: '24px' }}>
            <h4 style={{ color: '#f3f4f6', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Access Scope:</h4>
            <ul style={{ color: '#6b7280', fontSize: '12px', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '6px' }}><strong style={{ color: '#9ca3af' }}>Fleet Manager:</strong> Fleet, Maintenance</li>
              <li style={{ marginBottom: '6px' }}><strong style={{ color: '#9ca3af' }}>Dispatcher:</strong> Dashboard, Trips</li>
              <li style={{ marginBottom: '6px' }}><strong style={{ color: '#9ca3af' }}>Safety Officer:</strong> Drivers, Compliance</li>
              <li style={{ marginBottom: '6px' }}><strong style={{ color: '#9ca3af' }}>Financial Analyst:</strong> Fuel &amp; Expenses, Analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
