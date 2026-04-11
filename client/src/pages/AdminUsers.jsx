import React, { useEffect, useState } from "react";

function AdminUsers({ roleFilter }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [usersResponse, jobsResponse] = await Promise.all([
          fetch(`/api/admin/users?role=${roleFilter}`),
          roleFilter === "teacher" ? fetch("/api/jobs") : Promise.resolve(null),
        ]);

        const data = await usersResponse.json();
        const jobs = jobsResponse ? await jobsResponse.json() : [];

        const enrichedUsers = Array.isArray(data)
          ? data.map((user) => {
              const storageKey = user?.email ? `educonnect-profile:${user.email}` : "";
              const lowerEmail = user?.email?.toLowerCase?.() || "";
              const teacherJobs = Array.isArray(jobs)
                ? jobs.filter((job) =>
                    Array.isArray(job.applicants) &&
                    job.applicants.some((applicant) => applicant.email === lowerEmail)
                  )
                : [];
              const appliedCount = teacherJobs.length;
              const shortlistedCount = teacherJobs.filter((job) =>
                job.applicants?.some(
                  (applicant) =>
                    applicant.email === lowerEmail &&
                    ["shortlisted", "profile_shared"].includes(applicant.status)
                )
              ).length;
              const appointedCount = teacherJobs.filter((job) =>
                job.applicants?.some(
                  (applicant) => applicant.email === lowerEmail && applicant.status === "appointed"
                )
              ).length;
              const confirmedCount = teacherJobs.filter((job) =>
                job.applicants?.some(
                  (applicant) =>
                    applicant.email === lowerEmail &&
                    ["confirmed", "hired"].includes(applicant.status)
                )
              ).length;

              if (!storageKey) return user;
              const storedProfile = localStorage.getItem(storageKey);
              if (!storedProfile) {
                return { ...user, appliedCount, shortlistedCount, appointedCount, confirmedCount };
              }
              try {
                return {
                  ...user,
                  ...JSON.parse(storedProfile),
                  appliedCount,
                  shortlistedCount,
                  appointedCount,
                  confirmedCount,
                };
              } catch {
                return { ...user, appliedCount, shortlistedCount, appointedCount, confirmedCount };
              }
            })
          : [];
        const sortedUsers = roleFilter === "teacher"
          ? [...enrichedUsers].sort((a, b) => {
              const confirmedDiff = (b.confirmedCount || 0) - (a.confirmedCount || 0);
              if (confirmedDiff !== 0) return confirmedDiff;
              const appliedDiff = (b.appliedCount || 0) - (a.appliedCount || 0);
              if (appliedDiff !== 0) return appliedDiff;
              return (a.name || "").localeCompare(b.name || "");
            })
          : enrichedUsers;
        setUsers(sortedUsers);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roleFilter]);

  const title = roleFilter === "admin" ? "Admins" : roleFilter === "teacher" ? "Teachers" : "Users";
  const useListView = roleFilter !== "admin";
  const isTeacherView = roleFilter === "teacher";

  const renderTeacherField = (label, value) => (
    <div className="admin-user-detail">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );

  return (
    <section className="status-page">
      <div className="status-header">
        <h2>{title}</h2>
        <p>{isTeacherView ? "All registered teachers with saved profile details." : `Registered ${title.toLowerCase()} list.`}</p>
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
        <div className={useListView ? "admin-users admin-users-list" : "admin-users"}>
          {users.map((user) => (
            <button
              key={user._id}
              className={`admin-user-card admin-user-link ${isTeacherView ? "admin-user-card-detailed" : ""}`}
              type="button"
              onClick={() => (window.location.hash = `#admin-user/${encodeURIComponent(user.email)}`)}
            >
              <h4>{user.name || "User"}</h4>
              <p>{user.email}</p>
              <span className="admin-user-role">{user.role}</span>
              {user.isBlocked ? <span className="status-pill status-pill-danger">Blocked</span> : null}
              {isTeacherView ? (
                <div className="admin-user-details-grid">
                  {renderTeacherField("Applied Tuitions", user.appliedCount ?? 0)}
                  {renderTeacherField("Shortlisted", user.shortlistedCount ?? 0)}
                  {renderTeacherField("Appointed", user.appointedCount ?? 0)}
                  {renderTeacherField("Confirmed Tuitions", user.confirmedCount ?? 0)}
                  {renderTeacherField("Tutor ID", user.tutorId)}
                  {renderTeacherField("Phone", user.phone)}
                  {renderTeacherField("City", user.city)}
                  {renderTeacherField("Location", user.location)}
                  {renderTeacherField("Preferred Classes", user.preferredClasses)}
                  {renderTeacherField("Preferred Subjects", user.preferredSubjects)}
                  {renderTeacherField("Expected Salary", user.expectedSalary)}
                  {renderTeacherField("Experience", user.totalExperience)}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminUsers;
