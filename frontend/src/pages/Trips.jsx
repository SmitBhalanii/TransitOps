import React, { useState, useEffect, useContext } from 'react';
import { getTrips, createTrip, updateTrip, deleteTrip, dispatchTrip, completeTrip, cancelTrip } from '../services/tripService';
import { getVehicles } from '../services/vehicleService';
import { getDrivers } from '../services/driverService';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, ShieldAlert, X, AlertTriangle, Eye, Play, CheckCircle, Ban, Trash2, Calendar, User, Truck } from 'lucide-react';

const Trips = () => {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal controls
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Create/Edit Trip Fields
  const [tripCode, setTripCode] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [cargoWeight, setCargoWeight] = useState(500);
  const [plannedDistance, setPlannedDistance] = useState(100);
  const [revenue, setRevenue] = useState(15000);
  const [eta, setEta] = useState('');

  // Complete Trip Fields
  const [actualDistance, setActualDistance] = useState(100);
  const [fuelLiters, setFuelLiters] = useState(0);
  const [fuelCost, setFuelCost] = useState(0);
  const [tollAmount, setTollAmount] = useState(0);
  const [otherAmount, setOtherAmount] = useState(0);
  const [description, setDescription] = useState('');

  // Cancel Trip Fields
  const [cancelReason, setCancelReason] = useState('');

  // Write permissions: Dispatcher or Admin
  const canWrite = user?.role === 'admin' || user?.role === 'dispatcher';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) Fetch Trips
      const filters = {};
      if (statusFilter !== 'All') filters.status = statusFilter;
      const tripsRes = await getTrips(filters);
      if (tripsRes.status === 'success') {
        setTrips(tripsRes.data.trips);
      }

      if (canWrite) {
        // 2) Fetch Vehicles (Only available enums, filter out In Shop, Retired, On Trip)
        const vehiclesRes = await getVehicles({ status: 'Available' });
        if (vehiclesRes.status === 'success') {
          // Double filter to verify we only show enums that don't match Retired/In Shop
          setVehicles(vehiclesRes.data.vehicles.filter(v => v.status === 'Available'));
        }

        // 3) Fetch Drivers (Only available, filter out suspended, expired license, on trip)
        const driversRes = await getDrivers({ status: 'Available' });
        if (driversRes.status === 'success') {
          const now = new Date();
          const eligible = driversRes.data.drivers.filter(
            (d) => d.status === 'Available' && new Date(d.licenseExpiryDate) >= now
          );
          setDrivers(eligible);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch trip board data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleOpenCreateModal = () => {
    setTripCode(`TRIP-${Math.floor(1000 + Math.random() * 9000)}`);
    setSource('');
    setDestination('');
    setSelectedVehicle(vehicles[0]?._id || '');
    setSelectedDriver(drivers[0]?._id || '');
    setCargoWeight(500);
    setPlannedDistance(100);
    setRevenue(15000);
    setEta('');
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedVehicle || !selectedDriver) {
      setFormError('Please select a valid vehicle and driver');
      return;
    }

    const payload = {
      tripCode,
      source,
      destination,
      vehicle: selectedVehicle,
      driver: selectedDriver,
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance),
      revenue: Number(revenue),
      eta,
    };

    try {
      await createTrip(payload);
      setIsCreateOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create trip');
    }
  };

  const handleDispatch = async (id) => {
    if (!window.confirm('Do you want to dispatch this trip? (This will update Vehicle and Driver states to On Trip)')) return;
    try {
      await dispatchTrip(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Dispatch failed');
    }
  };

  const handleOpenCompleteModal = (trip) => {
    setSelectedTrip(trip);
    setActualDistance(trip.plannedDistance);
    setFuelLiters(0);
    setFuelCost(0);
    setTollAmount(0);
    setOtherAmount(0);
    setDescription('');
    setFormError(null);
    setIsCompleteOpen(true);
  };

  const handleCompleteTrip = async (e) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      actualDistance: Number(actualDistance),
      fuelLiters: Number(fuelLiters),
      fuelCost: Number(fuelCost),
      tollAmount: Number(tollAmount),
      otherAmount: Number(otherAmount),
      description,
    };

    try {
      await completeTrip(selectedTrip._id, payload);
      setIsCompleteOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to complete trip');
    }
  };

  const handleOpenCancelModal = (trip) => {
    setSelectedTrip(trip);
    setCancelReason('');
    setFormError(null);
    setIsCancelOpen(true);
  };

  const handleCancelTrip = async (e) => {
    e.preventDefault();
    setFormError(null);

    try {
      await cancelTrip(selectedTrip._id, { cancellationReason: cancelReason });
      setIsCancelOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to cancel trip');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip record?')) return;
    try {
      await deleteTrip(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Delete failed');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Trip Dispatcher</h1>
          <p>Schedule dispatches, monitor weights, and manage cargo routing lifecycles</p>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            Create Trip Draft
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Status: All</option>
          <option value="Draft">Draft</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
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

      {/* Live Trip Board */}
      {!loading && !error && (
        <div className="table-container">
          {trips.length === 0 ? (
            <div className="empty-state">
              <h3>No trips scheduled</h3>
              <p>Create a draft trip to begin dispatch workflows</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Route (Src → Dest)</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Cargo Weight</th>
                  <th>Distance</th>
                  <th>Revenue (INR)</th>
                  <th>Status</th>
                  {canWrite && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}>{t.tripCode}</td>
                    <td>
                      <div>{t.source} → {t.destination}</div>
                      {t.eta && <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)' }}>ETA: {t.eta}</div>}
                    </td>
                    <td>
                      {t.vehicle ? (
                        <div>
                          <div>{t.vehicle.registrationNumber}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)' }}>{t.vehicle.nameModel} ({t.vehicle.capacity} kg)</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--status-retired)' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      {t.driver ? (
                        <div>
                          <div>{t.driver.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-dimmed)' }}>{t.driver.licenseNumber}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--status-retired)' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: t.vehicle && t.cargoWeight > t.vehicle.capacity ? 'var(--status-retired)' : 'inherit', fontWeight: t.vehicle && t.cargoWeight > t.vehicle.capacity ? 'bold' : 'normal' }}>
                        {t.cargoWeight} kg
                      </span>
                    </td>
                    <td>
                      <div>Plan: {t.plannedDistance} km</div>
                      {t.actualDistance && <div style={{ fontSize: '11px', color: 'var(--status-available)' }}>Act: {t.actualDistance} km</div>}
                    </td>
                    <td>₹{t.revenue.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </td>
                    {canWrite && (
                      <td style={{ textAlign: 'right' }}>
                        {t.status === 'Draft' && (
                          <>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 10px', marginRight: '6px', background: 'var(--status-available)', borderColor: 'var(--status-available)' }}
                              title="Dispatch Trip"
                              onClick={() => handleDispatch(t._id)}
                            >
                              <Play size={12} />
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', marginRight: '6px', color: 'var(--status-retired)' }}
                              title="Cancel"
                              onClick={() => handleOpenCancelModal(t)}
                            >
                              <Ban size={12} />
                            </button>
                          </>
                        )}
                        {t.status === 'Dispatched' && (
                          <>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 10px', marginRight: '6px' }}
                              title="Complete Trip"
                              onClick={() => handleOpenCompleteModal(t)}
                            >
                              <CheckCircle size={12} />
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', marginRight: '6px', color: 'var(--status-retired)' }}
                              title="Cancel"
                              onClick={() => handleOpenCancelModal(t)}
                            >
                              <Ban size={12} />
                            </button>
                          </>
                        )}
                        {user?.role === 'admin' && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', color: 'var(--status-retired)' }}
                            title="Delete"
                            onClick={() => handleDelete(t._id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Trip Modal */}
      {isCreateOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="table-container" style={{ width: '90%', maxWidth: '560px', padding: '32px', background: 'var(--bg-secondary)', position: 'relative' }}>
            <button
              onClick={() => setIsCreateOpen(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
              Create Trip Dispatch
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '13px' }}>
              Create a trip draft. Select available vehicles and eligible drivers.
            </p>

            {formError && (
              <div className="alert alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTrip}>
              <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Trip Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tripCode}
                    onChange={(e) => setTripCode(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Planned Distance (km)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Source</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Warehouse A"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Destination</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Customer Hub B"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Vehicle</label>
                  <select
                    className="form-control"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    required
                  >
                    {vehicles.length === 0 ? (
                      <option value="">No available vehicles</option>
                    ) : (
                      vehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.registrationNumber} ({v.nameModel} - {v.capacity} kg)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Driver</label>
                  <select
                    className="form-control"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    required
                  >
                    {drivers.length === 0 ? (
                      <option value="">No available drivers</option>
                    ) : (
                      drivers.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.licenseNumber} - {d.licenseCategory})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid-3" style={{ gap: '16px', marginBottom: '24px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cargo (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Revenue (INR)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">ETA (Hours)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="4 Hours"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Draft
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {isCompleteOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="table-container" style={{ width: '90%', maxWidth: '540px', padding: '32px', background: 'var(--bg-secondary)', position: 'relative' }}>
            <button
              onClick={() => setIsCompleteOpen(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
              Complete Trip: {selectedTrip?.tripCode}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '13px' }}>
              Log actual route parameters and record trip fuel &amp; road expenses.
            </p>

            {formError && (
              <div className="alert alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCompleteTrip}>
              <div className="form-group">
                <label className="form-label">Actual Distance Traveled (km)</label>
                <input
                  type="number"
                  className="form-control"
                  value={actualDistance}
                  onChange={(e) => setActualDistance(e.target.value)}
                  required
                />
              </div>

              <h4 style={{ color: 'var(--color-primary)', fontSize: '14px', marginTop: '20px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                Refueling &amp; Fuel Expenses
              </h4>
              <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Fuel Liters</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Fuel Cost (INR)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                  />
                </div>
              </div>

              <h4 style={{ color: 'var(--color-primary)', fontSize: '14px', marginTop: '20px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                Road &amp; Operational Costs
              </h4>
              <div className="grid-2" style={{ gap: '16px', marginBottom: '24px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tolls Amount (INR)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={tollAmount}
                    onChange={(e) => setTollAmount(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Other Expense (INR)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={otherAmount}
                    onChange={(e) => setOtherAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Other Expense Description</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Parking fees, driver allowance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Complete Dispatch
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCompleteOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Trip Modal */}
      {isCancelOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="table-container" style={{ width: '90%', maxWidth: '440px', padding: '32px', background: 'var(--bg-secondary)', position: 'relative' }}>
            <button
              onClick={() => setIsCancelOpen(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
              Cancel Trip: {selectedTrip?.tripCode}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '13px' }}>
              Provide the cancellation reason below. Active driver and vehicle states will be released.
            </p>

            {formError && (
              <div className="alert alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCancelTrip}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Cancellation Reason</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Cargo delay, bad weather, client request..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'var(--status-retired)', borderColor: 'var(--status-retired)' }}>
                  Cancel Trip
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCancelOpen(false)}>
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
