import React from 'react';
import { Plus, ToggleLeft } from 'lucide-react';

const Drivers = () => {
  const drivers = [
    { name: 'Alex', license: 'DL-88213', category: 'LMV', expiry: '12/2028', expired: false, contact: '98765xxxxx', completion: '96%', safety: '9.2', status: 'Available' },
    { name: 'John', license: 'DL-44120', category: 'HMV', expiry: '03/2025', expired: true, contact: '98220xxxxx', completion: '81%', safety: '5.8', status: 'Suspended' },
    { name: 'Priya', license: 'DL-77031', category: 'LMV', expiry: '08/2026', expired: false, contact: '99110xxxxx', completion: '99%', safety: '9.8', status: 'On Trip' },
    { name: 'Suresh', license: 'DL-90045', category: 'HMV', expiry: '01/2027', expired: false, contact: '97440xxxxx', completion: '88%', safety: '8.4', status: 'Off Duty' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Drivers &amp; Safety Profiles</h1>
          <p>Manage driver records, certifications and compliance checks</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add Driver
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>License No.</th>
              <th>Category</th>
              <th>Expiry</th>
              <th>Contact</th>
              <th>Trip Compl.</th>
              <th>Safety Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{d.name}</td>
                <td>{d.license}</td>
                <td>{d.category}</td>
                <td>
                  <span style={{ color: d.expired ? 'var(--status-retired)' : 'inherit' }}>
                    {d.expiry} {d.expired && <strong style={{ marginLeft: '4px', fontSize: '10px', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>EXPIRED</strong>}
                  </span>
                </td>
                <td>{d.contact}</td>
                <td>{d.completion}</td>
                <td style={{ fontWeight: 600 }}>
                  <span style={{ color: Number(d.safety) >= 9.0 ? 'var(--status-available)' : Number(d.safety) >= 7.0 ? 'var(--status-inshop)' : 'var(--status-retired)' }}>
                    {d.safety} / 10
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${d.status.toLowerCase().replace(' ', '')}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toggle Status (Quick State Change):</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-available" style={{ cursor: 'pointer' }}>Available</span>
          <span className="badge badge-ontrip" style={{ cursor: 'pointer' }}>On Trip</span>
          <span className="badge badge-draft" style={{ cursor: 'pointer' }}>Off Duty</span>
          <span className="badge badge-inshop" style={{ cursor: 'pointer' }}>Suspended</span>
        </div>
      </div>

      <div style={{ color: 'var(--color-primary)', fontSize: '13px' }}>
        <strong>Rule:</strong> Expired license or Suspended status &bull; blocked from trip assignment
      </div>
    </div>
  );
};

export default Drivers;
