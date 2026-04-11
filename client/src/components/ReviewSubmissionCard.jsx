import React, { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const initialState = {
  rating: 5,
  comment: "",
};

function ReviewSubmissionCard({ authorName, role, title, description, sectionId }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const normalizedRole = role === "teacher" ? t("auth.teacher") : t("auth.student");
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const payload = {
      name: (authorName || "").trim() || normalizedRole,
      role: normalizedRole,
      rating: formData.rating,
      comment: formData.comment.trim(),
    };

    if (!payload.comment) {
      setSubmitError(t("reviewsPage.emptyError"));
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || t("reviewsPage.submitError"));
      }

      setFormData(initialState);
      setSubmitSuccess(t("reviewsPage.submitSuccess"));
    } catch (error) {
      setSubmitError(error.message || t("reviewsPage.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="dashboard-card review-submit-card" id={sectionId}>
      <div className="review-submit-copy">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <form className="reviews-form" onSubmit={handleSubmit}>
        <label>
          <span>{t("reviewsPage.ratingLabel")}</span>
          <select name="rating" value={formData.rating} onChange={handleChange}>
            <option value={5}>5</option>
            <option value={4}>4</option>
            <option value={3}>3</option>
            <option value={2}>2</option>
            <option value={1}>1</option>
          </select>
        </label>

        <label>
          <span>{t("reviewsPage.reviewLabel")}</span>
          <textarea
            name="comment"
            rows="4"
            value={formData.comment}
            onChange={handleChange}
            placeholder={t("reviewsPage.reviewPlaceholder")}
          />
        </label>

        {submitError ? <p className="form-message form-error">{submitError}</p> : null}
        {submitSuccess ? <p className="form-message form-success">{submitSuccess}</p> : null}

        <button className="btn btn-primary review-submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("reviewsPage.submitting") : t("reviewsPage.submit")}
        </button>
      </form>
    </section>
  );
}

export default ReviewSubmissionCard;
