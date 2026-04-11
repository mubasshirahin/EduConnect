import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function BlogPage({ authUser, onRequireLogin }) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
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
          tags: tags.split(",").map((tag) => tag.trim()),
        }),
      });

      if (response.ok) {
        setMessage(t("blog.messages.submitSuccess"));
        setTitle("");
        setContent("");
        setTags("");
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
      <div className="blog-page-topbar">
        <div className="blog-title-row">
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
      </div>

      {!authUser && <p className="blog-login-note">Read helpful study tips from the community, or tap the pencil icon to sign in and share your own blog.</p>}

      {showForm && authUser && (
        <div className="dashboard-card blog-form-card blog-form-shell">
          <h3>{t("blog.shareTips")}</h3>
          <form onSubmit={handleSubmit} className="blog-form">
            <div className="form-group">
              <label>{t("blog.labels.name")}</label>
              <input type="text" value={authorName} readOnly required />
            </div>
            <div className="form-group">
              <label>{t("blog.labels.role")}</label>
              <input type="text" value={role || "student"} readOnly />
            </div>
            <div className="form-group">
              <label>{t("blog.labels.title")}</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>{t("blog.labels.content")}</label>
              <textarea rows="6" value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>{t("blog.labels.tags")}</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t("blog.placeholders.tags")}
              />
            </div>
            {message && <p className="blog-form-message">{message}</p>}
            <button type="submit" className="btn btn-primary">
              {t("reviewsPage.submit")}
            </button>
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
                        className="btn blog-star-button"
                        style={{
                          minWidth: "32px",
                          height: "32px",
                          padding: "0",
                          background: filled ? "#FFD700" : "#eaeaea",
                          border: "1px solid #ccc",
                          color: filled ? "#333" : "#777",
                          borderRadius: "4px",
                          cursor: isAuthor ? "not-allowed" : "pointer",
                        }}
                        disabled={isAuthor}
                        onClick={() => !isAuthor && handleRate(blog._id, star)}
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
                        <button
                          className="btn blog-comment-submit"
                          onClick={() => handlePostComment(blog._id)}
                        >
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
