import React from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function Hero({ onRequestTutor }) {
  const { t } = useLanguage();

  return (
    <section className="hero section">
      <div className="container hero-content">
        <p className="eyebrow">{t("home.eyebrow")}</p>
        <h1>{t("home.title")}</h1>
        <p className="hero-subtitle">{t("home.subtitle")}</p>
        <button type="button" className="btn btn-primary btn-large" onClick={onRequestTutor}>
          {t("home.cta")}
        </button>
      </div>
    </section>
  );
}

export default Hero;
