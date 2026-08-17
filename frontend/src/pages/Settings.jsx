import React, { useState, useEffect, useContext } from 'react';
import { getSystemSettings, updateSystemSettings } from '../services/settingsService';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Check, X, Shield, Settings as SettingsIcon, Users } from 'lucide-react';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form Fields
  const [depotName, setDepotName] = useState('');
  const [currency, setCurrency] = useState('INR (Rs)');
  const [distanceUnit, setDistanceUnit] = useState('Kilometers');

  // Active Tab: general, rbac
  const [activeTab, setActiveTab] = useState('general');

  // Check if user is Admin to allow editing settings
  const isAdmin = user?.role === 'admin';

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSystemSettings();
      if (response.status === 'success') {
        const data = response.data.settings;
        setSettings(data);
        setDepotName(data.depotName);
        setCurrency(data.currency);
        setDistanceUnit(data.distanceUnit);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    const payload = {
      depotName,
      currency,
      distanceUnit,
    };

    try {
      const response = await updateSystemSettings(payload);
      if (response.status === 'success') {
        setSettings(response.data.settings);
        setSuccessMsg('System settings successfully updated! (Changes applied globally)');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save settings');
    }
  };

  // Static Matrix mapping roles to permissions
  const permissionRows = [
    { module: 'User Accounts (CRUD)', admin: true, fleet: false, dispatcher: false, safety: false, finance: false },
    { module: 'System Settings (Update)', admin: true, fleet: false, dispatcher: false, safety: false, finance: false },
    { module: 'Vehicles / Fleet (CRUD)', admin: true, fleet: true, dispatcher: false, safety: false, finance: false },
    { module: 'Vehicles / Fleet (View Only)', admin: true, fleet: true, dispatcher: true, safety: false, finance: true },
    { module: 'Drivers & Safety (CRUD)', admin: true, fleet: true, dispatcher: false, safety: true, finance: false },
    { module: 'Trip Dispatcher (CRUD)', admin: true, fleet: false, dispatcher: true, safety: false, finance: false },
    { module: 'Trip Dispatcher (View Only)', admin: true, fleet: false, dispatcher: true, safety: true, finance: false },
    { module: 'Maintenance Log (CRUD)', admin: true, fleet: true, dispatcher: false, safety: false, finance: false },
    { module: 'Fuel Refills (CRUD)', admin: true, fleet: true, dispatcher: false, safety: false, finance: true },
    { module: 'Tolls & General Expenses (CRUD)', admin: true, fleet: false, dispatcher: true, safety: false, finance: true },
    { module: 'Reports & Analytics (View)', admin: true, fleet: true, dispatcher: false, safety: false, finance: true },
  ];

  const renderPermissionCell = (hasAccess) => {
    return hasAccess ? (
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-available)', width: '24px', height: '24px', borderRadius: '50%' }}>
        <Check size={14} />
      </div>
    ) : (
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-retired)', width: '24px', height: '24px', borderRadius: '50%' }}>
        <X size={14} />
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title">
          <h1>System Control &amp; Settings</h1>
          <p>Configure depot settings, units of measure, and view Role-Based Access Control matrices</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('general')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            color: activeTab === 'general' ? 'var(--color-primary)' : 'var(--color-text-dimmed)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'general' ? '2px solid var(--color-primary)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
          }}
        >
          <SettingsIcon size={16} />
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            color: activeTab === 'rbac' ? 'var(--color-primary)' : 'var(--color-text-dimmed)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'rbac' ? '2px solid var(--color-primary)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
          }}
        >
          <Users size={16} />
          Role Permissions Matrix
        </button>
      </div>

      {loading && (
        <div className="spinner-container" style={{ minHeight: '160px' }}>
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TAB 1: GENERAL SYSTEM SETTINGS */}
          {activeTab === 'general' && (
            <div className="card" style={{ maxWidth: '560px', padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
                Operational Scope Variables
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '13px' }}>
                System-wide defaults. Modified parameters affect metric calculations and unit symbols globally.
              </p>

              {formError && (
                <div className="alert alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                  <ShieldAlert size={18} />
                  <span>{formError}</span>
                </div>
              )}

              {successMsg && (
                <div className="alert alert-success" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', background: 'rgba(16, 185, 129, 0.15)', borderColor: 'var(--status-available)', color: 'var(--status-available)' }}>
                  <Check size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Depot Node Identifier</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="GJ04 Depot"
                    value={depotName}
                    onChange={(e) => setDepotName(e.target.value)}
                    disabled={!isAdmin}
                    required
                  />
                </div>

                <div className="grid-2" style={{ gap: '16px', marginBottom: '24px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Currency Notation</label>
                    <select
                      className="form-control"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      disabled={!isAdmin}
                      required
                    >
                      <option value="INR (Rs)">INR (₹)</option>
                      <option value="USD ($)">USD ($)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Distance Unit</label>
                    <select
                      className="form-control"
                      value={distanceUnit}
                      onChange={(e) => setDistanceUnit(e.target.value)}
                      disabled={!isAdmin}
                      required
                    >
                      <option value="Kilometers">Kilometers (km)</option>
                      <option value="Miles">Miles (mi)</option>
                    </select>
                  </div>
                </div>

                {isAdmin ? (
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Save Configuration
                  </button>
                ) : (
                  <div style={{ color: 'var(--status-retired)', fontSize: '13px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: '6px' }}>
                    <strong>Note:</strong> Settings are read-only. Only users with the Admin role can modify operational values.
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 2: RBAC PERMISSIONS MATRIX */}
          {activeTab === 'rbac' && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <Shield size={18} style={{ color: 'var(--color-primary)' }} />
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                  Role-Based Access Control Enforcement Grid
                </h2>
              </div>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '13px' }}>
                Security restrictions are verified authoritatively on the backend. Frontend controls hide modules for simplified user navigation views.
              </p>

              <div className="table-container">
                <table className="data-table" style={{ width: '100%', textAlign: 'center' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', width: '280px' }}>Module / Action Capability</th>
                      <th>Admin</th>
                      <th>Fleet Mgr</th>
                      <th>Dispatcher</th>
                      <th>Safety Ofcr</th>
                      <th>Fin. Analyst</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissionRows.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--color-text)' }}>{row.module}</td>
                        <td>{renderPermissionCell(row.admin)}</td>
                        <td>{renderPermissionCell(row.fleet)}</td>
                        <td>{renderPermissionCell(row.dispatcher)}</td>
                        <td>{renderPermissionCell(row.safety)}</td>
                        <td>{renderPermissionCell(row.finance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Settings;
