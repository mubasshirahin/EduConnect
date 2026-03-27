import React from 'react';

function TermsModal({ onClose }) {
    return (
        <div className="auth-overlay" role="dialog" aria-modal="true">
            <div className="auth-modal" style={{ maxWidth: '600px' }}>
                <div className="auth-modal-header">
                    <div>
                        <h3>Terms & Conditions</h3>
                        <p>Please read before agreeing</p>
                    </div>
                    <button className="auth-close" type="button" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem 0' }}>
                    <div style={{ display: 'grid', gap: '1rem', color: 'var(--text-soft)' }}>
                        <div>
                            <h4>1. Acceptance of Terms</h4>
                            <p>By registering for EduConnect, you agree to these Terms & Conditions.</p>
                        </div>
                        <div>
                            <h4>2. User Roles</h4>
                            <p>EduConnect connects Teachers and Students. Teachers can post job opportunities. Students can apply for positions.</p>
                        </div>
                        <div>
                            <h4>3. Account Responsibility</h4>
                            <p>You are responsible for maintaining the security of your account.</p>
                        </div>
                        <div>
                            <h4>4. Code of Conduct</h4>
                            <p>Users must communicate respectfully. Harassment or spam is prohibited.</p>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button className="btn btn-primary" onClick={onClose}>
                        I Understand
                    </button>
                </div>
            </div>
            <button className="auth-backdrop" type="button" onClick={onClose} />
        </div>
    );
}

export default TermsModal;