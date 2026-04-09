import React from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-links">
          <a href="#home">{t("navbar.home")}</a>
          <a href="#about">{t("navbar.about")}</a>
          <a href="#terms">{t("footer.terms")}</a>
          <a href="#help">{t("navbar.help")}</a>
        </div>
        <p>&copy; 2026 EduConnect. {t("footer.rights")}</p>
      </div>
    </footer>
  );
}

export default Footer;
