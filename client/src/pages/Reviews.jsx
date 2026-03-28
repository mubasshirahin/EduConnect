import React, { useEffect, useState } from "react";

function Reviews() {
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
          throw new Error("Failed to load reviews.");
        }

        const data = await response.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        setLoadError(error.message || "Failed to load reviews.");
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
    <div className="job-board reviews-page">
      <header className="job-board-header reviews-hero">
        <div className="reviews-hero-copy">
          <p className="eyebrow">Voices of EduConnect</p>
          <h1>Community Reviews</h1>
          <p className="job-board-subtitle">
            Honest feedback from students and guardians who used EduConnect to find the right tutor.
          </p>
        </div>

        <div className="reviews-summary-card">
          <strong>{averageRating}</strong>
          <span>Average rating</span>
          <p>Based on {totalReviews} community review{totalReviews === 1 ? "" : "s"}.</p>
        </div>
      </header>

      <section className="reviews-layout">
        <div className="reviews-content">
          {isLoading ? (
            <div className="job-empty">
              <h3>Loading reviews...</h3>
              <p>Please wait while we pull the latest feedback.</p>
            </div>
          ) : loadError ? (
            <div className="job-empty">
              <h3>{loadError}</h3>
              <p>Check the server connection and try again.</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="job-empty">
              <h3>No feedback yet.</h3>
              <p>Be the first one to share your experience with EduConnect.</p>
            </div>
          ) : (
            <div className="reviews-grid">
              {reviews.map((review) => (
                <article key={review._id} className="review-card">
                  <div className="review-card-top">
                    <div>
                      <h3>{review.name}</h3>
                      <span className="review-role">{review.role || "Community Member"}</span>
                      <p>{new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="review-rating" aria-label={`${review.rating} out of 5 stars`}>
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
