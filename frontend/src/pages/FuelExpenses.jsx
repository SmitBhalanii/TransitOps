import React, { useState, useEffect, useContext } from 'react';
import { getExpenses, createExpense, getOperationalCost, deleteExpense } from '../services/expenseService';
import { createFuelLog } from '../services/fuelService';
import { getVehicles } from '../services/vehicleService';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, ShieldAlert, X, AlertTriangle, Trash2, Calendar, DollarSign, Fuel, Wrench, Coins } from 'lucide-react';

const FuelExpenses = () => {
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('All');

  // Server-side calculated operational costs
  const [opBreakdown, setOpBreakdown] = useState({ Fuel: 0, Maintenance: 0, Toll: 0, Other: 0 });
  const [opTotal, setOpTotal] = useState(0);

  // Refuel Form Fields
  const [refuelVehicle, setRefuelVehicle] = useState('');
  const [liters, setLiters] = useState(30);
  const [fuelCost, setFuelCost] = useState(3000);
  const [refuelDate, setRefuelDate] = useState(new Date().toISOString().split('T')[0]);

  // General Expense Form Fields
  const [expenseVehicle, setExpenseVehicle] = useState('');
  const [expenseType, setExpenseType] = useState('Toll');
  const [amount, setAmount] = useState(500);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  // Write permissions: Admin, Financial Analyst, Fleet Manager
  const canWrite = user?.role === 'admin' || user?.role === 'financial_analyst' || user?.role === 'fleet_manager';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (typeFilter !== 'All') filters.expenseType = typeFilter;
      if (selectedVehicleFilter !== 'All') filters.vehicle = selectedVehicleFilter;

      // 1) Fetch Expense List
      const expRes = await getExpenses(filters);
      if (expRes.status === 'success') {
        setExpenses(expRes.data.expenses);
      }

      // 2) Fetch Vehicles list
      const vehiclesRes = await getVehicles();
      if (vehiclesRes.status === 'success') {
        const eligible = vehiclesRes.data.vehicles.filter(v => v.status !== 'Retired');
        setVehicles(eligible);
      }

      // 3) Fetch Server-Side Recalculated Operational Costs
      const costRes = await getOperationalCost(
        selectedVehicleFilter !== 'All' ? { vehicle: selectedVehicleFilter } : {}
      );
      if (costRes.status === 'success') {
        setOpBreakdown(costRes.data.breakdown);
        setOpTotal(costRes.data.totalOperationalCost);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load ledger records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, selectedVehicleFilter]);

  // Set default selectors when vehicles load
  useEffect(() => {
    if (vehicles.length > 0) {
      if (!refuelVehicle) setRefuelVehicle(vehicles[0]._id);
      if (!expenseVehicle) setExpenseVehicle(vehicles[0]._id);
    }
  }, [vehicles]);

  const handleRefuelSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      vehicle: refuelVehicle,
      liters: Number(liters),
      fuelCost: Number(fuelCost),
      date: refuelDate,
    };

    try {
      await createFuelLog(payload);
      setLiters(30);
      setFuelCost(3000);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to record refueling');
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      vehicle: expenseVehicle,
      expenseType,
      amount: Number(amount),
      date: expenseDate,
      description,
    };

    try {
      await createExpense(payload);
      setDescription('');
      setAmount(500);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to log expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this ledger entry?')) return;
    try {
      await deleteExpense(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete expense');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Fuel &amp; Expense Ledger</h1>
          <p>Monitor real-time refueling logs, trip toll fees, maintenance-linked expenses, and total operational costs</p>
        </div>
      </div>

      {/* Operational Cost Summary Cards */}
      <div className="grid-4" style={{ gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-retired)', padding: '10px', borderRadius: '6px' }}>
            <Fuel size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Fuel Costs</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>₹{opBreakdown.Fuel.toLocaleString()}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-inshop)', padding: '10px', borderRadius: '6px' }}>
            <Wrench size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Maintenance</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>₹{opBreakdown.Maintenance.toLocaleString()}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', padding: '10px', borderRadius: '6px' }}>
            <Coins size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Tolls &amp; Other</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>₹{(opBreakdown.Toll + opBreakdown.Other).toLocaleString()}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--color-primary)' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--color-primary)', padding: '10px', borderRadius: '6px' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Operational Cost</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>₹{opTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gap: '24px', alignItems: 'start' }}>
        {/* Form Inputs Panel (Left Sidebar) */}
        {canWrite && (
          <div className="card" style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. Log Refueling */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px', color: 'var(--status-retired)' }}>Log Refueling</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-dimmed)', marginBottom: '16px' }}>Record fuel gallons and cost values</p>
              
              <form onSubmit={handleRefuelSubmit}>
                <div className="form-group">
                  <label className="form-label">Select Vehicle</label>
                  <select
                    className="form-control"
                    value={refuelVehicle}
                    onChange={(e) => setRefuelVehicle(e.target.value)}
                    required
                  >
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>{v.registrationNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Liters</label>
                    <input
                      type="number"
                      className="form-control"
                      value={liters}
                      onChange={(e) => setLiters(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cost (INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={refuelDate}
                    onChange={(e) => setRefuelDate(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--status-retired)', borderColor: 'var(--status-retired)' }}>
                  Log Fuel
                </button>
              </form>
            </div>

            {/* 2. Log Road Cost / Toll / Other */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px', color: 'var(--color-primary)' }}>Log Operational Cost</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-dimmed)', marginBottom: '16px' }}>Log trip tolls or misc road expenses</p>
              
              <form onSubmit={handleExpenseSubmit}>
                <div className="form-group">
                  <label className="form-label">Select Vehicle</label>
                  <select
                    className="form-control"
                    value={expenseVehicle}
                    onChange={(e) => setExpenseVehicle(e.target.value)}
                    required
                  >
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>{v.registrationNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Expense Type</label>
                    <select
                      className="form-control"
                      value={expenseType}
                      onChange={(e) => setExpenseType(e.target.value)}
                      required
                    >
                      <option value="Toll">Toll</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Amount (INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="National Highway toll tax..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Log Cost
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Unified Financial Ledger Log Table */}
        <div className="card" style={{ gridColumn: canWrite ? 'span 2' : 'span 3' }}>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Unified Financial Ledger</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Fuel">Fuel</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Toll">Toll</option>
                <option value="Other">Other</option>
              </select>
              <select
                className="filter-select"
                value={selectedVehicleFilter}
                onChange={(e) => setSelectedVehicleFilter(e.target.value)}
              >
                <option value="All">All Vehicles</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>{v.registrationNumber}</option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="spinner-container" style={{ minHeight: '180px' }}>
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
              {expenses.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '180px' }}>
                  <h3>No ledger entries found</h3>
                  <p>Log fuel refills or road costs to display historical financials</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Category</th>
                      <th>Amount (INR)</th>
                      <th>Description</th>
                      <th>Date</th>
                      {user?.role === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp._id}>
                        <td style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}>
                          {exp.vehicle ? exp.vehicle.registrationNumber : <span style={{ color: 'var(--status-retired)' }}>Retired</span>}
                        </td>
                        <td>
                          <span className={`badge badge-${exp.expenseType.toLowerCase() === 'fuel' ? 'retired' : exp.expenseType.toLowerCase() === 'maintenance' ? 'inshop' : exp.expenseType.toLowerCase() === 'toll' ? 'dispatched' : 'completed'}`}>
                            {exp.expenseType}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>₹{exp.amount.toLocaleString()}</td>
                        <td style={{ fontSize: '12px', color: 'var(--color-text-dimmed)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={exp.description}>
                          {exp.description || '—'}
                          {exp.trip && <div style={{ fontSize: '10px', color: 'var(--color-primary)' }}>Linked to Trip: {exp.trip.tripCode || 'Active'}</div>}
                        </td>
                        <td style={{ fontSize: '12px' }}>{new Date(exp.date).toLocaleDateString()}</td>
                        {user?.role === 'admin' && (
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', color: 'var(--status-retired)' }}
                              onClick={() => handleDelete(exp._id)}
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

export default FuelExpenses;
