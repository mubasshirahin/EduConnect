import React, { useState, useEffect } from "react";

function BlogPage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [message, setMessage] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

    const user = JSON.parse(localStorage.getItem("educonnect-auth-user") || "{}");
    const authorName = user.name || "Anonymous";
    const authorEmail = user.email || "guest@example.com";

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          content: content,
          author: authorName,
          authorEmail: authorEmail,
          tags: tags.split(",").map(tag => tag.trim())
        })
      });

      if (response.ok) {
        setMessage("Blog submitted successfully!");
        setTitle("");
        setContent("");
        setTags("");
        setShowForm(false);
        fetchBlogs();
      } else {
        setMessage("Failed to submit. Please try again.");
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Study Tips & Blog</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Write a Post"}
        </button>
      </div>

      {showForm && (
        <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
          <h3>Share Your Study Tips</h3>
          <form onSubmit={handleSubmit}>
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
                style={{ width: "100%", borderRadius: "8px", padding: "0.5rem" }}
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
            <div key={blog._id} className="dashboard-card">
              <h2 style={{ marginBottom: "0.5rem" }}>{blog.title}</h2>
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
//ratri