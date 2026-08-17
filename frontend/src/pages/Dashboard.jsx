import React from 'react';
import { Shield, CheckCircle, AlertTriangle, AlertCircle, TrendingUp, Users } from 'lucide-react';

const Dashboard = () => {
  // Mock data for Phase 1
  const kpis = [
    { label: 'Active Vehicles', value: '53', color: 'amber', icon: <TrendingUp size={20} /> },
    { label: 'Available Vehicles', value: '42', color: 'green', icon: <CheckCircle size={20} /> },
    { label: 'Vehicles in Maintenance', value: '05', color: 'orange', icon: <AlertTriangle size={20} /> },
    { label: 'Active Trips', value: '18', color: 'blue', icon: <Shield size={20} /> },
    { label: 'Pending Trips', value: '09', color: 'blue', icon: <Shield size={20} /> },
    { label: 'Drivers on Duty', value: '26', color: 'amber', icon: <Users size={20} /> },
    { label: 'Fleet Utilization', value: '81%', color: 'green', icon: <TrendingUp size={20} /> },
  ];

  const recentTrips = [
    { code: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', eta: '45 min' },
    { code: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed', eta: '—' },
    { code: 'TR003', vehicle: 'MINI-08', driver: 'Priya', status: 'Dispatched', eta: '1h 10m' },
    { code: 'TR004', vehicle: '—', driver: '—', status: 'Draft', eta: 'Awaiting vehicle' },
  ];

  const statusBars = [
    { label: 'Available', count: 42, percentage: 70, color: 'var(--status-available)' },
    { label: 'On Trip', count: 18, percentage: 20, color: 'var(--status-ontrip)' },
    { label: 'In Shop', count: 5, percentage: 7, color: 'var(--status-inshop)' },
    { label: 'Retired', count: 2, percentage: 3, color: 'var(--status-retired)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Dashboard</h1>
          <p>Real-time fleet operations overview</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select className="filter-select" defaultValue="All">
          <option value="All">Vehicle Type: All</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Mini">Mini</option>
        </select>
        <select className="filter-select" defaultValue="All">
          <option value="All">Status: All</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
        </select>
        <select className="filter-select" defaultValue="All">
          <option value="All">Region: All</option>
          <option value="North">North</option>
          <option value="East">East</option>
          <option value="West">West</option>
          <option value="South">South</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`kpi-card ${kpi.color}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kpi-title">{kpi.label}</span>
              <div style={{ color: `var(--status-${kpi.color === 'amber' ? 'inshop' : kpi.color})` }}>
                {kpi.icon}
              </div>
            </div>
            <div className="kpi-value">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent Trips Table */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>Recent Trips</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}>{trip.code}</td>
                    <td>{trip.vehicle}</td>
                    <td>{trip.driver}</td>
                    <td>
                      <span className={`badge badge-${trip.status.toLowerCase().replace(' ', '')}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td style={{ color: trip.eta === '—' ? 'var(--color-text-dimmed)' : 'var(--color-text)' }}>{trip.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Distributions */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>Vehicle Status</h3>
          <div className="table-container" style={{ padding: '24px' }}>
            {statusBars.map((bar, idx) => (
              <div key={idx} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 555 }}>{bar.label}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{bar.count} vehicles ({bar.percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ width: `${bar.percentage}%`, height: '100%', backgroundColor: bar.color, borderRadius: '100px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
