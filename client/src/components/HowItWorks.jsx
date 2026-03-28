import React from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function HowItWorks() {
  const { t } = useLanguage();
  const steps = t("home.steps");

  return (
    <section className="section section-muted">
      <div className="container flow-content">
        <h2 className="section-title">{t("home.howItWorksTitle")}</h2>
        <ol className="steps-list">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
