import React, { useEffect, useState } from "react";

function MessagesPage({ authUser, route }) {
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [pendingRecipient, setPendingRecipient] = useState(null);

  useEffect(() => {
    if (!authUser?.email) {
      setThreads([]);
      return;
    }
    fetch(`/api/messages?user=${encodeURIComponent(authUser.email)}`)
      .then((res) => res.json())
      .then((items) => {
        setThreads(items);
        if (items.length) {
          let nextActive = items[0]._id;
          if (route?.includes("?to=")) {
            const params = new URLSearchParams(route.split("?")[1]);
            const toEmail = params.get("to");
            const match = items.find((thread) => thread.participants?.includes(toEmail));
            if (match) {
              nextActive = match._id;
              setPendingRecipient(null);
            } else if (toEmail) {
              setPendingRecipient(toEmail);
              nextActive = `new:${toEmail}`;
            }
          }
          setActiveId(nextActive);
        } else if (route?.includes("?to=")) {
          const params = new URLSearchParams(route.split("?")[1]);
          const toEmail = params.get("to");
          if (toEmail) {
            setPendingRecipient(toEmail);
            setActiveId(`new:${toEmail}`);
          }
        }
      })
      .catch(() => setThreads([]));
  }, [authUser, route]);

  const activeThread = threads.find((t) => t._id === activeId);

  const handleSend = (event) => {
    event.preventDefault();
    if (!draft.trim() || !authUser?.email || (!activeThread && !pendingRecipient)) {
      return;
    }
    const toEmail =
      pendingRecipient ||
      activeThread?.participants?.find((email) => email !== authUser.email) ||
      "";
    fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: authUser.email,
        to: toEmail,
        text: draft.trim(),
        fromName: authUser.name,
        toName: activeThread?.participantNames?.[toEmail],
      }),
    })
      .then((res) => res.json())
      .then((updatedThread) => {
        setThreads((prev) => {
          const exists = prev.some((thread) => thread._id === updatedThread._id);
          if (exists) {
            return prev.map((thread) =>
              thread._id === updatedThread._id ? updatedThread : thread
            );
          }
          return [updatedThread, ...prev];
        });
        setActiveId(updatedThread._id);
        setPendingRecipient(null);
        setDraft("");
      })
      .catch(() => {});
  };

  const getDisplayName = (thread) => {
    const otherEmail = thread.participants?.find((email) => email !== authUser?.email) || thread.email;
    const map = thread.participantNames || {};
    return map[otherEmail] || otherEmail;
  };

  return (
    <section className="messages-page">
      <div className="messages-shell">
        <aside className="messages-list">
          <h3>Messages</h3>
          {threads.length === 0 ? (
            <p className="messages-empty">No conversations yet.</p>
          ) : (
            threads.map((thread) => (
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
              </button>
            ))
          )}
        </aside>
        <div className="messages-chat">
          {activeThread || pendingRecipient ? (
            <>
              <div className="messages-header">
                <div>
                  <h4>{activeThread ? getDisplayName(activeThread) : pendingRecipient}</h4>
                  <p>
                    {activeThread
                      ? activeThread.participants?.find((email) => email !== authUser?.email)
                      : pendingRecipient}
                  </p>
                </div>
              </div>
              <div className="messages-body">
                {activeThread &&
                  activeThread.messages.map((msg) => (
                    <div
                      key={msg._id || msg.createdAt}
                      className={`message-bubble ${
                        msg.from === (authUser?.email || "me") ? "message-out" : "message-in"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
              </div>
              <form className="messages-input" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <button className="btn btn-primary" type="submit">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="messages-empty-state">
              <h4>Select a conversation</h4>
              <p>Start a chat from an applicant profile.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default MessagesPage;
