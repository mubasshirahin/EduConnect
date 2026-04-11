import React, { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { markThreadSeen } from "../utils/messageNotifications.js";

const EMPTY_REQUEST = {
  subject: "",
  classLevel: "",
  medium: "",
  location: "",
  landmark: "",
  schedule: "",
  budget: "",
  details: "",
};

const REQUIRED_PROFILE_FIELDS = [
  "name",
  "email",
  "phone",
  "address",
  "bscCurriculum",
  "preferredClasses",
  "hscInstitute",
  "city",
  "emergencyName",
  "emergencyNumber",
  "idCardImage",
];

function MessagesPage({ authUser, route }) {
  const { language, t } = useLanguage();
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [pendingRecipient, setPendingRecipient] = useState(null);
  const [supportContact, setSupportContact] = useState(null);
  const [adminContacts, setAdminContacts] = useState([]);
  const [requestForm, setRequestForm] = useState(EMPTY_REQUEST);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProfileReady, setIsProfileReady] = useState(false);

  const CLASS_OPTIONS = [
    "Play", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Admission Test",
  ];

  const SUBJECT_OPTIONS = [
    "Bangla", "English", "Mathematics", "General Science", "Physics", "Chemistry",
    "Biology", "Higher Math", "ICT", "Accounting", "Finance", "Economics", "BGS", "Religion",
  ];

  const MEDIUM_OPTIONS = [
    "Bangla Medium", "English Medium", "English Version", "Madrasa",
  ];

  const REQUEST_FIELD_LABELS = {
    subject: t("messages.labels.subject"),
    classLevel: t("messages.labels.class"),
    medium: t("messages.labels.medium"),
    location: t("messages.labels.location"),
    landmark: t("messages.labels.landmark"),
    schedule: t("messages.labels.schedule"),
    budget: t("messages.labels.budget"),
    details: t("messages.labels.details"),
  };

  const REQUEST_FIELD_PREFIXES = {
    [t("messages.prefixes.subject")]: "subject",
    [t("messages.prefixes.class")]: "classLevel",
    [t("messages.prefixes.medium")]: "medium",
    [t("messages.prefixes.location")]: "location",
    [t("messages.prefixes.landmark")]: "landmark",
    [t("messages.prefixes.schedule")]: "schedule",
    [t("messages.prefixes.budget")]: "budget",
    [t("messages.prefixes.details")]: "details",
  };

  function parseTutorRequest(text) {
    const trimmed = text?.trim();
    if (!trimmed || !trimmed.toLowerCase().includes("tutor request")) {
      return null;
    }

    const lines = trimmed.split("\n").map((line) => line.trim()).filter(Boolean);
    const fields = {};

    lines.slice(1).forEach((line) => {
      const entry = Object.entries(REQUEST_FIELD_PREFIXES).find(([prefix]) => line.startsWith(prefix));
      if (!entry) return;
      const [prefix, key] = entry;
      fields[key] = line.slice(prefix.length).trim();
    });

    return {
      title: lines[0],
      fields,
    };
  }

  const isStudent = authUser?.role === "student";

  useEffect(() => {
    if (!authUser?.email) {
      setIsProfileReady(false);
      return;
    }

    const profileStorageKey = `educonnect-profile:${authUser.email}`;
    const syncProfileStatus = () => {
      const stored = localStorage.getItem(profileStorageKey);
      if (!stored) {
        setIsProfileReady(false);
        return;
      }

      try {
        const profile = JSON.parse(stored);
        const missing = REQUIRED_PROFILE_FIELDS.filter((field) => {
          const value = profile?.[field];
          return value === undefined || value === null || String(value).trim().length === 0;
        });
        setIsProfileReady(missing.length === 0);
      } catch {
        setIsProfileReady(false);
      }
    };

    syncProfileStatus();
    window.addEventListener("storage", syncProfileStatus);
    return () => window.removeEventListener("storage", syncProfileStatus);
  }, [authUser?.email]);

  useEffect(() => {
    const loadThreads = async () => {
      if (!authUser?.email) {
        setThreads([]);
        setActiveId(null);
        setPendingRecipient(null);
        setSupportContact(null);
        setAdminContacts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const messagesRequest = fetch(`/api/messages?user=${encodeURIComponent(authUser.email)}`);
        const adminsRequest = isStudent ? fetch("/api/admin/users?role=admin") : null;

        const [threadsResponse, adminsResponse] = await Promise.all([
          messagesRequest,
          adminsRequest,
        ]);

        if (!threadsResponse.ok) {
          throw new Error(t("messages.errorLoading") || "Unable to load messages.");
        }

        const nextThreads = await threadsResponse.json();
        const nextAdmins =
          isStudent && adminsResponse?.ok
            ? await adminsResponse.json()
            : [];
        const nextSupport =
          isStudent
            ? nextAdmins[0] || null
            : null;

        setThreads(Array.isArray(nextThreads) ? nextThreads : []);
        setSupportContact(nextSupport);
        setAdminContacts(Array.isArray(nextAdmins) ? nextAdmins : []);

        const supportEmail = nextSupport?.email?.toLowerCase() || null;
        const supportThread = supportEmail
          ? nextThreads.find((thread) => thread.participants?.includes(supportEmail))
          : null;

        if (route?.includes("?to=")) {
          const params = new URLSearchParams(route.split("?")[1]);
          const toEmail = params.get("to")?.toLowerCase();
          const matchedThread = nextThreads.find((thread) => thread.participants?.includes(toEmail));
          if (matchedThread) {
            setActiveId(matchedThread._id);
            setPendingRecipient(null);
          } else if (toEmail) {
            setPendingRecipient(toEmail);
            setActiveId(`new:${toEmail}`);
          } else if (supportThread) {
            setActiveId(supportThread._id);
            setPendingRecipient(null);
          } else if (supportEmail) {
            setPendingRecipient(supportEmail);
            setActiveId(`new:${supportEmail}`);
          } else {
            setActiveId(nextThreads[0]?._id || null);
            setPendingRecipient(null);
          }
        } else if (isStudent) {
          if (supportThread) {
            setActiveId(supportThread._id);
            setPendingRecipient(null);
          } else if (supportEmail) {
            setPendingRecipient(supportEmail);
            setActiveId(`new:${supportEmail}`);
          } else {
            setActiveId(nextThreads[0]?._id || null);
            setPendingRecipient(null);
          }
        } else {
          setActiveId(nextThreads[0]?._id || null);
          setPendingRecipient(null);
        }
      } catch (loadError) {
        setThreads([]);
        setActiveId(null);
        setPendingRecipient(null);
        setSupportContact(null);
        setAdminContacts([]);
        setError(loadError.message || "Unable to load messages.");
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
  }, [authUser, isStudent, route, t]);

  const activeThread = threads.find((thread) => thread._id === activeId) || null;
  const latestTutorRequest = activeThread
    ? [...(activeThread.messages || [])]
        .reverse()
        .map((message) => ({
          message,
          request: parseTutorRequest(message.text),
        }))
        .find((entry) => entry.request)
    : null;

  const getOtherParticipantEmail = (thread) =>
    thread?.participants?.find((email) => email !== authUser?.email) || thread?.email || "";

  const getDisplayName = (thread) => {
    const otherEmail = getOtherParticipantEmail(thread);
    const map = thread.participantNames || {};
    const mappedName = map[otherEmail];

    if (!mappedName) {
      return otherEmail;
    }

    return mappedName.toLowerCase() === otherEmail.toLowerCase() ? otherEmail : mappedName;
  };

  const getRecipientName = () => {
    if (isStudent) {
      return t("messages.adminSupport");
    }
    if (activeThread) {
      return getDisplayName(activeThread);
    }
    if (pendingRecipient && supportContact?.email?.toLowerCase() === pendingRecipient) {
      return supportContact.name || t("messages.adminSupport");
    }
    return pendingRecipient;
  };

  const getLatestTutorRequest = (thread) =>
    [...(thread?.messages || [])]
      .reverse()
      .map((message) => ({
        message,
        request: parseTutorRequest(message.text),
      }))
      .find((entry) => entry.request) || null;

  useEffect(() => {
    const latestMessage = activeThread?.messages?.[activeThread.messages.length - 1];
    if (!authUser?.email || !activeThread?._id || !latestMessage?.createdAt) {
      return;
    }

    markThreadSeen(authUser.email, activeThread._id, latestMessage.createdAt);
  }, [activeThread, authUser?.email]);

  const sendMessage = async (text) => {
    const bodyText = text.trim();
    if (!bodyText || !authUser?.email || (!activeThread && !pendingRecipient)) {
      return;
    }

    const toEmail =
      pendingRecipient ||
      activeThread?.participants?.find((email) => email !== authUser.email) ||
      "";

    if (!toEmail) return;

    const toName =
      activeThread?.participantNames?.[toEmail] ||
      (supportContact?.email?.toLowerCase() === toEmail ? supportContact.name : undefined);
    const adminEmails = adminContacts
      .map((admin) => admin?.email?.toLowerCase())
      .filter(Boolean);
    const shouldBroadcastToAdmins = isStudent && adminEmails.includes(toEmail.toLowerCase());
    const recipients = shouldBroadcastToAdmins ? adminEmails : [toEmail.toLowerCase()];

    try {
      const responses = await Promise.all(
        recipients.map(async (recipientEmail) => {
          const matchedAdmin = adminContacts.find(
            (admin) => admin?.email?.toLowerCase() === recipientEmail
          );
          const response = await fetch("/api/messages/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              from: authUser.email,
              to: recipientEmail,
              text: bodyText,
              fromName: authUser.name,
              toName: matchedAdmin?.name || toName || recipientEmail,
            }),
          });

          if (!response.ok) {
            throw new Error(t("messages.errorSend") || "Unable to send message.");
          }

          return response.json();
        })
      );

      const updatedThread =
        responses.find((thread) => thread?.participants?.includes(toEmail.toLowerCase())) ||
        responses[0];

      setThreads((prev) => {
        const threadMap = new Map(prev.map((thread) => [thread._id, thread]));
        responses.forEach((thread) => {
          threadMap.set(thread._id, thread);
        });
        return [...threadMap.values()].sort(
          (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        );
      });
      setActiveId(updatedThread?._id || null);
      setPendingRecipient(null);
      setDraft("");
      setError("");
    } catch (sendError) {
      setError(sendError.message || "Unable to send message.");
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    await sendMessage(draft);
  };

  const handleRequestChange = (event) => {
    const { name, value } = event.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitTutorRequest = async (event) => {
    event.preventDefault();
    if (!isProfileReady) {
      setError(t("messages.requestForm.error"));
      return;
    }
    const message = [
      t("messages.tuitionRequest"),
      `${t("messages.prefixes.subject")} ${requestForm.subject.trim()}`,
      `${t("messages.prefixes.class")} ${requestForm.classLevel.trim()}`,
      `${t("messages.prefixes.medium")} ${requestForm.medium.trim()}`,
      `${t("messages.prefixes.location")} ${requestForm.location.trim()}`,
      `${t("messages.prefixes.landmark")} ${requestForm.landmark.trim() || t("profile.notProvided")}`,
      `${t("messages.prefixes.schedule")} ${requestForm.schedule.trim()}`,
      `${t("messages.prefixes.budget")} ${requestForm.budget.trim()}`,
      `${t("messages.prefixes.details")} ${requestForm.details.trim()}`,
    ].join("\n");

    await sendMessage(message);
    setRequestForm(EMPTY_REQUEST);
  };

  const renderStudentRequestPanel = isStudent && supportContact;
  const emptyTitle = isStudent ? t("messages.startRequest") : t("messages.selectConversation");
  const emptyBody = isStudent
    ? t("messages.studentRequestIntro")
    : t("messages.teacherRequestIntro");
  const requestBlocked = isStudent && !isProfileReady;
  const adminLabel = language === "bn" ? "অ্যাডমিন" : "admin";

  return (
    <section className="messages-page">
      {renderStudentRequestPanel ? (
        <div className="messages-request-card">
          <div className="messages-request-copy">
            <h3>{t("messages.requestForm.title")}</h3>
            <p>
              {t("messages.requestForm.subtitle").replace("{name}", adminLabel)}
            </p>
          </div>
          <form className="messages-request-form" onSubmit={handleSubmitTutorRequest}>
            <select
              name="subject"
              value={requestForm.subject}
              onChange={handleRequestChange}
              required
            >
              <option value="">{t("messages.requestForm.subject")}</option>
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              name="classLevel"
              value={requestForm.classLevel}
              onChange={handleRequestChange}
              required
            >
              <option value="">{t("messages.requestForm.class")}</option>
              {CLASS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              name="medium"
              value={requestForm.medium}
              onChange={handleRequestChange}
              required
            >
              <option value="">{t("messages.requestForm.medium")}</option>
              {MEDIUM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              name="location"
              placeholder={t("messages.requestForm.location")}
              value={requestForm.location}
              onChange={handleRequestChange}
              required
            />
            <input
              name="landmark"
              placeholder={t("messages.requestForm.landmark")}
              value={requestForm.landmark}
              onChange={handleRequestChange}
            />
            <input
              name="schedule"
              placeholder={t("messages.requestForm.schedule")}
              value={requestForm.schedule}
              onChange={handleRequestChange}
              required
            />
            <input
              name="budget"
              placeholder={t("messages.requestForm.budget")}
              value={requestForm.budget}
              onChange={handleRequestChange}
              required
            />
            <textarea
              name="details"
              placeholder={t("messages.requestForm.details")}
              value={requestForm.details}
              onChange={handleRequestChange}
              rows="3"
              required
            />
            {requestBlocked ? (
              <p className="messages-request-warning">
                {t("messages.requestForm.warning")}
                <a href="#profile"> {t("messages.requestForm.openProfile")}</a>
              </p>
            ) : null}
            {requestBlocked ? (
              <p className="messages-request-error">
                {t("messages.requestForm.error")}
              </p>
            ) : null}
            <button className="btn btn-primary" type="submit" disabled={requestBlocked}>
              {t("messages.requestForm.sendToAdmin")}
            </button>
          </form>
        </div>
      ) : null}

      <div className={`messages-shell ${isStudent ? "messages-shell-student" : ""}`}>
        {!isStudent ? (
          <aside className="messages-list">
            <h3>{t("messages.title")}</h3>
            {loading ? (
              <p className="messages-empty">{t("messages.loadingConversations")}</p>
            ) : threads.length === 0 ? (
              <p className="messages-empty">{t("messages.noConversations")}</p>
            ) : (
              threads.map((thread) => {
                const latestMessage = thread.messages?.[thread.messages.length - 1];
                const requestEntry = getLatestTutorRequest(thread);
                const otherEmail = getOtherParticipantEmail(thread);
                const displayName = getDisplayName(thread);
                return (
                  <button
                    key={thread._id}
                    className={`messages-thread ${thread._id === activeId ? "messages-thread-active" : ""}`}
                    type="button"
                    onClick={() => setActiveId(thread._id)}
                  >
                    {requestEntry ? <span className="thread-badge">{t("messages.tuitionRequest")}</span> : null}
                    <span className="thread-name">{displayName}</span>
                    {displayName.toLowerCase() !== otherEmail.toLowerCase() ? (
                      <span className="thread-email">{otherEmail}</span>
                    ) : null}
                    {requestEntry ? (
                      <span className="thread-request-summary">
                        {[
                          requestEntry.request.fields.subject,
                          requestEntry.request.fields.classLevel,
                          requestEntry.request.fields.location,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </span>
                    ) : null}
                    {latestMessage?.text ? (
                      <span className="thread-preview">{latestMessage.text.split("\n")[0]}</span>
                    ) : null}
                  </button>
                );
              })
            )}
          </aside>
        ) : null}

        <div className="messages-chat">
          <div className="messages-header">
            {activeThread || pendingRecipient ? (
              <div>
                <h4>{getRecipientName()}</h4>
                <p>
                  {isStudent
                    ? t("messages.studentChatIntro")
                    : activeThread
                      ? getDisplayName(activeThread).toLowerCase() !==
                        getOtherParticipantEmail(activeThread).toLowerCase()
                        ? getOtherParticipantEmail(activeThread)
                        : t("messages.teacherChatIntro")
                      : pendingRecipient}
                </p>
              </div>
            ) : (
              <div>
                <h4>{emptyTitle}</h4>
                <p>{emptyBody}</p>
              </div>
            )}
          </div>

          <div className="messages-body">
            {loading ? (
              <p className="messages-empty-state">{t("messages.loadingChat")}</p>
            ) : error ? (
              <p className="messages-empty-state">{error}</p>
            ) : activeThread ? (
              <>
                {!isStudent && latestTutorRequest ? (
                  <section className="messages-request-summary-card">
                    <div className="messages-request-summary-head">
                      <div>
                        <h4>{getDisplayName(activeThread)}</h4>
                      </div>
                      <span className="messages-request-summary-time">
                        {latestTutorRequest.message.createdAt
                          ? new Date(latestTutorRequest.message.createdAt).toLocaleString()
                          : ""}
                      </span>
                    </div>
                    <div className="messages-request-summary-grid">
                      {Object.entries(REQUEST_FIELD_LABELS).map(([key, label]) =>
                        latestTutorRequest.request.fields[key] ? (
                          <div key={key} className="messages-request-summary-item">
                            <span>{label}</span>
                            <strong>{latestTutorRequest.request.fields[key]}</strong>
                          </div>
                        ) : null
                      )}
                    </div>
                  </section>
                ) : null}

                {activeThread.messages.map((msg) => {
                  const parsedRequest = parseTutorRequest(msg.text);

                  return (
                    <div
                      key={msg._id || msg.createdAt}
                      className={`message-bubble ${
                        msg.from === (authUser?.email || "me") ? "message-out" : "message-in"
                      } ${parsedRequest ? "message-request" : ""}`}
                    >
                      {parsedRequest ? (
                        <div className="message-request-content">
                          <span className="message-request-title">{parsedRequest.title}</span>
                          <div className="message-request-grid">
                            {Object.entries(REQUEST_FIELD_LABELS).map(([key, label]) =>
                              parsedRequest.fields[key] ? (
                                <div key={key} className="message-request-item">
                                  <span>{label}</span>
                                  <strong>{parsedRequest.fields[key]}</strong>
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                      <span className="message-time">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                      </span>
                    </div>
                  );
                })}
              </>
            ) : pendingRecipient ? (
              <div className="messages-empty-state">
                <h4>{emptyTitle}</h4>
                <p>{emptyBody}</p>
              </div>
            ) : (
              <div className="messages-empty-state">
                <h4>{emptyTitle}</h4>
                <p>{emptyBody}</p>
              </div>
            )}
          </div>

          <form className="messages-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder={
                isStudent
                  ? t("messages.studentFollowUp") || "Write a follow-up message..."
                  : t("messages.teacherReply") || "Reply to the student..."
              }
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={loading || (!activeThread && !pendingRecipient)}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading || !draft.trim() || (!activeThread && !pendingRecipient)}
            >
              {t("messages.send")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default MessagesPage;

