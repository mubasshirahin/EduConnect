import React, { useEffect, useState } from "react";

function Reviews({ authUser }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/reviews");
        if (!response.ok) throw new Error("Failed to load reviews.");
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        setLoadError(error.message || "Failed to load reviews.");
      } finally {
        setIsLoading(false);
      }
    };
    loadReviews();
  }, []);

  return (
    <div className="job-board">
      <header className="job-board-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '40px' }}>
        <div>
          <p className="eyebrow">Voices of EduConnect</p>
          <h1 style={{ letterSpacing: '-1px' }}>Community Feedback</h1>
          <p className="job-board-subtitle">
            Experience shared by our community members.
          </p>
        </div>
      </header>

      <div style={{ padding: '40px 0' }}>
        {isLoading ? (
          <div className="job-empty"><h3>Loading reviews...</h3></div>
        ) : loadError ? (
          <div className="job-empty"><h3>{loadError}</h3><p>Check server connection.</p></div>
        ) : reviews.length === 0 ? (
          <div className="job-empty"><h3>No feedback yet.</h3></div>
        ) : (
          /* রেসপনসিভ গ্রিড কন্টেইনার */
          <div style={{ 
            display: 'grid', 
            // অটো-ফিট ব্যবহার করা হয়েছে যাতে স্ক্রিন অনুযায়ী ৩, ২ বা ১টি কলাম হয়
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {reviews.map((rev) => (
              <article key={rev._id} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.3s ease'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ flexGrow: 1 }}>
                      <h3 style={{ color: '#64ffda', margin: 0, fontSize: '1.15rem', lineHeight: '1.2' }}>{rev.name}</h3>
                      <span style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {rev.role || "Guardian"}
                      </span>
                    </div>
                    <div style={{ color: '#ffb400', fontSize: '0.8rem', marginLeft: '10px' }}>
                      {"★".repeat(rev.rating)}
                    </div>
                  </div>

                  <p style={{ 
                    fontSize: '0.95rem', 
                    lineHeight: '1.6', 
                    opacity: 0.85, 
                    margin: 0,
                    fontStyle: 'italic'
                  }}>
                    "{rev.comment}"
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;