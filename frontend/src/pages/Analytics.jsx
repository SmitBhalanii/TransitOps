import React, { useState, useEffect, useContext } from 'react';
import { getAnalyticsOverview, getVehicleRoi, getCostliestVehicles } from '../services/reportService';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Download, BarChart2, Coins, ArrowUpRight, Percent, Navigation, Wrench } from 'lucide-react';

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [roiReport, setRoiReport] = useState([]);
  const [costliestVehicles, setCostliestVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) Fetch Overview (Fuel Efficiency, Costs, Monthly Trend)
      const overviewRes = await getAnalyticsOverview();
      if (overviewRes.status === 'success') {
        setSummary(overviewRes.data.summary);
        setCostBreakdown(overviewRes.data.costBreakdown);
        setRevenueTrend(overviewRes.data.monthlyRevenueTrend);
      }

      // 2) Fetch Vehicle ROI Report
      const roiRes = await getVehicleRoi();
      if (roiRes.status === 'success') {
        setRoiReport(roiRes.data.roiReport);
      }

      // 3) Fetch Costliest Vehicles
      const costliestRes = await getCostliestVehicles();
      if (costliestRes.status === 'success') {
        setCostliestVehicles(costliestRes.data.costliestVehicles);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load analytics report metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Calculate overall Fleet ROI average
  const avgFleetRoi = roiReport.length > 0
    ? Number((roiReport.reduce((acc, v) => acc + v.roi, 0) / roiReport.length).toFixed(2))
    : 0;

  // CSV Exporter
  const handleExportCSV = () => {
    if (roiReport.length === 0) return;

    // Build headers
    const headers = ['Registration Number', 'Model', 'Acquisition Cost (INR)', 'Revenue (INR)', 'Maintenance Cost (INR)', 'Fuel Cost (INR)', 'ROI (%)'];
    const rows = roiReport.map((v) => [
      v.registrationNumber,
      v.nameModel,
      v.acquisitionCost,
      v.revenue,
      v.maintenanceCost,
      v.fuelCost,
      `${v.roi}%`,
    ]);

    // Format content
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    // Create anchor and download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fleet_ROI_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find max monthly revenue to scale the custom SVG chart
  const maxRevenue = revenueTrend.length > 0 ? Math.max(...revenueTrend.map((r) => r.revenue)) : 10000;

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="page-title">
          <h1>Reports &amp; Analytics</h1>
          <p>Analyze vehicle return-on-investments, monthly revenue trends, and operational metrics</p>
        </div>
        {!loading && !error && roiReport.length > 0 && (
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <Download size={18} />
            Export CSV Report
          </button>
        )}
      </div>

      {loading && (
        <div className="spinner-container" style={{ minHeight: '280px' }}>
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* KPI Metrics Cards */}
          <div className="grid-4" style={{ gap: '16px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', textTransform: 'uppercase' }}>Fuel Efficiency</span>
                <Wrench size={16} style={{ color: 'var(--status-retired)' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>
                {summary.overallFuelEfficiency} <span style={{ fontSize: '14px', color: 'var(--color-text-dimmed)' }}>km/L</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', marginTop: '8px' }}>
                Distance: {summary.distanceTraveled.toLocaleString()} km
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', textTransform: 'uppercase' }}>Average Fleet ROI</span>
                <Percent size={16} style={{ color: 'var(--status-available)' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--status-available)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {avgFleetRoi}% <ArrowUpRight size={18} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', marginTop: '8px' }}>
                Average across active vehicle assets
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', textTransform: 'uppercase' }}>Total Road Costs</span>
                <Coins size={16} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>
                ₹{(costBreakdown.Toll + costBreakdown.Other).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', marginTop: '8px' }}>
                Toll and other travel costs
              </div>
            </div>

            <div className="card" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', textTransform: 'uppercase' }}>Operational Cost</span>
                <DollarSign size={16} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>
                ₹{summary.totalOperationalCost.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', marginTop: '8px' }}>
                Unified ledger total expenditures
              </div>
            </div>
          </div>

          <div className="grid-3" style={{ gap: '24px', alignItems: 'start' }}>
            
            {/* Custom SVG Revenue trend Chart */}
            <div className="card" style={{ gridColumn: 'span 2', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px' }}>
                <BarChart2 size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Monthly Completed Trip Revenue</h3>
              </div>

              {revenueTrend.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '140px' }}>
                  <p>No monthly completed trips revenue data</p>
                </div>
              ) : (
                <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  {revenueTrend.map((item, idx) => {
                    const heightPercent = (item.revenue / maxRevenue) * 100;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                          ₹{item.revenue.toLocaleString()}
                        </div>
                        <div
                          style={{
                            width: '28px',
                            height: `${heightPercent}px`,
                            background: 'linear-gradient(to top, var(--color-primary-dark), var(--color-primary))',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease',
                          }}
                        ></div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', marginTop: '8px' }}>
                          {item.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Costliest vehicles sidebar */}
            <div className="card" style={{ gridColumn: 'span 1', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                <Coins size={18} style={{ color: 'var(--status-retired)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Top Costliest Vehicles</h3>
              </div>

              {costliestVehicles.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '140px' }}>
                  <p>No operational costs recorded yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {costliestVehicles.map((v, idx) => {
                    const maxCost = costliestVehicles[0]?.totalExpense || 1;
                    const percent = (v.totalExpense / maxCost) * 100;
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>{v.registrationNumber} ({v.nameModel})</span>
                          <span style={{ fontWeight: 'bold' }}>₹{v.totalExpense.toLocaleString()}</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${percent}%`, background: 'var(--status-retired)' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Vehicle ROI Ledger Table */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Vehicle ROI Performance Ledger</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-dimmed)', marginBottom: '20px' }}>
              Calculated using: ROI = ((Revenue - (Maintenance + Fuel)) / Acquisition Cost) * 100
            </p>

            <div className="table-container">
              {roiReport.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '120px' }}>
                  <p>No ROI records to calculate</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Acq. Cost (INR)</th>
                      <th>Revenue (INR)</th>
                      <th>Maintenance Cost (INR)</th>
                      <th>Fuel Cost (INR)</th>
                      <th>ROI (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roiReport.map((v) => (
                      <tr key={v._id}>
                        <td style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}>
                          {v.registrationNumber} <span style={{ fontSize: '12px', color: 'var(--color-text-dimmed)', fontWeight: 'normal' }}>({v.nameModel})</span>
                        </td>
                        <td>₹{v.acquisitionCost.toLocaleString()}</td>
                        <td>₹{v.revenue.toLocaleString()}</td>
                        <td>₹{v.maintenanceCost.toLocaleString()}</td>
                        <td>₹{v.fuelCost.toLocaleString()}</td>
                        <td style={{ fontWeight: 600, color: v.roi >= 0 ? 'var(--status-available)' : 'var(--status-retired)' }}>
                          {v.roi >= 0 ? '+' : ''}{v.roi}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Analytics;
