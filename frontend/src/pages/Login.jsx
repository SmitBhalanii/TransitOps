import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, AlertCircle, Eye, EyeOff, Key, X, CheckCircle } from 'lucide-react';

const Login = () => {
  const { login, loading, error } = useContext(AuthContext);
  const [email, setEmail] = useState('admin@transitops.in');
  const [password, setPassword] = useState('AdminSecure2026!');
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
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

  const handleQuickFill = (demoEmail, demoPassword, demoRole) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setRole(demoRole);
    setShowForgotModal(false);
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
          <h3 style={{ color: '#f3f4f6', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>One login, five roles:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span>
              Administrator
            </li>
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
      <div className="login-form-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', position: 'relative' }}>
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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingRight: '42px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', borderTop: '1px solid #242838', paddingTop: '24px' }}>
            <h4 style={{ color: '#f3f4f6', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Access Scope:</h4>
            <ul style={{ color: '#6b7280', fontSize: '12px', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '6px' }}><strong style={{ color: '#9ca3af' }}>Administrator:</strong> Full access &amp; User Control</li>
              <li style={{ marginBottom: '6px' }}><strong style={{ color: '#9ca3af' }}>Fleet Manager:</strong> Fleet, Maintenance</li>
              <li style={{ marginBottom: '6px' }}><strong style={{ color: '#9ca3af' }}>Dispatcher:</strong> Dashboard, Trips</li>
              <li style={{ marginBottom: '6px' }}><strong style={{ color: '#9ca3af' }}>Safety Officer:</strong> Drivers, Compliance</li>
              <li style={{ marginBottom: '6px' }}><strong style={{ color: '#9ca3af' }}>Financial Analyst:</strong> Fuel &amp; Expenses, Analytics</li>
            </ul>
          </div>
        </div>

        {/* Forgot Password / Credential Recovery Modal */}
        {showForgotModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '20px',
            }}
          >
            <div
              className="card"
              style={{
                maxWidth: '480px',
                width: '100%',
                background: '#12141c',
                border: '1px solid #242838',
                padding: '28px',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={20} color="#d97706" />
                  <h3 style={{ fontSize: '18px', color: '#f3f4f6', margin: 0 }}>Credential Recovery</h3>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px', lineHeight: '1.6' }}>
                TransitOps uses secure <strong>Role-Based Access Control (RBAC)</strong>. In a live enterprise environment, password resets are initiated by contacting your System Administrator (<code style={{ color: '#d97706' }}>admin@transitops.in</code>).
              </p>

              <div style={{ background: '#1a1d29', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#f3f4f6', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quick Fill Demo Account:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 12px', justifyContent: 'space-between' }}
                    onClick={() => handleQuickFill('admin@transitops.in', 'AdminSecure2026!', 'admin')}
                  >
                    <span>👑 Administrator</span>
                    <span style={{ color: '#9ca3af' }}>admin@transitops.in</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 12px', justifyContent: 'space-between' }}
                    onClick={() => handleQuickFill('fleet.manager@transitops.in', 'FleetSecure2026!', 'fleet_manager')}
                  >
                    <span>🚛 Fleet Manager</span>
                    <span style={{ color: '#9ca3af' }}>fleet.manager@transitops.in</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 12px', justifyContent: 'space-between' }}
                    onClick={() => handleQuickFill('raven.k@transitops.in', 'DispatchSecure2026!', 'dispatcher')}
                  >
                    <span>🧭 Dispatcher</span>
                    <span style={{ color: '#9ca3af' }}>raven.k@transitops.in</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 12px', justifyContent: 'space-between' }}
                    onClick={() => handleQuickFill('safety.officer@transitops.in', 'SafetySecure2026!', 'safety_officer')}
                  >
                    <span>🛡️ Safety Officer</span>
                    <span style={{ color: '#9ca3af' }}>safety.officer@transitops.in</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 12px', justifyContent: 'space-between' }}
                    onClick={() => handleQuickFill('financial.analyst@transitops.in', 'FinanceSecure2026!', 'financial_analyst')}
                  >
                    <span>📊 Financial Analyst</span>
                    <span style={{ color: '#9ca3af' }}>financial.analyst@transitops.in</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => setShowForgotModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
