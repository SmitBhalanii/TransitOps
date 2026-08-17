import React, { useState } from 'react';
import { Route as RouteIcon, AlertOctagon, Check } from 'lucide-react';

const Trips = () => {
  const [cargoWeight, setCargoWeight] = useState(700);
  const vehicleCapacity = 500;
  const isOverCapacity = cargoWeight > vehicleCapacity;

  const liveTrips = [
    { code: 'TR001', route: 'Gandhinagar Depot ➔ Ahmedabad Hub', assignment: 'VAN-05 / ALEX', status: 'Dispatched', info: '45 min' },
    { code: 'TR004', route: 'Vatva Industrial Area ➔ Sanand Warehouse', assignment: 'TRUCK-04 / SURESH', status: 'Draft', info: 'Awaiting driver' },
    { code: 'TR006', route: 'Mansa ➔ Kalol Depot', assignment: 'Unassigned', status: 'Cancelled', info: 'Vehicle went to shop' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Trip Dispatcher</h1>
          <p>Schedule dispatches, configure weights, and track trip status</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: Create Trip form */}
        <div className="table-container" style={{ padding: '24px' }}>
          {/* Trip Lifecycle Nodes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', position: 'relative', padding: '0 8px' }}>
            <div style={{ position: 'absolute', height: '2px', background: 'var(--border-color)', top: '10px', left: '16px', right: '16px', zIndex: 1 }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--status-available)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}><Check size={12} color="#fff" /></div>
              <span style={{ fontSize: '11px', color: 'var(--status-available)', fontWeight: 600 }}>Draft</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--status-ontrip)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--status-ontrip)', fontWeight: 600 }}>Dispatched</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-dimmed)' }}>Completed</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-dimmed)' }}>Cancelled</span>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Create Trip</h3>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">Source</label>
              <input type="text" className="form-control" defaultValue="Gandhinagar Depot" />
            </div>

            <div className="form-group">
              <label className="form-label">Destination</label>
              <input type="text" className="form-control" defaultValue="Ahmedabad Hub" />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle (Available Only)</label>
              <select className="form-control" defaultValue="van05">
                <option value="van05">VAN-05 - 500 kg capacity</option>
                <option value="truck11">TRUCK-11 - 5 Ton capacity</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Driver (Available Only)</label>
              <select className="form-control" defaultValue="alex">
                <option value="alex">Alex (License: LMV)</option>
                <option value="priya">Priya (License: LMV)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cargo Weight (kg)</label>
              <input
                type="number"
                className="form-control"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Planned Distance (km)</label>
              <input type="number" className="form-control" defaultValue="38" />
            </div>

            {/* Validation Panel */}
            {isOverCapacity && (
              <div className="alert alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertOctagon size={24} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Vehicle Capacity: {vehicleCapacity} kg</div>
                  <div>Cargo Weight: {cargoWeight} kg</div>
                  <div style={{ marginTop: '4px', textDecoration: 'underline' }}>Capacity exceeded by {cargoWeight - vehicleCapacity} kg — dispatch blocked</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={isOverCapacity}>
                Dispatch {isOverCapacity && '(Disabled)'}
              </button>
              <button className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live board list */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>Live Board</h3>
          {liveTrips.map((trip, idx) => (
            <div key={idx} className="table-container" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-dimmed)', fontWeight: 600 }}>{trip.code}</span>
                  <h4 style={{ fontSize: '15px', color: 'var(--color-text)', marginTop: '2px', fontWeight: 600 }}>{trip.route}</h4>
                </div>
                <span className={`badge badge-${trip.status.toLowerCase()}`}>{trip.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px', color: 'var(--color-text-muted)' }}>
                <span>{trip.assignment}</span>
                <span style={{ color: 'var(--color-text-dimmed)' }}>{trip.info}</span>
              </div>
            </div>
          ))}
          
          <div style={{ color: 'var(--color-primary)', fontSize: '13px', marginTop: '24px' }}>
            <strong>On Complete:</strong> odometer ➔ fuel log ➔ expenses ➔ Vehicle &amp; Driver become Available
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trips;
