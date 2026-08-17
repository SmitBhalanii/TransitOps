import React from 'react';
import { Fuel, TrendingUp, DollarSign, Award } from 'lucide-react';

const Analytics = () => {
  const reports = [
    { label: 'Fuel Efficiency', value: '8.4 km/l', color: 'blue', icon: <Fuel size={20} /> },
    { label: 'Fleet Utilization', value: '81%', color: 'green', icon: <TrendingUp size={20} /> },
    { label: 'Operational Cost', value: '34,070', color: 'orange', icon: <DollarSign size={20} /> },
    { label: 'Vehicle ROI', value: '14.2%', color: 'green', icon: <Award size={20} /> },
  ];

  const monthlyRev = [
    { month: 'Jan', val: 40 },
    { month: 'Feb', val: 55 },
    { month: 'Mar', val: 50 },
    { month: 'Apr', val: 75 },
    { month: 'May', val: 68 },
    { month: 'Jun', val: 90 },
    { month: 'Jul', val: 82 },
  ];

  const costliest = [
    { id: 'TRUCK-11', value: 85, color: 'var(--status-retired)' },
    { id: 'MINI-03', value: 45, color: 'var(--status-inshop)' },
    { id: 'VAN-05', value: 15, color: 'var(--status-ontrip)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Reports &amp; Analytics</h1>
          <p>Detailed performance analytics and ROI calculations</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="card-grid">
        {reports.map((card, idx) => (
          <div key={idx} className={`kpi-card ${card.color}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kpi-title">{card.label}</span>
              <div style={{ color: `var(--status-${card.color === 'amber' ? 'inshop' : card.color})` }}>
                {card.icon}
              </div>
            </div>
            <div className="kpi-value">{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ color: 'var(--color-text-dimmed)', fontSize: '12px', marginTop: '-20px', marginBottom: '32px', fontStyle: 'italic' }}>
        * ROI calculation formula: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      </div>

      <div className="grid-2">
        {/* Monthly Revenue Bar Chart */}
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '24px' }}>Monthly Revenue</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', padding: '0 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
            {monthlyRev.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                <div style={{ width: '28px', height: `${m.val * 1.8}px`, backgroundColor: 'var(--status-ontrip)', borderRadius: '4px 4px 0 0', position: 'relative', cursor: 'pointer', transition: 'var(--transition)' }} className="chart-bar-hover">
                  <div className="chart-tooltip" style={{ display: 'none', position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', background: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', whiteSpace: 'nowrap', color: '#fff', zIndex: 10 }}>₹ {m.val * 1000}</div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-dimmed)' }}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Costliest Vehicles Horizontal Chart */}
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '24px' }}>Top Costliest Vehicles</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {costliest.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ width: '80px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>{item.id}</span>
                <div style={{ flex: 1, height: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.value}%`, height: '100%', backgroundColor: item.color, borderRadius: '100px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
