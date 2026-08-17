import React, { useState, useEffect, useContext } from 'react';
import { getDrivers, createDriver, updateDriver, deleteDriver, suspendDriver } from '../services/driverService';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, ShieldAlert, X, AlertTriangle, Edit2, Trash2, ShieldOff } from 'lucide-react';

const Drivers = () => {
  const { user } = useContext(AuthContext);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchVal, setSearchVal] = useState('');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseCat, setLicenseCat] = useState('LMV');
  const [expiryDate, setExpiryDate] = useState('');
  const [contact, setContact] = useState('');
  const [tripRate, setTripRate] = useState(100);
  const [safetyScore, setSafetyScore] = useState(10.0);
  const [status, setStatus] = useState('Available');

  // Verify write privileges
  const canWrite = user?.role === 'admin' || user?.role === 'fleet_manager' || user?.role === 'safety_officer';

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter !== 'All') filters.status = statusFilter;
      if (searchVal) filters.search = searchVal;

      const response = await getDrivers(filters);
      if (response.status === 'success') {
        setDrivers(response.data.drivers);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [statusFilter, searchVal]);

  const handleOpenAddModal = () => {
    setEditingDriver(null);
    setName('');
    setLicenseNo('');
    setLicenseCat('LMV');
    setExpiryDate('');
    setContact('');
    setTripRate(100);
    setSafetyScore(10.0);
    setStatus('Available');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (d) => {
    setEditingDriver(d);
    setName(d.name);
    setLicenseNo(d.licenseNumber);
    setLicenseCat(d.licenseCategory);
    
    // Format date to YYYY-MM-DD for input element
    const rawDate = d.licenseExpiryDate ? new Date(d.licenseExpiryDate) : new Date();
    const formattedDate = rawDate.toISOString().split('T')[0];
    setExpiryDate(formattedDate);
    
    setContact(d.contactNumber);
    setTripRate(d.tripCompletionRate);
    setSafetyScore(d.safetyScore);
    setStatus(d.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      name,
      licenseNumber: licenseNo,
      licenseCategory: licenseCat,
      licenseExpiryDate: expiryDate,
      contactNumber: contact,
      tripCompletionRate: Number(tripRate),
      safetyScore: Number(safetyScore),
      status,
    };

    try {
      if (editingDriver) {
        await updateDriver(editingDriver._id, payload);
      } else {
        await createDriver(payload);
      }
      setIsModalOpen(false);
      fetchDrivers();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Validation error saving driver');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this driver record?')) return;
    try {
      await deleteDriver(id);
      fetchDrivers();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete driver');
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Are you sure you want to suspend this driver?')) return;
    try {
      await suspendDriver(id);
      fetchDrivers();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to suspend driver');
    }
  };

  // Helper to parse if date is expired
  const isExpired = (expiryStr) => {
    if (!expiryStr) return false;
    return new Date(expiryStr) < new Date();
  };

  // Helper to format date display (MM/YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${yyyy}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Drivers &amp; Safety Profiles</h1>
          <p>Verify operator licenses, track trip completions, and monitor safety records</p>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            Add Driver
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Status: All</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Suspended">Suspended</option>
          <option value="Off Duty">Off Duty</option>
        </select>

        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            className="filter-input"
            style={{ width: '100%', paddingLeft: '38px' }}
            placeholder="Search driver name or license no..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dimmed)' }} />
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Driver List Table */}
      {!loading && !error && (
        <div className="table-container">
          {drivers.length === 0 ? (
            <div className="empty-state">
              <h3>No drivers found</h3>
              <p>Try refining search params or add a new driver profile</p>
            </div>
          ) : (
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
                  {canWrite && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => {
                  const expired = isExpired(d.licenseExpiryDate);
                  return (
                    <tr key={d._id}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td>{d.licenseNumber}</td>
                      <td>{d.licenseCategory}</td>
                      <td>
                        <span style={{ color: expired ? 'var(--status-retired)' : 'inherit', fontWeight: expired ? 'bold' : 'normal' }}>
                          {formatDate(d.licenseExpiryDate)}
                          {expired && (
                            <strong style={{ marginLeft: '6px', fontSize: '9px', background: 'var(--status-retired-bg)', color: 'var(--status-retired)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              EXPIRED
                            </strong>
                          )}
                        </span>
                      </td>
                      <td>{d.contactNumber}</td>
                      <td>{d.tripCompletionRate}%</td>
                      <td style={{ fontWeight: 600 }}>
                        <span style={{ color: d.safetyScore >= 9.0 ? 'var(--status-available)' : d.safetyScore >= 7.0 ? 'var(--status-inshop)' : 'var(--status-retired)' }}>
                          {d.safetyScore.toFixed(1)} / 10
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${d.status.toLowerCase().replace(' ', '')}`}>
                          {d.status}
                        </span>
                      </td>
                      {canWrite && (
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', marginRight: '6px' }}
                            title="Edit Profile"
                            onClick={() => handleOpenEditModal(d)}
                          >
                            <Edit2 size={12} />
                          </button>
                          {d.status !== 'Suspended' && (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', marginRight: '6px', color: 'var(--status-inshop)' }}
                              title="Suspend Driver"
                              onClick={() => handleSuspend(d._id)}
                            >
                              <ShieldOff size={12} />
                            </button>
                          )}
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', color: 'var(--status-retired)' }}
                            title="Remove Record"
                            onClick={() => handleDelete(d._id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={{ color: 'var(--color-primary)', fontSize: '13px' }}>
        <strong>Rule:</strong> Expired license or Suspended status &bull; blocked from trip assignment
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="table-container" style={{ width: '90%', maxWidth: '520px', padding: '32px', background: 'var(--bg-secondary)', position: 'relative' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
              {editingDriver ? 'Edit Driver Profile' : 'Register Driver'}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '13px' }}>
              {editingDriver ? `Update compliance details for ${editingDriver.name}` : 'Create a new driver entry and license details'}
            </p>

            {formError && (
              <div className="alert alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Alex"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">License Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="DL-88213"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">License Category</label>
                  <select
                    className="form-control"
                    value={licenseCat}
                    onChange={(e) => setLicenseCat(e.target.value)}
                    required
                  >
                    <option value="LMV">LMV (Light Motor Vehicle)</option>
                    <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">License Expiry</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Contact Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="98765xxxxx"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Safety Score (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="10.0"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '16px', marginBottom: '24px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Trip Completion (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="100"
                    value={tripRate}
                    onChange={(e) => setTripRate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Profile
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
