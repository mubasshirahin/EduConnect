import React from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function UpdateSoon({ title }) {
  const { t } = useLanguage();

  return (
    <section className="update-soon">
      <div className="update-soon-card">
        <h2>{title}</h2>
        <p>{t("common.updateSoon")}</p>
      </div>
    </section>
  );
}

export default UpdateSoon;
