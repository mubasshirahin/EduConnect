import React, { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import StepPopup from "./StepPopup";

function HowItWorks() {
  const { t } = useLanguage();
  const steps = t("home.steps");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);

  const handleStepClick = (step) => {
    const actionableSteps = [
      "Guardian requests a tutor through chat.",
      "Admin verifies and creates a tuition post.",
    ];

    if (actionableSteps.includes(step)) {
      setSelectedStep(step);
      setShowPopup(true);
    }
  };

  return (
    <>
      <section className="section section-muted">
        <div className="container flow-content">
          <h2 className="section-title">{t("home.howItWorksTitle")}</h2>
          <ol className="steps-list">
            {steps.map((step, index) => {
              const clickable = [
                "Guardian requests a tutor through chat.",
                "Admin verifies and creates a tuition post.",
              ].includes(step);

              return (
                <li
                  key={index}
                  onClick={() => handleStepClick(step)}
                  style={{ cursor: clickable ? "pointer" : "default" }}
                >
                  {step}
                </li>
              );
            })}
          </ol>
        </div>
      </section>
      
      {showPopup && (
        <StepPopup
          step={selectedStep}
          onClose={() => {
            setShowPopup(false);
            setSelectedStep(null);
          }}
        />
      )}
    </>
  );
}

export default HowItWorks;