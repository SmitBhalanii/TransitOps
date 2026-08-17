import React, { useState, useEffect, useContext } from 'react';
import { getMaintenanceLogs, createMaintenance, updateMaintenance, deleteMaintenance } from '../services/maintenanceService';
import { getVehicles } from '../services/vehicleService';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, ShieldAlert, X, AlertTriangle, CheckCircle, Trash2, Calendar, DollarSign, Wrench, Settings } from 'lucide-react';

const Maintenance = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');

  // Form Fields
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [serviceType, setServiceType] = useState('Routine Checkup');
  const [cost, setCost] = useState(1500);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Write permissions: Fleet Manager or Admin
  const canWrite = user?.role === 'admin' || user?.role === 'fleet_manager';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) Fetch Maintenance Logs
      const filters = {};
      if (statusFilter !== 'All') filters.status = statusFilter;
      const logsRes = await getMaintenanceLogs(filters);
      if (logsRes.status === 'success') {
        setLogs(logsRes.data.records);
      }

      // 2) Fetch Vehicles (for selector - exclude Retired)
      const vehiclesRes = await getVehicles();
      if (vehiclesRes.status === 'success') {
        setVehicles(vehiclesRes.data.vehicles.filter(v => v.status !== 'Retired'));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Set default vehicle select value when loaded
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]._id);
    }
  }, [vehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedVehicle) {
      setFormError('Please select a valid vehicle');
      return;
    }

    const payload = {
      vehicle: selectedVehicle,
      serviceType,
      cost: Number(cost),
      date,
      notes,
      status: 'Active',
    };

    try {
      await createMaintenance(payload);
      setNotes('');
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Validation error creating log');
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this maintenance as completed? (This will restore Vehicle status to Available)')) return;
    try {
      await updateMaintenance(id, { status: 'Completed' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to complete maintenance');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this service entry?')) return;
    try {
      await deleteMaintenance(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete record');
    }
  };

  // Stats calculation
  const totalCost = logs.reduce((acc, log) => acc + log.cost, 0);
  const activeCount = logs.filter(l => l.status === 'Active').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Maintenance Logs &amp; Shop Schedules</h1>
          <p>Track service costs, vehicle checkups, and shop status changes</p>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid-3" style={{ gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-inshop)', padding: '12px', borderRadius: '8px' }}>
            <Wrench size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Active In Shop</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>{activeCount} vehicles</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', padding: '12px', borderRadius: '8px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Spent (INR)</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>₹{totalCost.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gap: '24px', alignItems: 'start' }}>
        {/* Service Entry Form (Left Sidebar) */}
        {canWrite && (
          <div className="card" style={{ gridColumn: 'span 1' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Schedule Maintenance</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-dimmed)', marginBottom: '20px' }}>
              Enters the vehicle into the service queue (Toggles status to In Shop)
            </p>

            {formError && (
              <div className="alert alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                <AlertTriangle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Vehicle</label>
                <select
                  className="form-control"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  required
                >
                  {vehicles.length === 0 ? (
                    <option value="">No vehicles found</option>
                  ) : (
                    vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.registrationNumber} ({v.nameModel} - {v.status})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Service Type</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Engine Oil, Brake Pads replacement..."
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cost (INR)</label>
                <input
                  type="number"
                  className="form-control"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  placeholder="Additional service logs or details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Add Entry
              </button>
            </form>
          </div>
        )}

        {/* Historical Service Log (Right Table Grid) */}
        <div className="card" style={{ gridColumn: canWrite ? 'span 2' : 'span 3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Service Log History</h3>
            <select
              className="filter-select"
              style={{ padding: '6px 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {loading && (
            <div className="spinner-container" style={{ minHeight: '120px' }}>
              <div className="spinner"></div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && (
            <div className="table-container">
              {logs.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '120px' }}>
                  <h3>No maintenance records</h3>
                  <p>Schedule a service entry to register log history</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Service Type</th>
                      <th>Cost (INR)</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Notes</th>
                      {canWrite && <th style={{ textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id}>
                        <td style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}>
                          {log.vehicle ? log.vehicle.registrationNumber : <span style={{ color: 'var(--status-retired)' }}>Retired / Deleted</span>}
                        </td>
                        <td>{log.serviceType}</td>
                        <td>₹{log.cost.toLocaleString()}</td>
                        <td style={{ fontSize: '12px' }}>{new Date(log.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${log.status.toLowerCase() === 'active' ? 'dispatched' : 'completed'}`}>
                            {log.status === 'Active' ? 'Active (In Shop)' : 'Completed'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--color-text-dimmed)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.notes}>
                          {log.notes || '—'}
                        </td>
                        {canWrite && (
                          <td style={{ textAlign: 'right' }}>
                            {log.status === 'Active' && (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '6px 10px', marginRight: '6px', background: 'var(--status-available)', borderColor: 'var(--status-available)' }}
                                title="Mark Completed"
                                onClick={() => handleComplete(log._id)}
                              >
                                <CheckCircle size={12} />
                              </button>
                            )}
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', color: 'var(--status-retired)' }}
                              title="Delete Record"
                              onClick={() => handleDelete(log._id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
