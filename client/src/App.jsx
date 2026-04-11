import { useEffect, useState } from "react";
import Home from "./pages/Home";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import JobBoard from "./pages/JobBoard";
import HelpCenter from "./pages/HelpCenter";
import Reviews from "./pages/Reviews";
import ProfilePage from "./pages/ProfilePage";
import UpdateSoon from "./pages/UpdateSoon";
import TeacherStatus from "./pages/TeacherStatus";
import StudentStatus from "./pages/StudentStatus";
import TeacherSettings from "./pages/TeacherSettings";
import StudentSettings from "./pages/StudentSettings";
import ApplicantProfile from "./pages/ApplicantProfile";
import MessagesPage from "./pages/MessagesPage";
import AdminUsers from "./pages/AdminUsers";
import AdminUserProfile from "./pages/AdminUserProfile";
import AdminBlockedUsers from "./pages/AdminBlockedUsers";
import ComplaintsPage from "./pages/ComplaintsPage";
import AdminComplaints from "./pages/AdminComplaints";
import AuthModal from "./components/AuthModal";
import Navbar from "./components/Navbar";
import TeacherShell from "./components/TeacherShell";
import StudentShell from "./components/StudentShell";
import AdminShell from "./components/AdminShell";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNotices from "./pages/AdminNotices";
import AdminSettings from "./pages/AdminSettings";
import TermsOfService from "./pages/TermsOfService";
import AboutUs from "./pages/AboutUs";
import BlogPage from "./pages/BlogPage";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import "./App.css";

function App() {
  const { language, t } = useLanguage();
  const generateTutorId = () =>
    Math.floor(100000 + Math.random() * 900000).toString();
  const [authUser, setAuthUser] = useState(() => {
    const stored = localStorage.getItem("educonnect-auth-user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const [route, setRoute] = useState(window.location.hash || "#home");
  const [authMode, setAuthMode] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("educonnect-theme") || "dark";
  });

  const handleAuthSuccess = (user, token) => {
    if (!user) return;
    const needsTutorId = user.role === "teacher" && !user.tutorId;
    const nextUser = needsTutorId ? { ...user, tutorId: generateTutorId() } : user;
    setAuthUser(nextUser);
    localStorage.setItem("educonnect-auth-user", JSON.stringify(nextUser));
    if (token) {
      localStorage.setItem("educonnect-auth-token", token);
    }

    // After login, redirect to home so role-based dashboards render for signed-in users.
    window.location.hash = "#home";
    setRoute("#home");
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem("educonnect-auth-user");
    localStorage.removeItem("educonnect-auth-token");
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

  useEffect(() => {
    document.documentElement.setAttribute("data-language", language);
  }, [language]);

  useEffect(() => {
    if (!authUser) return;
    if (authUser.role !== "teacher" || authUser.tutorId) return;
    const nextUser = { ...authUser, tutorId: generateTutorId() };
    setAuthUser(nextUser);
    localStorage.setItem("educonnect-auth-user", JSON.stringify(nextUser));
  }, [authUser]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  let content = <Home onRequestTutor={openLogin} />;

  if (route === "#terms") {
    content = <TermsOfService />;
  } else if (route === "#about") {
    content = <AboutUs />;
  } else if (route === "#help") {
    content = <HelpCenter />;
  } else if (route === "#blog") {
    content = <BlogPage authUser={authUser} onRequireLogin={openLogin} />;
  } else if (route.startsWith("#jobs")) {
    content = <JobBoard authUser={authUser} onRequireLogin={openLogin} />;
  } else if (route.startsWith("#reviews") && !authUser) {
    content = <Reviews />;
  } else if (route.startsWith("#profile")) {
    content = <ProfilePage authUser={authUser} />;
  } else if (route.startsWith("#applicant/")) {
    const email = decodeURIComponent(route.replace("#applicant/", ""));
    content = <ApplicantProfile email={email} authUser={authUser} />;
  } else if (route.startsWith("#messages") || route.startsWith("#settings")) {
    const titleMap = {
      "#messages": t("navbar.messages"),
      "#settings": t("navbar.settings"),
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
        {route === "#reviews" ? <Reviews /> : <AdminDashboard />}
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

  if (authUser?.role === "teacher" && route.startsWith("#reviews")) {
    content = (
      <TeacherShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <Reviews
          showSubmission
          submissionProps={{
            authorName: authUser?.name,
            role: "teacher",
            title: t("reviewsPage.teacherTitle"),
            description: t("reviewsPage.teacherDescription"),
          }}
        />
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

  if (authUser?.role === "student" && route.startsWith("#reviews")) {
    content = (
      <StudentShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <Reviews
          showSubmission
          showTotalCounter
          submissionProps={{
            authorName: authUser?.name,
            role: "student",
            title: t("reviewsPage.studentTitle"),
            description: t("reviewsPage.studentDescription"),
          }}
        />
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
          <TeacherSettings authUser={authUser} onLogout={handleLogout} />
        )}
      </TeacherShell>
    );
  }

  if (authUser?.role === "teacher" && route.startsWith("#complains")) {
    content = (
      <TeacherShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <ComplaintsPage authUser={authUser} />
      </TeacherShell>
    );
  }

  if (authUser?.role === "student" && (route.startsWith("#status") || route.startsWith("#messages") || route.startsWith("#settings"))) {
    content = (
      <StudentShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        {route.startsWith("#status") ? <StudentStatus authUser={authUser} /> : null}
        {route.startsWith("#messages") ? (
          <MessagesPage authUser={authUser} route={route} />
        ) : null}
        {route.startsWith("#settings") ? <StudentSettings authUser={authUser} onLogout={handleLogout} /> : null}
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

  if (authUser?.role === "student" && route.startsWith("#complains")) {
    content = (
      <StudentShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <ComplaintsPage authUser={authUser} />
      </StudentShell>
    );
  }

  if (authUser?.role === "admin" && route.startsWith("#settings")) {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <AdminSettings authUser={authUser} onLogout={handleLogout} />
      </AdminShell>
    );
  }

  if (authUser?.role === "admin" && route.startsWith("#reports")) {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <UpdateSoon title="Reports" />
      </AdminShell>
    );
  }

  if (authUser?.role === "admin" && route.startsWith("#notices")) {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <AdminNotices />
      </AdminShell>
    );
  }

  if (authUser?.role === "admin" && route.startsWith("#complains")) {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <AdminComplaints />
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

  if (authUser?.role === "admin" && route === "#admin-teachers") {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <AdminUsers roleFilter="teacher" />
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

  if (authUser?.role === "admin" && route === "#admin-blocked") {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <AdminBlockedUsers />
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

  if (authUser?.role === "teacher" && route === "#help") {
    content = (
      <TeacherShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <HelpCenter />
      </TeacherShell>
    );
  }

  if (authUser?.role === "student" && route === "#help") {
    content = (
      <StudentShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <HelpCenter />
      </StudentShell>
    );
  }

  if (authUser?.role === "admin" && route === "#help") {
    content = (
      <AdminShell user={authUser} onLogout={handleLogout} currentRoute={route}>
        <HelpCenter />
      </AdminShell>
    );
  }

  return (
    <>
      <Navbar authUser={authUser} onLoginClick={openLogin} onRegisterClick={openRegister} theme={theme} onToggleTheme={toggleTheme} currentRoute={route} />
      {content}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={closeAuth}
          onAuthSuccess={(user, token) => {
            handleAuthSuccess(user, token);
            closeAuth();
          }}
          onSwitchMode={(nextMode) => setAuthMode(nextMode)}
        />
      )}
    </>
  );
}

export default App;
