import React, { useState, useEffect } from "react";
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

  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});

  const toggleComments = (blogId) => {
    setOpenComments((prev) => ({ ...prev, [blogId]: !prev[blogId] }));
  };

  const handleCommentInputChange = (blogId, value) => {
    setCommentInputs((prev) => ({ ...prev, [blogId]: value }));
  };

  const handleReplyInputChange = (commentId, value) => {
    setReplyInputs((prev) => ({ ...prev, [commentId]: value }));
  };

  const handlePostComment = async (blogId) => {
    const content = (commentInputs[blogId] || "").trim();
    if (!content) {
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
        body: JSON.stringify({ content }),
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

  const handlePostReply = async (blogId, commentId) => {
    const content = (replyInputs[commentId] || "").trim();
    if (!content) {
      setMessage(t("blog.messages.emptyReply"));
      return;
    }

    const token = localStorage.getItem("educonnect-auth-token");

    try {
      const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setMessage(data?.message || "Could not post reply.");
        return;
      }

      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
      setMessage(t("blog.messages.replyPosted"));
      await fetchBlogs();
    } catch (error) {
      setMessage("Error posting reply.");
    }
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

  if (loading) {
    return <div className="container" style={{ padding: "2rem", textAlign: "center" }}>{t("common.pleaseWait") || "Loading..."}</div>;
  }

  return (
    <div className="container" style={{ padding: "2rem 0 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
        <button
          className="btn"
          style={{ backgroundColor: "var(--primary)", color: "#fff", borderColor: "var(--primary)", padding: "0.7rem 1rem" }}
          onClick={() => {
            window.location.hash = "#home";
          }}
        >
          ← {t("blog.backDashboard")}
        </button>
        <h1 style={{ margin: "0 auto" }}>{t("blog.title")}</h1>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2rem" }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (!authUser) {
              onRequireLogin?.();
              return;
            }
            setShowForm((prev) => !prev);
          }}
        >
          {showForm ? t("blog.cancel") : authUser ? t("blog.writePost") : t("blog.loginToWrite")}
        </button>
      </div>
      {!authUser && (
        <p style={{ color: "var(--text-soft)", marginBottom: "1rem" }}>
          {t("blog.loginRequired")}
        </p>
      )}

      {showForm && authUser && (
        <div className="dashboard-card blog-form-card" style={{ marginBottom: "2rem" }}>
          <h3>{t("blog.shareTips")}</h3>
          <form onSubmit={handleSubmit} className="blog-form">
            <div className="form-group">
              <label>{t("blog.labels.name")}</label>
              <input
                type="text"
                value={authorName}
                readOnly
                required
              />
            </div>
            <div className="form-group">
              <label>{t("blog.labels.role")}</label>
              <input type="text" value={role || "student"} readOnly />
            </div>
            <div className="form-group">
              <label>{t("blog.labels.title")}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>{t("blog.labels.content")}</label>
              <textarea
                rows="6"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
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
            {message && <p style={{ color: "var(--accent)" }}>{message}</p>}
            <button type="submit" className="btn btn-primary">
              {t("reviewsPage.submit")}
            </button>
          </form>
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center" }}>
          <p>{t("blog.empty")}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {blogs.map(blog => (
            <div key={blog._id} className="dashboard-card blog-post-card">
              <div className="blog-post-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h2 style={{ marginBottom: "0" }}>{blog.title}</h2>
                <span style={{
                  background: blog.authorRole === "teacher" ? "#3fa971" : "#5bcf90",
                  color: "#fff",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "20px",
                  fontSize: "0.7rem",
                  fontWeight: "bold"
                }}>
                  {blog.authorRole === "teacher" ? t("auth.teacher") : t("auth.student")}
                </span>
              </div>
              <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}
                {blog.tags?.length > 0 && ` • Tags: ${blog.tags.join(", ")}`}
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>{blog.content}</p>

              <div style={{ marginTop: "1rem" }}>
                <p style={{ margin: "0 0 .4rem 0", fontSize: "0.88rem", color: "var(--text-soft)" }}>
                  {t("blog.averageRating")}: {getAverageRating(blog.ratings).toFixed(1)} / 5 ({blog.ratings?.length || 0} {t("blog.votes")})
                </p>
                <p style={{ margin: "0 0 .8rem 0", fontSize: "0.88rem", color: "var(--text-soft)" }}>
                  {t("blog.yourRating")}: {getUserRating(blog.ratings) || t("blog.notRated")}
                </p>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => {
                    const isAuthor = authUser?.email?.toLowerCase() === blog.authorEmail?.toLowerCase();
                    const currentRating = getUserRating(blog.ratings);
                    const filled = star <= (currentRating || Math.round(getAverageRating(blog.ratings)));
                    return (
                      <button
                        key={`${blog._id}-star-${star}`}
                        className="btn"
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
                  <p style={{ fontSize: "0.8rem", color: "#ff6347", marginTop: "0.5rem" }}>
                    {t("blog.messages.ownPostRating")}
                  </p>
                )}
              </div>

              <div style={{ marginTop: "1rem", borderTop: "1px solid #eaeaea", paddingTop: "1rem" }}>
                <button
                  className="btn"
                  style={{ marginBottom: "0.75rem", backgroundColor: "var(--primary)", color: "#fff", borderColor: "var(--primary)" }}
                  onClick={() => toggleComments(blog._id)}
                >
                  {openComments[blog._id] ? t("blog.comments.hide") : `${t("blog.comments.show")} (${blog.comments?.length || 0})`}
                </button>

                {openComments[blog._id] && (
                  <div style={{ marginTop: "0.5rem", backgroundColor: "#f0faf2", borderRadius: "10px", padding: "0.8rem" }}>
                    {blog.comments?.length === 0 ? (
                      <p style={{ color: "var(--text-soft)" }}>{t("blog.comments.none")}</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {blog.comments.map((comment) => (
                          <div key={comment._id} style={{ backgroundColor: "#e8f7ec", padding: "0.75rem", borderRadius: "8px", border: "1px solid #d3edd9" }}>
                            <p style={{ margin: "0 0 0.25rem 0", fontWeight: "bold" }}>
                              {comment.authorName || "Anonymous"} <span style={{ color: "var(--text-soft)", fontWeight: "normal" }}>• {new Date(comment.createdAt).toLocaleString()}</span>
                            </p>
                            <p style={{ margin: "0 0 0.5rem 0" }}>{comment.content}</p>

                            <div style={{ paddingLeft: "0.75rem", borderLeft: "2px solid #ececec" }}>
                              {comment.replies?.map((reply) => (
                                <div key={reply._id} style={{ marginBottom: "0.5rem" }}>
                                  <p style={{ margin: "0", fontWeight: "bold", fontSize: "0.9rem" }}>
                                    {reply.authorName || "Anonymous"} <span style={{ color: "var(--text-soft)", fontWeight: "normal", fontSize: "0.8rem" }}>• {new Date(reply.createdAt).toLocaleString()}</span>
                                  </p>
                                  <p style={{ margin: "0.15rem 0 0 0", fontSize: "0.9rem" }}>{reply.content}</p>
                                </div>
                              ))}

                              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.3rem", backgroundColor: "#e6f8e7", border: "1px solid #bce8c5", borderRadius: "8px", padding: "0.5rem" }}>
                                <textarea
                                  rows="2"
                                  value={replyInputs[comment._id] || ""}
                                  onChange={(e) => handleReplyInputChange(comment._id, e.target.value)}
                                  placeholder={t("blog.placeholders.reply")}
                                  style={{ flex: 1, resize: "vertical", backgroundColor: "#dff6dc", border: "1px solid #8fd089", borderRadius: "6px", padding: "0.4rem" }}
                                />
                                <button className="btn" style={{ backgroundColor: "var(--primary)", color: "#fff", borderColor: "var(--primary)" }} onClick={() => handlePostReply(blog._id, comment._id)}>
                                  {t("blog.comments.reply")}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: "0.75rem", backgroundColor: "#e6f8e7", border: "1px solid #bce8c5", borderRadius: "8px", padding: "0.75rem" }}>
                      <textarea
                        rows="3"
                        value={commentInputs[blog._id] || ""}
                        onChange={(e) => handleCommentInputChange(blog._id, e.target.value)}
                        placeholder={t("blog.placeholders.comment")}
                        style={{ width: "100%", resize: "vertical", backgroundColor: "#dff6dc", border: "1px solid #8fd089", borderRadius: "6px", padding: "0.4rem" }}
                      />
                      <button
                        className="btn"
                        style={{ marginTop: "0.4rem", backgroundColor: "var(--primary)", color: "#fff", borderColor: "var(--primary)" }}
                        onClick={() => handlePostComment(blog._id)}
                      >
                        {t("blog.comments.post")}
                      </button>
                    </div>
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