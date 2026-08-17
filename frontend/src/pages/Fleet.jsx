import React from 'react';
import { Plus } from 'lucide-react';

const Fleet = () => {
  const vehicles = [
    { reg: 'GJ01AB4521', model: 'VAN-05', type: 'Van', capacity: '500 kg', odometer: '74,000', cost: '6,20,000', status: 'Available' },
    { reg: 'GJ01AB9981', model: 'TRUCK-11', type: 'Truck', capacity: '5 Ton', odometer: '182,000', cost: '24,50,000', status: 'On Trip' },
    { reg: 'GJ01AB1120', model: 'MINI-03', type: 'Mini', capacity: '1 Ton', odometer: '66,000', cost: '4,10,000', status: 'In Shop' },
    { reg: 'GJ01AB0081', model: 'VAN-09', type: 'Van', capacity: '750 kg', odometer: '241,900', cost: '5,90,000', status: 'Retired' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Vehicle Registry</h1>
          <p>Manage fleet details, capacities and statuses</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select className="filter-select" defaultValue="All">
          <option value="All">Type: All</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Mini">Mini</option>
        </select>
        <select className="filter-select" defaultValue="All">
          <option value="All">Status: All</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>
        <input type="text" className="filter-input" placeholder="Search reg. no..." />
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reg. No. (Unique)</th>
              <th>Name/Model</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer (km)</th>
              <th>Acq. Cost (INR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v, idx) => (
              <tr key={idx}>
                <td style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}>{v.reg}</td>
                <td>{v.model}</td>
                <td>{v.type}</td>
                <td>{v.capacity}</td>
                <td>{v.odometer}</td>
                <td>{v.cost}</td>
                <td>
                  <span className={`badge badge-${v.status.toLowerCase().replace(' ', '')}`}>
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ color: 'var(--color-primary)', fontSize: '13px', marginTop: '12px' }}>
        <strong>Rule:</strong> Registration No. must be unique &bull; Retired/In Shop vehicles are hidden from Trip Dispatcher
      </div>
    </div>
  );
};

export default Fleet;
