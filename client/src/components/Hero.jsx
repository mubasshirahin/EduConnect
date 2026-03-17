import React from "react";

function Hero({ onRequestTutor }) {
  return (
    <section className="hero section">
      <div className="container hero-content">
        <p className="eyebrow">Trusted Tuition Platform</p>
        <h1>Find the Perfect Tutor for Your Child</h1>
        <p className="hero-subtitle">
          EduConnect connects guardians with qualified tutors through a secure,
          moderated, and transparent matching process.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-large"
          onClick={onRequestTutor}
        >
          Request a Tutor
        </button>
      </div>
    </section>
  );
}

export default Hero;
