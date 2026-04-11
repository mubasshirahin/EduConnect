import React, { useEffect, useState } from "react";
import ReviewSubmissionCard from "../components/ReviewSubmissionCard";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function Reviews({ showSubmission = false, submissionProps, showTotalCounter = false }) {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await fetch("/api/reviews");
        if (!response.ok) {
          throw new Error(t("reviewsPage.submitError"));
        }

        const data = await response.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        setLoadError(error.message || t("reviewsPage.submitError"));
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, []);
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews).toFixed(1)
    : "0.0";

  return (
    <div className={`job-board reviews-page ${showSubmission ? "reviews-page-with-submission" : ""}`}>
      {showSubmission ? (
        <ReviewSubmissionCard
          authorName={submissionProps?.authorName}
          role={submissionProps?.role}
          title={submissionProps?.title}
          description={submissionProps?.description}
        />
      ) : null}

      {showTotalCounter ? (
        <div className="reviews-total-banner" aria-live="polite">
          <span>{t("reviewsPage.totalReviewsLabel")}</span>
          <strong>{totalReviews}</strong>
        </div>
      ) : null}

      <header className="job-board-header reviews-hero">
        <div className="reviews-hero-copy">
          <h1>{t("reviewsPage.communityTitle")}</h1>
          <p className="job-board-subtitle">
            {t("reviewsPage.communitySubtitle")}
          </p>
        </div>

        <div className="reviews-summary-card">
          <strong>{averageRating}</strong>
          <span>{t("reviewsPage.averageRating")}</span>
          <p>{t("reviewsPage.basedOn").replace("{count}", totalReviews).replace("{suffix}", totalReviews === 1 ? "" : "s")}</p>
        </div>
      </header>

      <section className="reviews-layout">
        <div className="reviews-content">
          {isLoading ? (
            <div className="job-empty">
              <h3>{t("reviewsPage.loadingTitle")}</h3>
              <p>{t("reviewsPage.loadingBody")}</p>
            </div>
          ) : loadError ? (
            <div className="job-empty">
              <h3>{loadError}</h3>
              <p>{t("jobBoard.errorBody")}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="job-empty">
              <h3>{t("reviewsPage.noFeedbackTitle")}</h3>
              <p>{t("reviewsPage.noFeedbackBody")}</p>
            </div>
          ) : (
            <div className="reviews-grid">
              {reviews.map((review) => (
                <article key={review._id} className="review-card">
                  <div className="review-card-top">
                    <div>
                      <h3>{review.name}</h3>
                      <span className="review-role">{review.role || t("reviewsPage.communityMember")}</span>
                      <p>{new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="review-rating" aria-label={t("reviewsPage.outOfStars").replace("{rating}", review.rating)}>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="review-comment">"{review.comment}"</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Reviews;
