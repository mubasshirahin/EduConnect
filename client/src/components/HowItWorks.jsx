import React, { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import StepPopup from "./StepPopup";

function HowItWorks() {
  const { t } = useLanguage();
  const steps = t("home.steps");
  const [showPopup, setShowPopup] = useState(false);

  const handleStepClick = (step) => {
    if (step === "Guardian requests a tutor through chat.") {
      setShowPopup(true);
    }
  };

  return (
    <>
      <section className="section section-muted">
        <div className="container flow-content">
          <h2 className="section-title">{t("home.howItWorksTitle")}</h2>
          <ol className="steps-list">
            {steps.map((step, index) => (
              <li 
                key={index} 
                onClick={() => handleStepClick(step)}
                style={{ 
                  cursor: step === "Guardian requests a tutor through chat." ? "pointer" : "default"
                }}
              >
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>
      
      {showPopup && (
        <StepPopup onClose={() => setShowPopup(false)} />
      )}
    </>
  );
}

export default HowItWorks;