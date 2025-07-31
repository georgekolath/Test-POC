import React, { useState } from 'react';
import Timesheet from './components/Timesheet';
import Leave from './components/Leave';
import AlertPopup from './components/AlertPopup';

function App() {
  const [activeApp, setActiveApp] = useState('timesheet'); // 'timesheet' or 'leave'
  const [showLeave, setShowLeave] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [alertDisabled, setAlertDisabled] = useState(false);
  const alertTimerRef = React.useRef(null);

  const [leaveDate, setLeaveDate] = useState(null);
  const [compOffData, setCompOffData] = useState({});

  const handleAlertYes = () => {
    // Convert day name to valid yyyy-MM-dd date for Leave
    const dayName = alertInfo?.date;
    if (dayName) {
      // Find the date for the current week for the given day name
      const today = new Date();
      const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayIndex = weekDays.indexOf(dayName);
      // Get Monday of current week
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      // Calculate the date for the selected day
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + dayIndex);
      const yyyyMMdd = targetDate.toISOString().slice(0, 10);
      setLeaveDate(yyyyMMdd);
    } else {
      setLeaveDate(null);
    }
    setActiveApp('leave');
    setAlertInfo(null);
  };

  const handleAlertNo = () => {
    // Close popup and disable alert for 10 seconds
    setAlertInfo(null);
    setAlertDisabled(true);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    alertTimerRef.current = setTimeout(() => {
      setAlertDisabled(false);
    }, 10000);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">Management System</span>
          <div className="navbar-nav">
            <button className={`nav-link btn btn-link${activeApp === 'timesheet' ? ' active' : ''}`} onClick={() => setActiveApp('timesheet')}>Timesheet Management</button>
            <button className={`nav-link btn btn-link${activeApp === 'leave' ? ' active' : ''}`} onClick={() => setActiveApp('leave')}>Leave Management</button>
          </div>
        </div>
      </nav>
      {activeApp === 'timesheet' && (
        <>
          <Timesheet setAlertInfo={info => {
            if (!alertDisabled) setAlertInfo(info);
          }} compOffData={compOffData} />
          {showLeave && <Leave date={leaveDate} onLeaveApplied={() => setShowLeave(false)} />}
          {alertInfo && !showLeave && !alertDisabled && (
          <AlertPopup
            date={alertInfo.date}
            onNo={handleAlertNo}
            onYes={handleAlertYes}
            onClose={() => setAlertInfo(null)}
          />
          )}
        </>
      )}
      {activeApp === 'leave' && (
        <Leave
          date={leaveDate}
          onLeaveApplied={(fromDate, toDate) => {
            // Only update compOffData, do not touch billable/nonBillable
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            let start = new Date(fromDate + 'T00:00:00');
            let end = new Date(toDate + 'T00:00:00');
            let d = new Date(start);
            setCompOffData(prev => {
              const newCompOff = { ...prev };
              while (d <= end) {
                let jsDay = d.getDay();
                let dayName = daysOfWeek[jsDay === 0 ? 6 : jsDay - 1];
                newCompOff[dayName] = 8;
                newCompOff[d.toISOString().slice(0,10)] = 8;
                d.setDate(d.getDate() + 1);
              }
              return newCompOff;
            });
            setActiveApp('timesheet');
          }}
        />
      )}
    </div>
  );
}

export default App;