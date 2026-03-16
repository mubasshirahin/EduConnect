import React, { useEffect, useMemo, useState } from "react";

function MessagesPage({ authUser }) {
  const storageKey = useMemo(() => "educonnect-threads", []);
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!authUser?.email) {
      setThreads([]);
      return;
    }
    const stored = localStorage.getItem(storageKey);
    const items = stored ? JSON.parse(stored) : [];
    const visible = items.filter((thread) => thread.participants?.includes(authUser.email));
    setThreads(visible);

    const openThread = localStorage.getItem("educonnect-open-thread");
    if (openThread) {
      localStorage.removeItem("educonnect-open-thread");
      setActiveId(openThread);
    } else if (visible.length) {
      setActiveId(visible[0].threadId);
    }
  }, [authUser, storageKey]);

  const activeThread = threads.find((t) => t.threadId === activeId);

  const persistThreads = (updated) => {
    setThreads(updated.filter((thread) => thread.participants?.includes(authUser?.email)));
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleSend = (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeThread) {
      return;
    }
    const message = {
      id: `${Date.now()}`,
      text: draft.trim(),
      from: authUser?.email || "me",
      to: activeThread.email,
      createdAt: new Date().toISOString(),
    };
    const stored = localStorage.getItem(storageKey);
    const allThreads = stored ? JSON.parse(stored) : [];
    const updated = allThreads.map((thread) =>
      thread.threadId === activeThread.threadId
        ? { ...thread, messages: [...thread.messages, message] }
        : thread
    );
    persistThreads(updated);
    setDraft("");
  };

  const getDisplayName = (thread) => {
    const otherEmail = thread.participants?.find((email) => email !== authUser?.email) || thread.email;
    return thread.participantNames?.[otherEmail] || otherEmail;
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
                key={thread.threadId}
                className={`messages-thread ${thread.threadId === activeId ? "messages-thread-active" : ""}`}
                type="button"
                onClick={() => setActiveId(thread.threadId)}
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
          {activeThread ? (
            <>
              <div className="messages-header">
                <div>
                  <h4>{getDisplayName(activeThread)}</h4>
                  <p>{activeThread.participants?.find((email) => email !== authUser?.email)}</p>
                </div>
              </div>
              <div className="messages-body">
                {activeThread.messages.map((msg) => (
                  <div
                    key={msg.id}
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
