import React from 'react';
import { Wrench } from 'lucide-react';

const Maintenance = () => {
  const serviceLogs = [
    { vehicle: 'VAN-05', service: 'Oil Change', cost: '2,500', status: 'In Shop' },
    { vehicle: 'TRUCK-11', service: 'Engine Repair', cost: '18,000', status: 'Completed' },
    { vehicle: 'MINI-03', service: 'Tyre Replace', cost: '6,200', status: 'In Shop' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Maintenance Management</h1>
          <p>Record services, manage repair costs, and track vehicle shop statuses</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: Form */}
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Log Service Record</h3>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">Vehicle</label>
              <select className="form-control" defaultValue="van05">
                <option value="van05">VAN-05</option>
                <option value="truck11">TRUCK-11</option>
                <option value="mini03">MINI-03</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Service Type</label>
              <input type="text" className="form-control" defaultValue="Oil Change" />
            </div>

            <div className="form-group">
              <label className="form-label">Cost</label>
              <input type="number" className="form-control" defaultValue="2500" />
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" defaultValue="2026-07-07" />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" defaultValue="active">
                <option value="active">Active (Send to Shop)</option>
                <option value="completed">Completed (Close Record)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
              Save Record
            </button>
          </form>

          {/* State Transition Diagram */}
          <div style={{ marginTop: '24px', background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--status-available)', fontWeight: 'bold' }}>Available</span>
              <span style={{ color: 'var(--color-text-dimmed)' }}>── creating active record ➔</span>
              <span style={{ color: 'var(--status-inshop)', fontWeight: 'bold' }}>In Shop</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: 'var(--status-inshop)', fontWeight: 'bold' }}>In Shop</span>
              <span style={{ color: 'var(--color-text-dimmed)' }}>── closing record (not retired) ➔</span>
              <span style={{ color: 'var(--status-available)', fontWeight: 'bold' }}>Available</span>
            </div>
            <div style={{ color: 'var(--color-primary)', textAlign: 'center' }}>
              Note: In Shop vehicles are removed from the dispatch pool.
            </div>
          </div>
        </div>

        {/* Right Column: Table */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>Service Log</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {serviceLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{log.vehicle}</td>
                    <td>{log.service}</td>
                    <td>{log.cost}</td>
                    <td>
                      <span className={`badge badge-${log.status.toLowerCase().replace(' ', '')}`}>
                        {log.status}
                      </span>
                    </td>
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

export default Maintenance;
