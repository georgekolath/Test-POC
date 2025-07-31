import React, { useEffect } from 'react';

function AlertPopup({ date, onNo, onYes, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 15000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '30%',
      left: '50%',
      transform: 'translate(-50%, -30%)',
      background: '#fff',
      border: '1px solid #333',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      padding: '32px 24px',
      minWidth: '340px',
      zIndex: 1000,
      textAlign: 'center'
    }}>
      <p style={{ fontWeight: 500, marginBottom: 24 }}>Seems like you have missed to enter your time for {date}. Were you on leave that day?</p>
      <div className="d-flex justify-content-center gap-3">
        <button className="btn btn-success" onClick={onYes}>Yes</button>
        <button className="btn btn-danger" onClick={onNo}>No</button>
      </div>
    </div>
  );
}

export default AlertPopup;