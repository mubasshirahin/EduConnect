import React from "react";
import Footer from "../components/Footer";

function AboutUs() {
  const values = [
    {
      title: "Trusted Connections",
      description: "We help students and guardians discover tutors with clearer profiles, honest reviews, and a smoother hiring experience.",
    },
    {
      title: "Simple Hiring Flow",
      description: "From posting tuition needs to shortlisting applicants, EduConnect keeps the process organized and less stressful.",
    },
    {
      title: "Growth For Tutors",
      description: "Teachers get a dedicated space to showcase experience, manage opportunities, and build long-term trust with families.",
    },
  ];
  const team = [
    {
      name: "Team Member 1",
      role: "Platform Supervision",
      university: "University Name",
      intro: "Supports the overall flow and daily direction of the platform.",
    },
    {
      name: "Team Member 2",
      role: "Student Support",
      university: "University Name",
      intro: "Helps students with guidance, questions, and platform use.",
    },
    {
      name: "Team Member 3",
      role: "Tutor Coordination",
      university: "University Name",
      intro: "Works with tutors to keep communication and activity organized.",
    },
    {
      name: "Team Member 4",
      role: "Content & Communication",
      university: "University Name",
      intro: "Manages updates, messaging, and public-facing communication.",
    },
  ];

  return (
    <div className="about-page">
      <section className="about-hero section">
        <div className="container about-hero-grid">
          <div className="about-hero-copy">
            <span className="eyebrow">About EduConnect</span>
            <h1>Building a better way for students and tutors to find each other.</h1>
            <p className="about-intro">
              EduConnect is designed to make tuition hiring more transparent, more reliable, and much easier to navigate for everyone involved.
            </p>
            <div className="about-cta-row">
              <a className="btn btn-primary" href="#jobs">
                Explore Job Board
              </a>
              <a className="btn btn-ghost" href="#home">
                Back to Home
              </a>
            </div>
          </div>
          <div className="about-highlight-card">
            <p className="about-highlight-label">Our Mission</p>
            <h2>Connect the right learner with the right educator, faster and with more confidence.</h2>
            <p>
              We want families to feel informed and tutors to feel visible. Every part of the platform is shaped around clarity, trust, and momentum.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="about-section-heading">
            <h2 className="section-title">What We Focus On</h2>
            <p>
              The platform is built around a few practical goals that improve everyday tutoring workflows.
            </p>
          </div>
          <div className="about-values-grid">
            {values.map((value) => (
              <article className="about-value-card" key={value.title}>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-story-grid">
          <article className="about-story-card">
            <p className="about-story-label">Why It Matters</p>
            <h2>Too much time is usually lost between searching, verifying, and contacting.</h2>
            <p>
              EduConnect brings those steps into one place so users can compare opportunities, review profiles, and move forward without scattered conversations.
            </p>
          </article>
          <article className="about-story-card">
            <p className="about-story-label">Where We Are Going</p>
            <h2>We are shaping the platform into a dependable hub for modern tuition matching.</h2>
            <p>
              As the product grows, our direction stays the same: reduce friction, improve trust, and support stronger educational outcomes.
            </p>
          </article>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="about-section-heading">
            <h2 className="section-title">Meet Our Team</h2>
            <p>
              EduConnect is currently managed by a student team, with each member supporting a specific part of the platform.
            </p>
          </div>
          <div className="about-team-grid">
            {team.map((member) => (
              <article className="about-team-card" key={member.name}>
                <div className="about-team-avatar" aria-hidden="true">
                  {member.name.slice(-1)}
                </div>
                <h3>{member.name}</h3>
                <p className="about-team-role">{member.role}</p>
                <p className="about-team-university">{member.university}</p>
                <p className="about-team-intro">{member.intro}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutUs;
