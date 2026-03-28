import React from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function StepPopup({ step, onClose }) {
  const { t } = useLanguage();
  const stepDetails = t("home.stepDetails");

  const defaultDetails = {
    "Guardian requests a tutor through chat.": {
      title: "Guardian Request Process",
      description:
        "Guardian submits tutor requirements via chat so admin can review and evaluate the request before creating job posting.",
      points: [
        "Guardian sends tuition need details.",
        "Admin reviews the request and verifies requirements.",
        "Admin creates a tuition post for tutors.",
      ],
    },
    "Admin verifies and creates a tuition post.": {
      title: "Admin Verification & Publishing",
      description:
        "Admin checks request accuracy, approves it, and publishes the tuition post so qualified tutors can apply.",
      points: [
        "Admin reviews guardian request content.",
        "Admin verifies payment/schedule feasibility.",
        "Admin posts verified tuition opportunity.",
      ],
    },
    "Tutors apply to the tuition opportunity.": {
      title: "Tutor Application Process",
      description:
        "Tutors browse verified job posts and submit applications with their profile and availability.",
      points: [
        "Tutor checks the posted tuition opportunity details.",
        "Tutor submits application with experience and expected fees.",
        "Admin reviews tutor applications and selects the best match.",
      ],
    },
    "Admin selects the best tutor.": {
      title: "Admin Tutor Selection",
      description:
        "Admin evaluates tutor applications and selects the best qualified tutor for the tuition post.",
      points: [
        "Admin checks tutor profiles, ratings, and availability.",
        "Admin selects the tutor that best fits the requirement.",
        "Selected tutor receives the assignment and guardian is notified.",
      ],
    },
  };

  const info = (stepDetails && stepDetails[step]) || defaultDetails[step] || {
    title: step || "Step details",
    description: "Information about this step is not available.",
    points: [],
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div>
            <h3>{info.title}</h3>
            <p>{info.description}</p>
          </div>
          <button className="auth-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div>
          {info.points.map((point, index) => (
            <p key={index}>{index + 1}. {point}</p>
          ))}
        </div>
        <button className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}

export default StepPopup;