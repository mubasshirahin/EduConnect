import React from "react";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function AboutUs() {
  const { t } = useLanguage();
  const values = t("about.values");
  const team = t("about.team");
  const storyCards = t("about.storyCards");

  return (
    <div className="about-page">
      <section className="about-hero section">
        <div className="container about-hero-grid">
          <div className="about-hero-copy">
            <span className="eyebrow">{t("about.eyebrow")}</span>
            <h1>{t("about.title")}</h1>
            <p className="about-intro">{t("about.intro")}</p>
            <div className="about-cta-row">
              <a className="btn btn-primary" href="#jobs">
                {t("about.exploreJobs")}
              </a>
              <a className="btn btn-ghost" href="#home">
                {t("about.backHome")}
              </a>
            </div>
          </div>
          <div className="about-highlight-card">
            <p className="about-highlight-label">{t("about.missionLabel")}</p>
            <h2>{t("about.missionTitle")}</h2>
            <p>{t("about.missionBody")}</p>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="about-section-heading">
            <h2 className="section-title">{t("about.focusTitle")}</h2>
            <p>{t("about.focusSubtitle")}</p>
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
          {storyCards.map((card) => (
            <article className="about-story-card" key={card.label}>
              <p className="about-story-label">{card.label}</p>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="about-section-heading">
            <h2 className="section-title">{t("about.teamTitle")}</h2>
            <p>{t("about.teamSubtitle")}</p>
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
