import React from "react";

function StepPopup({ onClose }) {
  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <div>
            <h3>Guardian Requests a Tutor</h3>
            <p>Here's how it works</p>
          </div>
          <button className="auth-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div>
          <p>1. Click "Request a Tutor" button</p>
          <p>2. Fill in your details</p>
          <p>3. Admin reviews your request</p>
          <p>4. Tuition post is created</p>
        </div>
        <button className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}

export default StepPopup;