import React from 'react';
import { Save } from 'lucide-react';

const Settings = () => {
  const matrix = [
    { role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '—', fuel: '—', analytics: '✓' },
    { role: 'Dispatcher', fleet: 'view', drivers: '—', trips: '✓', fuel: '—', analytics: '—' },
    { role: 'Safety Officer', fleet: '—', drivers: '✓', trips: 'view', fuel: '—', analytics: '—' },
    { role: 'Financial Analyst', fleet: 'view', drivers: '—', trips: '—', fuel: '✓', analytics: '✓' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Settings &amp; RBAC Control</h1>
          <p>Configure general parameters and review authorization matrix policies</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: General Configuration */}
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>General Settings</h3>
          
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">Depot Name</label>
              <input type="text" className="form-control" defaultValue="Gandhinagar Depot GJ4" />
            </div>

            <div className="form-group">
              <label className="form-label">Currency</label>
              <input type="text" className="form-control" defaultValue="INR (Rs)" />
            </div>

            <div className="form-group">
              <label className="form-label">Distance Unit</label>
              <input type="text" className="form-control" defaultValue="Kilometers" />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <Save size={16} />
              Save Changes
            </button>
          </form>
        </div>

        {/* Right Column: Role permissions matrix */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>Role-Based Access (RBAC)</h3>
          
          <div className="table-container">
            <table className="data-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Fleet</th>
                  <th>Drivers</th>
                  <th>Trips</th>
                  <th>Fuel/Exp</th>
                  <th>Analytics</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{row.role}</td>
                    <td style={{ color: row.fleet === '✓' ? 'var(--status-available)' : row.fleet === 'view' ? 'var(--status-ontrip)' : 'var(--color-text-dimmed)' }}>{row.fleet}</td>
                    <td style={{ color: row.drivers === '✓' ? 'var(--status-available)' : row.drivers === 'view' ? 'var(--status-ontrip)' : 'var(--color-text-dimmed)' }}>{row.drivers}</td>
                    <td style={{ color: row.trips === '✓' ? 'var(--status-available)' : row.trips === 'view' ? 'var(--status-ontrip)' : 'var(--color-text-dimmed)' }}>{row.trips}</td>
                    <td style={{ color: row.fuel === '✓' ? 'var(--status-available)' : row.fuel === 'view' ? 'var(--status-ontrip)' : 'var(--color-text-dimmed)' }}>{row.fuel}</td>
                    <td style={{ color: row.analytics === '✓' ? 'var(--status-available)' : row.analytics === 'view' ? 'var(--status-ontrip)' : 'var(--color-text-dimmed)' }}>{row.analytics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
