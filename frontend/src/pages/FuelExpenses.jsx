import React from 'react';
import { Plus, DollarSign } from 'lucide-react';

const FuelExpenses = () => {
  const fuelLogs = [
    { vehicle: 'VAN-05', date: '05 Jul 2026', liters: '42 L', cost: '3,150' },
    { vehicle: 'TRUCK-11', date: '06 Jul 2026', liters: '110 L', cost: '8,400' },
    { vehicle: 'MINI-08', date: '06 Jul 2026', liters: '28 L', cost: '2,050' },
  ];

  const otherExpenses = [
    { trip: 'TR001', vehicle: 'VAN-05', toll: '120', other: '0', maint: '0', total: '120' },
    { trip: 'TR002', vehicle: 'TRK-12', toll: '340', other: '150', maint: '18,000', total: '18,490' },
  ];

  const totalCost = '34,070'; // Match wireframe calculations

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Fuel &amp; Expense Management</h1>
          <p>Track operating costs, log fuel refills, and audit trip expenses</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary">
            <Plus size={16} />
            Log Fuel
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Fuel Logs Table */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>Fuel Logs</h3>
      <div className="table-container" style={{ marginBottom: '32px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Liters</th>
              <th>Fuel Cost (INR)</th>
            </tr>
          </thead>
          <tbody>
            {fuelLogs.map((log, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{log.vehicle}</td>
                <td>{log.date}</td>
                <td>{log.liters}</td>
                <td style={{ fontWeight: 600 }}>{log.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Other Expenses Table */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>Other Expenses (Toll / Misc)</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Trip</th>
              <th>Vehicle</th>
              <th>Toll (INR)</th>
              <th>Other (INR)</th>
              <th>Maint. (Linked)</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {otherExpenses.map((exp, idx) => (
              <tr key={idx}>
                <td style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}>{exp.trip}</td>
                <td>{exp.vehicle}</td>
                <td>{exp.toll}</td>
                <td>{exp.other}</td>
                <td style={{ color: exp.maint === '0' ? 'var(--color-text-dimmed)' : 'inherit' }}>{exp.maint}</td>
                <td>
                  <span className="badge badge-available">
                    {exp.total}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Aggregate Costs Banner */}
      <div className="table-container" style={{ padding: '20px', marginTop: '24px', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '14px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Operational Cost (Auto)</h4>
            <span style={{ fontSize: '12px', color: 'var(--color-text-dimmed)' }}>Sum calculation = Fuel + Maintenance + Toll + Miscellaneous</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--color-text-dimmed)', fontFamily: 'var(--font-title)' }}>INR</span>
            <span style={{ fontSize: '28px', color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'var(--font-title)' }}>₹ {totalCost}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelExpenses;
