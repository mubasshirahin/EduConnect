import React, { useState } from "react";

const initialState = {
  rating: 5,
  comment: "",
};

function ReviewSubmissionCard({ authorName, role, title, description }) {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const normalizedRole = role === "teacher" ? "Teacher" : "Student";

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
      setSubmitError("Please write a short review before submitting.");
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
        throw new Error(data?.message || "Failed to submit review.");
      }

      setFormData(initialState);
      setSubmitSuccess("Your review has been submitted.");
    } catch (error) {
      setSubmitError(error.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="dashboard-card review-submit-card">
      <div className="review-submit-copy">
        <p className="eyebrow">{normalizedRole} Feedback</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <form className="reviews-form" onSubmit={handleSubmit}>
        <label>
          <span>Rating</span>
          <select name="rating" value={formData.rating} onChange={handleChange}>
            <option value={5}>5 stars</option>
            <option value={4}>4 stars</option>
            <option value={3}>3 stars</option>
            <option value={2}>2 stars</option>
            <option value={1}>1 star</option>
          </select>
        </label>

        <label>
          <span>Your review</span>
          <textarea
            name="comment"
            rows="4"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Write a short review about your experience"
          />
        </label>

        {submitError ? <p className="form-message form-error">{submitError}</p> : null}
        {submitSuccess ? <p className="form-message form-success">{submitSuccess}</p> : null}

        <button className="btn btn-primary review-submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit review"}
        </button>
      </form>
    </section>
  );
}

export default ReviewSubmissionCard;
