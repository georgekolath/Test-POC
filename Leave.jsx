

import React, { useState } from 'react';
import { applyLeave } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const leaveTypes = ['Sick Leave', 'Casual Leave', 'Earned Leave', 'Work From Home'];

function Leave({ date, onLeaveApplied }) {
  const [leaveType, setLeaveType] = useState(leaveTypes[0]);
  const [fromDate, setFromDate] = useState(date || '');
  const [toDate, setToDate] = useState(date || '');
  const [reason, setReason] = useState('');
  const [leaveApplied, setLeaveApplied] = useState(false);
  const [status, setStatus] = useState('Pending');

  const handleApplyLeave = async () => {
    await applyLeave({ leaveType, fromDate, toDate, reason });
    setLeaveApplied(true);
    setStatus('Applied');
    if (onLeaveApplied) onLeaveApplied(fromDate, toDate);
  };

  const handleCancel = () => {
    setLeaveApplied(false);
    setStatus('Cancelled');
    if (onLeaveApplied) onLeaveApplied();
  };

  return (
    <div className="container" style={{ maxWidth: 500, margin: '32px auto' }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-4">Leave Management</h2>
          <form>
            <div className="mb-3">
              <label className="form-label">Leave Type</label>
              <select className="form-select" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">From Date</label>
              <input type="date" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">To Date</label>
              <input type="date" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Reason</label>
              <input type="text" className="form-control" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for leave" />
            </div>
            <div className="mb-3">
              <button type="button" className="btn btn-success me-2" onClick={handleApplyLeave}>Apply Leave</button>
              <button type="button" className="btn btn-outline-danger" onClick={handleCancel}>Cancel</button>
            </div>
            {leaveApplied && <div className="alert alert-success">Leave applied! Status: {status}</div>}
            {!leaveApplied && status === 'Cancelled' && <div className="alert alert-danger">Leave cancelled.</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
export default Leave;
