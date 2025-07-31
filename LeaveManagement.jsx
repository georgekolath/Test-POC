import React, { useState } from 'react';

function Leave({ date, onLeaveApplied }) {
  const [applied, setApplied] = useState(false);

  const applyLeave = async () => {
    await fetch('/api/leave/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1, date }),
    });
    setApplied(true);
    onLeaveApplied();
  };

  return (
    <div>
      <h2>Apply Leave for {date}</h2>
      <button onClick={applyLeave}>Apply Leave</button>
      {applied && <span>Leave Applied!</span>}
    </div>
  );
}

export default Leave;