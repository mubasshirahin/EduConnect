import React from "react";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function TermsOfService() {
  const { t } = useLanguage();
  const highlights = t("terms.highlights");
  const sections = t("terms.sections");
  const getCleanTitle = (title) => title.replace(/^\d+\.\s*/, "").replace(/^[০-৯]+\.\s*/, "");

  return (
    <div className="terms-page">
      <section className="terms-hero section">
        <div className="container terms-hero-grid">
          <div className="terms-hero-copy">
            <div className="terms-hero-topline">
              <span className="eyebrow">{t("terms.eyebrow")}</span>
            </div>
            <h1>
              {t("terms.title")}
              <span className="terms-heading-accent" aria-hidden="true" />
            </h1>
            <p className="terms-intro">{t("terms.intro")}</p>
            <div className="terms-micro-points" aria-label="Key platform values">
              {highlights.map((item) => (
                <div className="terms-micro-point" key={item.title}>
                  <span className="terms-micro-dot" aria-hidden="true" />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
            <div className="terms-cta-row">
              <a className="btn btn-primary" href="#home">
                {t("terms.backHome")}
              </a>
              <a className="btn btn-ghost" href="#about">
                {t("terms.learnMore")}
              </a>
            </div>
          </div>

          <aside className="terms-summary-card">
            <p className="terms-summary-label">{t("terms.summaryLabel")}</p>
            <h2>{t("terms.summaryTitle")}</h2>
            <p>{t("terms.summaryBody")}</p>
            <div className="terms-trust-list">
              {highlights.map((item, index) => (
                <div className="terms-trust-item" key={item.title}>
                  <span className="terms-trust-number">0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="terms-section-heading">
            <h2 className="section-title">{t("terms.sectionsTitle")}</h2>
            <p>{t("terms.subtitle")}</p>
          </div>
          <div className="terms-grid">
            {sections.map((section, index) => (
              <article className="terms-card" key={section.title}>
                <div className="terms-card-number">0{index + 1}</div>
                <h3>{getCleanTitle(section.title)}</h3>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="terms-note-card">
            <p className="terms-note-label">{t("terms.noteLabel")}</p>
            <h2>{t("terms.noteTitle")}</h2>
            <p>{t("terms.noteBody")}</p>
            <div className="terms-note-actions">
              <a className="btn btn-primary" href="#home">
                {t("terms.understand")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default TermsOfService;
