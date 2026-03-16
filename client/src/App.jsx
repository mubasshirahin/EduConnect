import { useEffect, useState } from "react";
import Home from "./pages/Home";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import JobBoard from "./pages/JobBoard";
import ProfilePage from "./pages/ProfilePage";
import UpdateSoon from "./pages/UpdateSoon";
import TeacherStatus from "./pages/TeacherStatus";
import StudentStatus from "./pages/StudentStatus";
import ApplicantProfile from "./pages/ApplicantProfile";
import MessagesPage from "./pages/MessagesPage";
import AdminUsers from "./pages/AdminUsers";
import AdminUserProfile from "./pages/AdminUserProfile";
import AuthModal from "./components/AuthModal";
import Navbar from "./components/Navbar";
import TeacherShell from "./components/TeacherShell";
import StudentShell from "./components/StudentShell";
import AdminShell from "./components/AdminShell";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [route, setRoute] = useState(window.location.hash || "#home");
  const [authMode, setAuthMode] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("educonnect-theme") || "dark";
  });

  const handleAuthSuccess = (user) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    setAuthUser(null);
    window.location.hash = "#home";
  };

  const openLogin = () => setAuthMode("login");
  const openRegister = () => setAuthMode("register");
  const closeAuth = () => setAuthMode(null);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || "#home");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("educonnect-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  let content = <Home />;

  if (route.startsWith("#jobs")) {
    content = <JobBoard authUser={authUser} onRequireLogin={openLogin} />;
  } else if (route.startsWith("#profile")) {
    content = <ProfilePage authUser={authUser} />;
  } else if (route.startsWith("#applicant/")) {
    const email = decodeURIComponent(route.replace("#applicant/", ""));
    content = <ApplicantProfile email={email} authUser={authUser} />;
  } else if (route.startsWith("#messages") || route.startsWith("#settings")) {
    const titleMap = {
      "#messages": "Messages",
      "#settings": "Settings",
    };
    content = <UpdateSoon title={route.startsWith("#messages") ? titleMap["#messages"] : titleMap["#settings"]} />;
  } else if (authUser?.role === "teacher") {
    content = (
      <TeacherShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <TeacherDashboard authUser={authUser} />
      </TeacherShell>
    );
  } else if (authUser?.role === "student") {
    content = (
      <StudentShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <StudentDashboard user={authUser} />
      </StudentShell>
    );
  } else if (authUser?.role === "admin") {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <AdminDashboard />
      </AdminShell>
    );
  }

  if (authUser?.role === "teacher" && route.startsWith("#jobs")) {
    content = (
      <TeacherShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <JobBoard authUser={authUser} onRequireLogin={openLogin} />
      </TeacherShell>
    );
  }

  if (authUser?.role === "student" && route.startsWith("#jobs")) {
    content = (
      <StudentShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <JobBoard authUser={authUser} onRequireLogin={openLogin} />
      </StudentShell>
    );
  }

  if (authUser?.role === "admin" && route.startsWith("#jobs")) {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <JobBoard authUser={authUser} onRequireLogin={openLogin} />
      </AdminShell>
    );
  }

  if (authUser?.role === "teacher" && route.startsWith("#profile")) {
    content = (
      <TeacherShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <ProfilePage authUser={authUser} />
      </TeacherShell>
    );
  }

  if (authUser?.role === "student" && route.startsWith("#profile")) {
    content = (
      <StudentShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <ProfilePage authUser={authUser} />
      </StudentShell>
    );
  }

  if (authUser?.role === "admin" && route.startsWith("#profile")) {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <ProfilePage authUser={authUser} />
      </AdminShell>
    );
  }

  if (authUser?.role === "teacher" && route.startsWith("#status")) {
    content = (
      <TeacherShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <TeacherStatus authUser={authUser} />
      </TeacherShell>
    );
  }

  if (authUser?.role === "teacher" && (route.startsWith("#messages") || route.startsWith("#settings"))) {
    content = (
      <TeacherShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        {route.startsWith("#messages") ? (
          <MessagesPage authUser={authUser} route={route} />
        ) : (
          <UpdateSoon title="Settings" />
        )}
      </TeacherShell>
    );
  }

  if (authUser?.role === "student" && (route.startsWith("#status") || route.startsWith("#messages") || route.startsWith("#settings"))) {
    content = (
      <StudentShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        {route.startsWith("#status") ? <StudentStatus authUser={authUser} /> : null}
        {route.startsWith("#messages") ? <MessagesPage authUser={authUser} route={route} /> : null}
        {route.startsWith("#settings") ? <UpdateSoon title="Settings" /> : null}
      </StudentShell>
    );
  }

  if (authUser?.role === "admin" && route.startsWith("#status")) {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <UpdateSoon title="Status" />
      </AdminShell>
    );
  }

  if (authUser?.role === "admin" && route.startsWith("#messages")) {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <MessagesPage authUser={authUser} route={route} />
      </AdminShell>
    );
  }

  if (authUser?.role === "admin" && route.startsWith("#settings")) {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <UpdateSoon title="Settings" />
      </AdminShell>
    );
  }

  if (authUser?.role === "admin" && route === "#admin-users") {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <AdminUsers roleFilter="user" />
      </AdminShell>
    );
  }

  if (authUser?.role === "admin" && route === "#admin-admins") {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <AdminUsers roleFilter="admin" />
      </AdminShell>
    );
  }

  if (authUser?.role === "admin" && route.startsWith("#admin-user/")) {
    const email = decodeURIComponent(route.replace("#admin-user/", ""));
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <AdminUserProfile email={email} />
      </AdminShell>
    );
  }

  if (authUser?.role === "student" && route.startsWith("#applicant/")) {
    const email = decodeURIComponent(route.replace("#applicant/", ""));
    content = (
      <StudentShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <ApplicantProfile email={email} authUser={authUser} />
      </StudentShell>
    );
  }

  return (
    <>
      <Navbar
        authUser={authUser}
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      {content}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={closeAuth}
          onAuthSuccess={(user) => {
            handleAuthSuccess(user);
            closeAuth();
          }}
        />
      )}
    </>
  );
}

export default App;
