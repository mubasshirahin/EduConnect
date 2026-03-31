import React, { useState, useEffect } from "react";

function BlogPage({ authUser, onRequireLogin }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!authUser) {
      setMessage("You must log in to submit a blog post.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setMessage("Title and content are required.");
      return;
    }

    const token = localStorage.getItem("educonnect-auth-token");
    if (!token) {
      setMessage("Invalid session. Please log in again.");
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
        setMessage("Blog submitted successfully!");
        setTitle("");
        setContent("");
        setTags("");
        setShowForm(false);
        fetchBlogs();
      } else {
        const data = await response.json().catch(() => null);
        setMessage(data?.message || "Failed to submit. Please try again.");
      }
    } catch (error) {
      setMessage("Error submitting blog.");
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
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
          ← Back to Dashboard
        </button>
        <h1 style={{ margin: "0 auto" }}>Study Tips & Blog</h1>
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
          {showForm ? "Cancel" : authUser ? "Write a Post" : "Login to Write"}
        </button>
      </div>
      {!authUser && (
        <p style={{ color: "var(--text-soft)", marginBottom: "1rem" }}>
          You must be logged in to write a blog post. Click the button to login/register.
        </p>
      )}

      {showForm && authUser && (
        <div className="dashboard-card blog-form-card" style={{ marginBottom: "2rem" }}>
          <h3>Share Your Study Tips</h3>
          <form onSubmit={handleSubmit} className="blog-form">
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={authorName}
                readOnly
                required
              />
            </div>
            <div className="form-group">
              <label>I am a</label>
              <input type="text" value={role || "student"} readOnly />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                rows="6"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="exam tips, study hacks, math"
              />
            </div>
            {message && <p style={{ color: "var(--accent)" }}>{message}</p>}
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center" }}>
          <p>No blog posts yet. Be the first to share study tips!</p>
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
                  {blog.authorRole === "teacher" ? "Teacher" : "Student"}
                </span>
              </div>
              <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}
                {blog.tags?.length > 0 && ` • Tags: ${blog.tags.join(", ")}`}
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>{blog.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogPage;