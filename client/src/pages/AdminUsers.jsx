import React, { useEffect, useState } from "react";

function AdminUsers({ roleFilter }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users?role=${roleFilter}`);
        const data = await response.json();
        setUsers(data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roleFilter]);

  const title = roleFilter === "admin" ? "Admins" : "Users";

  return (
    <section className="status-page">
      <div className="status-header">
        <h2>{title}</h2>
        <p>Registered {title.toLowerCase()} list.</p>
      </div>
      {loading ? (
        <div className="job-empty">
          <h3>Loading...</h3>
          <p>Please wait a moment.</p>
        </div>
      ) : users.length === 0 ? (
        <div className="job-empty">
          <h3>No {title.toLowerCase()} found</h3>
          <p>Users will appear here once registered.</p>
        </div>
      ) : (
        <div className="admin-users">
          {users.map((user) => (
            <button
              key={user._id}
              className="admin-user-card admin-user-link"
              type="button"
              onClick={() => (window.location.hash = `#admin-user/${encodeURIComponent(user.email)}`)}
            >
              <h4>{user.name || "User"}</h4>
              <p>{user.email}</p>
              <span className="admin-user-role">{user.role}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminUsers;
