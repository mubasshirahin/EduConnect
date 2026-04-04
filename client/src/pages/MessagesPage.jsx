import React, { useEffect, useState } from "react";

const EMPTY_REQUEST = {
  subject: "",
  classLevel: "",
  location: "",
  landmark: "",
  schedule: "",
  budget: "",
  details: "",
};

function MessagesPage({ authUser, route }) {
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [pendingRecipient, setPendingRecipient] = useState(null);
  const [supportContact, setSupportContact] = useState(null);
  const [requestForm, setRequestForm] = useState(EMPTY_REQUEST);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isStudent = authUser?.role === "student";

  useEffect(() => {
    const loadThreads = async () => {
      if (!authUser?.email) {
        setThreads([]);
        setActiveId(null);
        setPendingRecipient(null);
        setSupportContact(null);
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
          throw new Error("Unable to load messages.");
        }

        const nextThreads = await threadsResponse.json();
        const nextSupport =
          isStudent && adminsResponse?.ok
            ? (await adminsResponse.json())[0] || null
            : null;

        setThreads(Array.isArray(nextThreads) ? nextThreads : []);
        setSupportContact(nextSupport);

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
        setError(loadError.message || "Unable to load messages.");
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
  }, [authUser, isStudent, route]);

  const activeThread = threads.find((thread) => thread._id === activeId) || null;

  const getDisplayName = (thread) => {
    const otherEmail = thread.participants?.find((email) => email !== authUser?.email) || thread.email;
    const map = thread.participantNames || {};
    return map[otherEmail] || otherEmail;
  };

  const getRecipientName = () => {
    if (isStudent) {
      return "Admin Support";
    }
    if (activeThread) {
      return getDisplayName(activeThread);
    }
    if (pendingRecipient && supportContact?.email?.toLowerCase() === pendingRecipient) {
      return supportContact.name || "Admin Support";
    }
    return pendingRecipient;
  };

  const sendMessage = async (text) => {
    const bodyText = text.trim();
    if (!bodyText || !authUser?.email || (!activeThread && !pendingRecipient)) {
      return;
    }

    const toEmail =
      pendingRecipient ||
      activeThread?.participants?.find((email) => email !== authUser.email) ||
      "";

    if (!toEmail) {
      return;
    }

    const toName =
      activeThread?.participantNames?.[toEmail] ||
      (supportContact?.email?.toLowerCase() === toEmail ? supportContact.name : undefined);

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: authUser.email,
          to: toEmail,
          text: bodyText,
          fromName: authUser.name,
          toName,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to send message.");
      }

      const updatedThread = await response.json();
      setThreads((prev) => {
        const exists = prev.some((thread) => thread._id === updatedThread._id);
        if (exists) {
          const replaced = prev.map((thread) =>
            thread._id === updatedThread._id ? updatedThread : thread
          );
          return replaced.sort(
            (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
          );
        }
        return [updatedThread, ...prev];
      });
      setActiveId(updatedThread._id);
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
    const message = [
      "Tutor request",
      `Subject: ${requestForm.subject.trim()}`,
      `Class level: ${requestForm.classLevel.trim()}`,
      `Location: ${requestForm.location.trim()}`,
      `Landmark: ${requestForm.landmark.trim() || "Not provided"}`,
      `Preferred schedule: ${requestForm.schedule.trim()}`,
      `Budget: ${requestForm.budget.trim()}`,
      `Details: ${requestForm.details.trim()}`,
    ].join("\n");

    await sendMessage(message);
    setRequestForm(EMPTY_REQUEST);
  };

  const renderStudentRequestPanel = isStudent && supportContact;
  const emptyTitle = isStudent ? "Start your tutor request" : "Select a conversation";
  const emptyBody = isStudent
    ? "Send your subject, class, area, schedule, and budget to the admin team."
    : "Open a student conversation to review and reply.";

  return (
    <section className="messages-page">
      {renderStudentRequestPanel ? (
        <div className="messages-request-card">
          <div className="messages-request-copy">
            <p className="eyebrow">Admin Support</p>
            <h3>Send tutor requirement details</h3>
            <p>
              Chat directly with {supportContact.name || "the admin team"} and share what kind of
              tutor you need. Admin can review this request before posting it publicly.
            </p>
          </div>
          <form className="messages-request-form" onSubmit={handleSubmitTutorRequest}>
            <input
              name="subject"
              placeholder="Subject"
              value={requestForm.subject}
              onChange={handleRequestChange}
              required
            />
            <input
              name="classLevel"
              placeholder="Class or level"
              value={requestForm.classLevel}
              onChange={handleRequestChange}
              required
            />
            <input
              name="location"
              placeholder="Area or location"
              value={requestForm.location}
              onChange={handleRequestChange}
              required
            />
            <input
              name="landmark"
              placeholder="Landmark or full address"
              value={requestForm.landmark}
              onChange={handleRequestChange}
            />
            <input
              name="schedule"
              placeholder="Preferred schedule"
              value={requestForm.schedule}
              onChange={handleRequestChange}
              required
            />
            <input
              name="budget"
              placeholder="Budget"
              value={requestForm.budget}
              onChange={handleRequestChange}
              required
            />
            <textarea
              name="details"
              placeholder="Extra details about tutor preference, student needs, syllabus, or timeline"
              value={requestForm.details}
              onChange={handleRequestChange}
              rows="3"
              required
            />
            <button className="btn btn-primary" type="submit">
              Send Request to Admin
            </button>
          </form>
        </div>
      ) : null}

      <div className={`messages-shell ${isStudent ? "messages-shell-student" : ""}`}>
        {!isStudent ? (
          <aside className="messages-list">
            <h3>Messages</h3>
            {loading ? (
              <p className="messages-empty">Loading conversations...</p>
            ) : threads.length === 0 ? (
              <p className="messages-empty">No conversations yet.</p>
            ) : (
              threads.map((thread) => {
                const latestMessage = thread.messages?.[thread.messages.length - 1];
                return (
                  <button
                    key={thread._id}
                    className={`messages-thread ${thread._id === activeId ? "messages-thread-active" : ""}`}
                    type="button"
                    onClick={() => setActiveId(thread._id)}
                  >
                    <span className="thread-name">{getDisplayName(thread)}</span>
                    <span className="thread-email">
                      {thread.participants?.find((email) => email !== authUser?.email) || ""}
                    </span>
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
                    ? "Share your tutor requirements here and admin will review them."
                    : activeThread
                      ? activeThread.participants?.find((email) => email !== authUser?.email)
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
              <p className="messages-empty-state">Loading chat...</p>
            ) : error ? (
              <p className="messages-empty-state">{error}</p>
            ) : activeThread ? (
              activeThread.messages.map((msg) => (
                <div
                  key={msg._id || msg.createdAt}
                  className={`message-bubble ${
                    msg.from === (authUser?.email || "me") ? "message-out" : "message-in"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="message-time">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                  </span>
                </div>
              ))
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
                  ? "Write a follow-up message for admin..."
                  : "Reply to the student..."
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
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default MessagesPage;
