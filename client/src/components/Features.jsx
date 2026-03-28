import React from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function Features() {
  const { t } = useLanguage();
  const features = t("home.features");

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">{t("home.featuresTitle")}</h2>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
