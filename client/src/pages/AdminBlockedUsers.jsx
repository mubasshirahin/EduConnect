import React, { useEffect, useState } from "react";

function AdminBlockedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState({ email: "", loading: false, error: "" });

  const load = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users?blocked=true");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUnblock = async (email) => {
    setActionState({ email, loading: true, error: "" });
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: false }),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionState({ email, loading: false, error: data?.message || "Unable to unblock user." });
        return;
      }
      setUsers((prev) => prev.filter((user) => user.email !== email));
      setActionState({ email: "", loading: false, error: "" });
    } catch {
      setActionState({ email, loading: false, error: "Unable to unblock user." });
    }
  };

  return (
    <section className="status-page">
      <div className="status-header">
        <h2>Blocked Users</h2>
        <p>Accounts blocked from using the platform.</p>
      </div>
      {actionState.error ? <p className="auth-status auth-status-error">{actionState.error}</p> : null}
      {loading ? (
        <div className="job-empty">
          <h3>Loading...</h3>
          <p>Please wait a moment.</p>
        </div>
      ) : users.length === 0 ? (
        <div className="job-empty">
          <h3>No blocked users</h3>
          <p>Blocked accounts will appear here.</p>
        </div>
      ) : (
        <div className="admin-users">
          {users.map((user) => (
            <div key={user._id || user.email} className="admin-user-card">
              <div>
                <h4>{user.name || "User"}</h4>
                <p>{user.email}</p>
                <span className="admin-user-role">{user.role}</span>
              </div>
              <div className="admin-user-actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => (window.location.hash = `#admin-user/${encodeURIComponent(user.email)}`)}
                >
                  View
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => handleUnblock(user.email)}
                  disabled={actionState.loading && actionState.email === user.email}
                >
                  {actionState.loading && actionState.email === user.email ? "Unblocking..." : "Unblock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminBlockedUsers;
