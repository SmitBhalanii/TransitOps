import React, { useState, useEffect, useContext } from 'react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/vehicleService';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, ShieldAlert, X, AlertTriangle, Eye, Edit2, Trash2 } from 'lucide-react';

const Fleet = () => {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchVal, setSearchVal] = useState('');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Form Fields
  const [regNo, setRegNo] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Van');
  const [capacity, setCapacity] = useState(1000);
  const [odometer, setOdometer] = useState(10000);
  const [acqCost, setAcqCost] = useState(500000);
  const [status, setStatus] = useState('Available');

  // Check write permission (Fleet Manager or Admin)
  const canWrite = user?.role === 'admin' || user?.role === 'fleet_manager';

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (typeFilter !== 'All') filters.type = typeFilter;
      if (statusFilter !== 'All') filters.status = statusFilter;
      if (searchVal) filters.search = searchVal;

      const response = await getVehicles(filters);
      if (response.status === 'success') {
        setVehicles(response.data.vehicles);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [typeFilter, statusFilter, searchVal]);

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setRegNo('');
    setModel('');
    setType('Van');
    setCapacity(1000);
    setOdometer(10000);
    setAcqCost(500000);
    setStatus('Available');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v) => {
    setEditingVehicle(v);
    setRegNo(v.registrationNumber);
    setModel(v.nameModel);
    setType(v.type);
    setCapacity(v.capacity);
    setOdometer(v.odometer);
    setAcqCost(v.acquisitionCost);
    setStatus(v.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      registrationNumber: regNo,
      nameModel: model,
      type,
      capacity: Number(capacity),
      odometer: Number(odometer),
      acquisitionCost: Number(acqCost),
      status,
    };

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle._id, payload);
      } else {
        await createVehicle(payload);
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Validation error saving vehicle');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle record?')) return;
    try {
      await deleteVehicle(id);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete vehicle');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Vehicle Registry</h1>
          <p>Manage fleet inventory, capacities, and statuses</p>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            Add Vehicle
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="filter-bar">
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">Type: All</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Mini">Mini</option>
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Status: All</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>

        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            className="filter-input"
            style={{ width: '100%', paddingLeft: '38px' }}
            placeholder="Search reg. no. or model name..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dimmed)' }} />
        </div>
      </div>

      {/* Diagnostic States */}
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

      {/* Vehicle Grid Table */}
      {!loading && !error && (
        <div className="table-container">
          {vehicles.length === 0 ? (
            <div className="empty-state">
              <h3>No vehicles found</h3>
              <p>Try broadening your query parameters or add a new vehicle record</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reg. No. (Unique)</th>
                  <th>Name/Model</th>
                  <th>Type</th>
                  <th>Capacity (kg)</th>
                  <th>Odometer (km)</th>
                  <th>Acq. Cost (INR)</th>
                  <th>Status</th>
                  {canWrite && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id}>
                    <td style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}>{v.registrationNumber}</td>
                    <td>{v.nameModel}</td>
                    <td>{v.type}</td>
                    <td>{v.capacity.toLocaleString()} kg</td>
                    <td>{v.odometer.toLocaleString()}</td>
                    <td>{v.acquisitionCost.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${v.status.toLowerCase().replace(' ', '')}`}>
                        {v.status}
                      </span>
                    </td>
                    {canWrite && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', marginRight: '6px' }}
                          onClick={() => handleOpenEditModal(v)}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', color: 'var(--status-retired)' }}
                          onClick={() => handleDelete(v._id)}
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

      <div style={{ color: 'var(--color-primary)', fontSize: '13px', marginTop: '12px' }}>
        <strong>Rule:</strong> Registration No. must be unique &bull; Retired/In Shop vehicles are hidden from Trip Dispatcher
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
              {editingVehicle ? 'Edit Vehicle' : 'Register Vehicle'}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '13px' }}>
              {editingVehicle ? `Update details for vehicle ${editingVehicle.registrationNumber}` : 'Enter new vehicle details into registry'}
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
                  <label className="form-label">Registration No.</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="GJ01AB4521"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Name/Model</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VAN-05"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Vehicle Type</label>
                  <select
                    className="form-control"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Capacity (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="1000"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Odometer (km)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="10000"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Acq. Cost (INR)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="500000"
                    value={acqCost}
                    onChange={(e) => setAcqCost(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Vehicle
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

export default Fleet;
