import React from "react";

function HowItWorks() {
  return (
    <section className="section section-muted">
      <div className="container flow-content">
        <h2 className="section-title">How It Works</h2>
        <ol className="steps-list">
          <li>Guardian requests a tutor through chat.</li>
          <li>Admin verifies and creates a tuition post.</li>
          <li>Tutors apply to the tuition opportunity.</li>
          <li>Admin selects the best tutor.</li>
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
