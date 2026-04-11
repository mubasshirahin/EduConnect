import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function BlogPage({ authUser, onRequireLogin, onLogout }) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [lovedComments, setLovedComments] = useState({});

  useEffect(() => {
    if (authUser) {
      setAuthorName(authUser.name || "");
      setRole(authUser.role || "student");
    } else {
      setAuthorName("");
      setRole("student");
      setShowForm(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [authUser]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const handleHashChange = () => setIsMobileMenuOpen(false);
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [isMobileMenuOpen]);

  const blogNavLinks = authUser?.role === "teacher"
    ? [
        { href: "#home", label: t("dashboard.home") },
        { href: "#jobs", label: t("dashboard.jobs") },
        { href: "#status", label: t("dashboard.status") },
        { href: "#blog", label: t("navbar.blog") },
        { href: "#reviews", label: t("dashboard.reviews") },
        { href: "#messages", label: t("dashboard.messages") },
        { href: "#help", label: t("navbar.help") },
        { href: "#settings", label: t("dashboard.settings") },
      ]
    : authUser?.role === "student"
      ? [
          { href: "#home", label: t("dashboard.home") },
          { href: "#jobs", label: t("dashboard.jobs") },
          { href: "#status", label: t("dashboard.status") },
          { href: "#blog", label: t("navbar.blog") },
          { href: "#reviews", label: t("dashboard.reviews") },
          { href: "#messages", label: t("dashboard.messages") },
          { href: "#help", label: t("navbar.help") },
          { href: "#settings", label: t("dashboard.settings") },
        ]
      : authUser?.role === "admin"
        ? [
            { href: "#home", label: t("dashboard.home") },
            { href: "#jobs", label: t("dashboard.jobs") },
            { href: "#blog", label: t("navbar.blog") },
            { href: "#messages", label: t("dashboard.messages") },
            { href: "#notices", label: "Notices" },
            { href: "#help", label: t("navbar.help") },
            { href: "#settings", label: t("dashboard.settings") },
          ]
        : [
            { href: "#home", label: t("navbar.home") },
            { href: "#about", label: t("navbar.about") },
            { href: "#jobs", label: t("navbar.jobs") },
            { href: "#reviews", label: t("navbar.reviews") },
            { href: "#blog", label: t("navbar.blog") },
            { href: "#help", label: t("navbar.help") },
          ];

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs");
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const total = ratings.reduce((sum, r) => sum + (r.rating || 0), 0);
    return total / ratings.length;
  };

  const getUserRating = (ratings) => {
    if (!authUser || !ratings) return null;
    const userRating = ratings.find((r) => r.email?.toLowerCase() === authUser.email?.toLowerCase());
    return userRating?.rating ?? null;
  };

  const toggleComments = (blogId) => {
    setOpenComments((prev) => ({ ...prev, [blogId]: !prev[blogId] }));
  };

  const handleCommentInputChange = (blogId, value) => {
    setCommentInputs((prev) => ({ ...prev, [blogId]: value }));
  };

  const handlePostComment = async (blogId) => {
    if (!authUser) {
      onRequireLogin?.();
      return;
    }

    const nextContent = (commentInputs[blogId] || "").trim();
    if (!nextContent) {
      setMessage(t("blog.messages.emptyComment"));
      return;
    }

    const token = localStorage.getItem("educonnect-auth-token");

    try {
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: nextContent }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setMessage(data?.message || "Could not post comment.");
        return;
      }

      setCommentInputs((prev) => ({ ...prev, [blogId]: "" }));
      setMessage(t("blog.messages.commentPosted"));
      await fetchBlogs();
    } catch (error) {
      setMessage("Error posting comment.");
    }
  };

  const handleLoveComment = (commentId) => {
    setLovedComments((prev) => {
      const current = prev[commentId] || { active: false, count: 0 };
      return {
        ...prev,
        [commentId]: {
          active: !current.active,
          count: current.active ? Math.max(0, current.count - 1) : current.count + 1,
        },
      };
    });
  };

  const handleRate = async (blogId, value) => {
    if (!authUser) {
      onRequireLogin?.();
      return;
    }

    const token = localStorage.getItem("educonnect-auth-token");
    if (!token) {
      setMessage(t("blog.messages.invalidSession"));
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: value }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setMessage(data?.message || "Could not set rating.");
        return;
      }

      await fetchBlogs();
      setMessage(t("blog.messages.ratingSaved"));
    } catch (error) {
      setMessage("Error submitting rating.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!authUser) {
      setMessage(t("blog.loginRequired"));
      return;
    }

    if (!title.trim() || !content.trim()) {
      return;
    }

    const token = localStorage.getItem("educonnect-auth-token");
    if (!token) {
      setMessage(t("blog.messages.invalidSession"));
      return;
    }

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (response.ok) {
        setMessage(t("blog.messages.submitSuccess"));
        setTitle("");
        setContent("");
        setShowForm(false);
        fetchBlogs();
      } else {
        const data = await response.json().catch(() => null);
        setMessage(data?.message || t("blog.messages.submitError"));
      }
    } catch (error) {
      setMessage("Error submitting blog.");
    }
  };

  const handleComposeClick = () => {
    if (!authUser) {
      onRequireLogin?.();
      return;
    }

    setShowForm((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
        {t("common.pleaseWait") || "Loading..."}
      </div>
    );
  }

  return (
    <div className="container blog-page-shell" style={{ padding: "2rem 0 4rem" }}>
      {isMobileMenuOpen ? (
        <button
          type="button"
          className="blog-mobile-menu-backdrop"
          aria-label="Close blog navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <div className="blog-page-topbar">
        <div className="blog-title-row">
          <button
            type="button"
            className={`blog-menu-button ${isMobileMenuOpen ? "blog-menu-button-open" : ""}`}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="blog-mobile-menu"
            aria-label={isMobileMenuOpen ? "Close blog navigation menu" : "Open blog navigation menu"}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
          <h1 className="blog-page-title">{t("blog.title")}</h1>
          <button
            className="blog-compose-button"
            type="button"
            onClick={handleComposeClick}
            aria-label={showForm ? t("blog.cancel") : authUser ? t("blog.writePost") : t("blog.loginToWrite")}
            title={showForm ? t("blog.cancel") : authUser ? t("blog.writePost") : t("blog.loginToWrite")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
            </svg>
          </button>
        </div>

        <div
          id="blog-mobile-menu"
          className={`blog-mobile-menu ${isMobileMenuOpen ? "blog-mobile-menu-open" : ""}`}
        >
          <div className="blog-mobile-menu-links">
            {blogNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="blog-mobile-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {authUser ? (
              <button
                type="button"
                className="blog-mobile-menu-link blog-mobile-menu-logout"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout?.();
                }}
              >
                {t("common.logout")}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {!authUser && (
        <p className="blog-login-note">
          Read helpful study tips from the community, or tap the pencil icon to sign in and share your own blog.
        </p>
      )}

      {showForm && authUser && (
        <div className="dashboard-card blog-form-card blog-form-shell">
          <div className="blog-form-header">
            <h3>{t("blog.shareTips")}</h3>
            <p>Share a practical idea, lesson, or study habit that can help other learners.</p>
          </div>
          <form onSubmit={handleSubmit} className="blog-form">
            <div className="form-group blog-form-group">
              <label>{t("blog.labels.name")}</label>
              <input type="text" value={authorName} readOnly required />
            </div>
            <div className="blog-form-grid">
              <div className="form-group blog-form-group">
                <label>{t("blog.labels.role")}</label>
                <input
                  type="text"
                  value={(role || "student").charAt(0).toUpperCase() + (role || "student").slice(1)}
                  readOnly
                />
              </div>
              <div className="form-group blog-form-group">
                <label>{t("blog.labels.title")}</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
            </div>
            <div className="form-group blog-form-group">
              <label>{t("blog.labels.content")}</label>
              <textarea rows="6" value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
            <div className="blog-form-footer">
              {message ? <p className="blog-form-message">{message}</p> : null}
              <button type="submit" className="btn btn-primary blog-submit-button">
                {t("reviewsPage.submit")}
              </button>
            </div>
          </form>
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="dashboard-card blog-empty-state">
          <p>{t("blog.empty")}</p>
        </div>
      ) : (
        <div className="blog-post-list">
          {blogs.map((blog) => (
            <div key={blog._id} className="dashboard-card blog-post-card">
              <div className="blog-post-header">
                <h2 className="blog-post-title">{blog.title}</h2>
                <span
                  className={`blog-role-badge ${
                    blog.authorRole === "teacher" ? "blog-role-badge-teacher" : "blog-role-badge-student"
                  }`}
                >
                  {blog.authorRole === "teacher" ? t("auth.teacher") : t("auth.student")}
                </span>
              </div>

              <p className="blog-meta">
                By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}
                {blog.tags?.length > 0 && ` • Tags: ${blog.tags.join(", ")}`}
              </p>

              <p className="blog-content">{blog.content}</p>

              <div className="blog-rating-section">
                <p className="blog-rating-text">
                  {t("blog.averageRating")}: {getAverageRating(blog.ratings).toFixed(1)} / 5 ({blog.ratings?.length || 0}{" "}
                  {t("blog.votes")})
                </p>
                <p className="blog-rating-text blog-rating-user">
                  {t("blog.yourRating")}: {getUserRating(blog.ratings) || t("blog.notRated")}
                </p>
                <div className="blog-stars-row">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => {
                    const isAuthor = authUser?.email?.toLowerCase() === blog.authorEmail?.toLowerCase();
                    const currentRating = getUserRating(blog.ratings);
                    const filled = star <= (currentRating || Math.round(getAverageRating(blog.ratings)));

                    return (
                      <button
                        key={`${blog._id}-star-${star}`}
                        type="button"
                        className={`blog-star-button ${filled ? "blog-star-button-filled" : ""}`}
                        disabled={isAuthor}
                        onClick={() => !isAuthor && handleRate(blog._id, star)}
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

                {authUser?.email?.toLowerCase() === blog.authorEmail?.toLowerCase() && (
                  <p className="blog-rating-warning">{t("blog.messages.ownPostRating")}</p>
                )}
              </div>

              <div className="blog-comments-section">
                <button className="btn blog-comment-toggle" onClick={() => toggleComments(blog._id)}>
                  {openComments[blog._id]
                    ? t("blog.comments.hide")
                    : `${t("blog.comments.show")} (${blog.comments?.length || 0})`}
                </button>

                {openComments[blog._id] && (
                  <div className="blog-comments-panel">
                    {blog.comments?.length === 0 ? (
                      <p className="blog-empty-comments">{t("blog.comments.none")}</p>
                    ) : (
                      <div className="blog-comments-list">
                        {blog.comments.map((comment) => (
                          <div key={comment._id} className="blog-comment-card">
                            <div className="blog-comment-top">
                              <p className="blog-comment-meta">
                                {comment.authorName || "Anonymous"} <span>• {new Date(comment.createdAt).toLocaleString()}</span>
                              </p>
                              <button
                                type="button"
                                className={`blog-love-button ${lovedComments[comment._id]?.active ? "blog-love-button-active" : ""}`}
                                onClick={() => handleLoveComment(comment._id)}
                                aria-label="Love this comment"
                              >
                                <span aria-hidden="true">♥</span>
                                <span>{lovedComments[comment._id]?.count || 0}</span>
                              </button>
                            </div>
                            <p className="blog-comment-body">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {authUser ? (
                      <div className="blog-comment-form">
                        <textarea
                          rows="3"
                          value={commentInputs[blog._id] || ""}
                          onChange={(e) => handleCommentInputChange(blog._id, e.target.value)}
                          placeholder={t("blog.placeholders.comment")}
                          className="blog-comment-textarea"
                        />
                        <button className="btn blog-comment-submit" onClick={() => handlePostComment(blog._id)}>
                          {t("blog.comments.post")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogPage;
