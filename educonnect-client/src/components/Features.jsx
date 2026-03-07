import React from "react";

function Features() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Why Choose EduConnect?</h2>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Verified Tutors</h3>
            <p>All tutors are reviewed before being recommended.</p>
          </article>
          <article className="feature-card">
            <h3>Admin Moderation</h3>
            <p>Guardians chat with admin to ensure correct tutor matching.</p>
          </article>
          <article className="feature-card">
            <h3>Easy Application</h3>
            <p>Tutors can easily browse and apply for tuition posts.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Features;
