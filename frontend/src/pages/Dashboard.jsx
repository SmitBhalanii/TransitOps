import React, { useState, useEffect, useContext } from 'react';
import { getDashboardStats } from '../services/dashboardService';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Play, CheckCircle, Ban, Calendar, User, Truck, ShieldCheck, Activity, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [kpis, setKpis] = useState(null);
  const [statusCounts, setStatusCounts] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Type filter: All, Van, Truck, Mini
  const [typeFilter, setTypeFilter] = useState('All');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (typeFilter !== 'All') filters.type = typeFilter;

      const response = await getDashboardStats(filters);
      if (response.status === 'success') {
        setKpis(response.data.kpis);
        setStatusCounts(response.data.vehicleStatusCounts);
        setRecentTrips(response.data.recentTrips);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [typeFilter]);

  return (
    <div className="page-container">
      {/* Greeting Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="page-title">
          <h1>Operations Dashboard</h1>
          <p>Real-time fleet tracking, status distribution, and driver allocations</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="badge badge-admin" style={{ padding: '6px 12px', textTransform: 'capitalize' }}>
            Role: {user?.role ? user.role.replace('_', ' ') : 'Guest'}
          </div>
          <select
            className="filter-select"
            style={{ padding: '8px 16px', background: 'var(--bg-secondary)', color: 'var(--color-text)', border: '1px solid var(--border-color)' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">Filter Type: All</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini">Mini</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="spinner-container" style={{ minHeight: '240px' }}>
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && kpis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Operations KPI Metrics Grid */}
          <div className="grid-4" style={{ gap: '16px' }}>
            
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Active Vehicles
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span>{kpis.activeVehicles}</span>
                <span style={{ fontSize: '12px', color: 'var(--status-available)', fontWeight: 'normal' }}>
                  / {kpis.totalVehicles} total
                </span>
              </div>
              <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${kpis.totalVehicles > 0 ? (kpis.activeVehicles / kpis.totalVehicles) * 100 : 0}%`, background: 'var(--color-primary)' }}></div>
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Available Vehicles
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--status-available)' }}>
                {kpis.availableVehicles}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', marginTop: '8px' }}>
                Ready for dispatch assignment
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Vehicles In Maintenance
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--status-inshop)' }}>
                {kpis.vehiclesInMaintenance}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', marginTop: '8px' }}>
                Currently in shop schedules
              </div>
            </div>

            <div className="card" style={{ padding: '20px', border: '1px solid var(--color-primary)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Fleet Utilization
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text)' }}>
                {kpis.fleetUtilization}%
              </div>
              <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${kpis.fleetUtilization}%`, background: 'var(--color-primary)' }}></div>
              </div>
            </div>

          </div>

          <div className="grid-3" style={{ gap: '16px' }}>
            
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Active Dispatches
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>
                {kpis.activeTrips}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Pending Drafts
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>
                {kpis.pendingTrips}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Drivers On Duty
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--status-available)' }}>
                {kpis.driversOnDuty}
              </div>
            </div>

          </div>

          <div className="grid-3" style={{ gap: '24px', alignItems: 'start' }}>
            
            {/* Live Vehicle Status Breakdown Progress list */}
            <div className="card" style={{ gridColumn: 'span 1', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                <BarChart2 size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Vehicle Status Share</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>Available</span>
                    <span style={{ fontWeight: 'bold' }}>{statusCounts.Available}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalVehicles > 0 ? (statusCounts.Available / totalVehicles) * 100 : 0}%`, background: 'var(--status-available)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>On Trip</span>
                    <span style={{ fontWeight: 'bold' }}>{statusCounts['On Trip']}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalVehicles > 0 ? (statusCounts['On Trip'] / totalVehicles) * 100 : 0}%`, background: 'var(--color-primary)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>In Shop</span>
                    <span style={{ fontWeight: 'bold' }}>{statusCounts['In Shop']}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalVehicles > 0 ? (statusCounts['In Shop'] / totalVehicles) * 100 : 0}%`, background: 'var(--status-inshop)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>Retired</span>
                    <span style={{ fontWeight: 'bold' }}>{statusCounts.Retired}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalVehicles > 0 ? (statusCounts.Retired / totalVehicles) * 100 : 0}%`, background: 'var(--status-retired)' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent activities/trips panel */}
            <div className="card" style={{ gridColumn: 'span 2', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                <Activity size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Recent Activities</h3>
              </div>

              {recentTrips.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '120px' }}>
                  <p>No recent dispatches logged</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentTrips.map((trip) => (
                    <div
                      key={trip._id}
                      style={{
                        padding: '14px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.02)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 600, color: 'var(--color-text)', fontSize: '13px' }}>
                            {trip.tripCode}
                          </span>
                          <span className={`badge badge-${trip.status.toLowerCase()}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                            {trip.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          {trip.source} → {trip.destination}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--color-text-dimmed)', marginTop: '4px' }}>
                          <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <Truck size={10} /> {trip.vehicle?.registrationNumber || 'Retired'}
                          </span>
                          <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <User size={10} /> {trip.driver?.name || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                          ₹{trip.revenue.toLocaleString()}
                        </div>
                        {trip.eta && (
                          <div style={{ fontSize: '10px', color: 'var(--color-text-dimmed)', marginTop: '2px' }}>
                            ETA: {trip.eta}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
