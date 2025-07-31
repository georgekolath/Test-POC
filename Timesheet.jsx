

import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Timesheet({ setAlertInfo, compOffData = {} }) {
  // compOffData: { day: hours } from leave management
  const lastAlertedDate = useRef(null);
  const today = new Date();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [billable, setBillable] = useState({}); // {day: hours}
  const [nonBillable, setNonBillable] = useState({}); // {day: hours}
  const [compOffState, setCompOffState] = useState({}); // for persisted comp off
  const [loadedTimesheet, setLoadedTimesheet] = useState({}); // {day: {billable, nonBillable, compOff}}
  const [alertQueue, setAlertQueue] = useState([]); // missing days queue
  const [alertIndex, setAlertIndex] = useState(0); // current alert index
  const [showAlert, setShowAlert] = useState(false);

  // Fetch timesheet data for the current week on mount
  useEffect(() => {
    const fetchTimesheet = async () => {
      const userId = 1; // Replace with actual user logic if needed
      const weekStart = getWeekStart(today);
      const res = await fetch(`/api/timesheet?userId=${userId}&weekStart=${weekStart.toISOString().slice(0,10)}`);
      if (res.ok) {
        const data = await res.json();
        // data: [{date, billable, nonBillable, compOff}]
        const billableObj = {};
        const nonBillableObj = {};
        const compOffObj = {};
        const loadedObj = {};
        for (const entry of data) {
          const dayName = daysOfWeek[new Date(entry.date).getDay() === 0 ? 6 : new Date(entry.date).getDay() - 1];
          billableObj[dayName] = entry.billable;
          nonBillableObj[dayName] = entry.nonBillable;
          compOffObj[dayName] = entry.compOff;
          loadedObj[dayName] = {
            billable: entry.billable,
            nonBillable: entry.nonBillable,
            compOff: entry.compOff
          };
        }
        setBillable(billableObj);
        setNonBillable(nonBillableObj);
        setCompOffState(compOffObj);
        setLoadedTimesheet(loadedObj);
      }
    };
    fetchTimesheet();
  }, []);

  // Alert logic (unchanged, but now based on billable/nonBillable)
  // Remove automatic alert logic from useEffect
  // Alert logic now only triggered on submit

  // Call this when user responds to alert (Yes/No)
  // Track if submit is pending after alerts
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const nextAlert = async () => {
    setAlertIndex(idx => {
      const nextIdx = idx + 1;
      if (nextIdx < alertQueue.length) {
        setAlertInfo({ date: alertQueue[nextIdx] });
        return nextIdx;
      } else {
        setShowAlert(false);
        setAlertInfo(null);
        if (pendingSubmit) {
          handleSave().then(() => {
            alert('Timesheet submitted!');
            setPendingSubmit(false);
          });
        }
        return nextIdx;
      }
    });
  };


  const handleBillableChange = (day, value) => {
    // Store as number if possible
    const num = value === '' ? '' : Number(value);
    setBillable(prev => ({ ...prev, [day]: num }));
  };
  const handleNonBillableChange = (day, value) => {
    const num = value === '' ? '' : Number(value);
    setNonBillable(prev => ({ ...prev, [day]: num }));
  };

  const handleSave = async () => {
    // Persist timesheet data to backend
    const userId = 1; // Replace with actual user logic if needed
    const weekStart = getWeekStart(today);
    // For each day, preserve billable/nonBillable as last entered or loaded
    const mergedCompOff = { ...compOffState, ...compOffData };
    for (const day of daysOfWeek) {
      // Use last loaded value if not present in current state
      const billableVal = billable[day] !== undefined ? billable[day] : (loadedTimesheet[day]?.billable ?? '');
      const nonBillableVal = nonBillable[day] !== undefined ? nonBillable[day] : (loadedTimesheet[day]?.nonBillable ?? '');
      const compOffVal = mergedCompOff[day] !== undefined ? mergedCompOff[day] : (loadedTimesheet[day]?.compOff ?? '');
      const entry = {
        userId,
        date: getDateForDay(day, today),
        billable: billableVal,
        nonBillable: nonBillableVal,
        compOff: compOffVal
      };
      await fetch('/api/timesheet/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    }
    alert('Timesheet saved!');
    // Update compOffState after save
    setCompOffState(mergedCompOff);
  };
  const handleSubmit = async () => {
    // On submit, check for missing entries
    const mergedCompOff = { ...compOffState, ...compOffData };
    const missing = daysOfWeek.filter(day => {
      const hasCompOff = mergedCompOff[day];
      const billableVal = Number(billable[day]);
      const nonBillableVal = Number(nonBillable[day]);
      const hasBillable = !isNaN(billableVal) && billableVal > 0;
      const hasNonBillable = !isNaN(nonBillableVal) && nonBillableVal > 0;
      return !hasCompOff && !hasBillable && !hasNonBillable;
    });
    if (missing.length > 0) {
      setAlertQueue(missing);
      setAlertIndex(0);
      setShowAlert(true);
      setAlertInfo({ date: missing[0] });
      setPendingSubmit(true);
      return;
    }
    // If no missing entries, proceed to save/submit
    await handleSave();
    alert('Timesheet submitted!');
  };

  // Helper to get week start (Monday)
  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    return d;
  }
  // Helper to get date string for a given day name in current week
  function getDateForDay(dayName, refDate) {
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const monday = getWeekStart(refDate);
    const idx = weekDays.indexOf(dayName);
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return d.toISOString().slice(0, 10);
  }


  return (
    <div className="container-fluid" style={{ minHeight: '500px' }}>
      <h2 className="mb-4">Timesheet</h2>
      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th></th>
            {daysOfWeek.map(day => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Billable</strong></td>
            {daysOfWeek.map(day => (
              <td key={day}>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  max={24}
                  value={billable[day] || ''}
                  onChange={e => handleBillableChange(day, e.target.value)}
                />
              </td>
            ))}
          </tr>
          <tr>
            <td><strong>Non-billable</strong></td>
            {daysOfWeek.map(day => (
              <td key={day}>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  max={24}
                  value={nonBillable[day] || ''}
                  onChange={e => handleNonBillableChange(day, e.target.value)}
                />
              </td>
            ))}
          </tr>
          <tr>
            <td><strong>Comp Off</strong></td>
            {daysOfWeek.map(day => (
              <td key={day}>
                <input
                  type="number"
                  className="form-control"
                  value={(compOffData[day] !== undefined ? compOffData[day] : compOffState[day]) || ''}
                  readOnly
                  style={{ background: '#eee' }}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="mb-3 text-center">
        <button className="btn btn-success me-2" onClick={handleSave}>Save</button>
        <button className="btn btn-primary me-2" onClick={handleSubmit}>Submit Timesheet</button>
      </div>
    </div>
  );
}
export default Timesheet;