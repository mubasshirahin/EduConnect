import React, { useEffect, useRef, useState } from "react";
import { getUnreadNotifications, markThreadSeen } from "../utils/messageNotifications.js";

function MessageNotifications({ authUser }) {
  const [threads, setThreads] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!authUser?.email) {
      setThreads([]);
      return;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/messages?user=${encodeURIComponent(authUser.email)}`);
        if (!response.ok) {
          if (isMounted) {
            setThreads([]);
          }
          return;
        }

        const data = await response.json();
        if (isMounted) {
          setThreads(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setThreads([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 15000);
    const refreshOnSeen = () => loadNotifications();
    window.addEventListener("educonnect-message-seen-updated", refreshOnSeen);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("educonnect-message-seen-updated", refreshOnSeen);
    };
  }, [authUser?.email]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = getUnreadNotifications(threads, authUser?.email);
  const unreadCount = notifications.length;

  const handleOpenThread = (notification) => {
    markThreadSeen(authUser?.email, notification.threadId, notification.createdAt);
    setIsOpen(false);
    window.location.hash = `#messages?to=${encodeURIComponent(notification.senderEmail)}`;
  };

  return (
    <div className="message-notifications" ref={dropdownRef}>
      <button
        className={`message-notifications-button ${isOpen ? "message-notifications-button-open" : ""}`}
        type="button"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="message-notifications-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path d="M9 17a3 3 0 0 0 6 0" />
          </svg>
        </span>
        {unreadCount > 0 ? <span className="message-notifications-count">{unreadCount}</span> : null}
      </button>

      {isOpen ? (
        <div className="message-notifications-dropdown">
          <div className="message-notifications-header">
            <h4>Notifications</h4>
            <span>{unreadCount > 0 ? `${unreadCount} unread` : "Up to date"}</span>
          </div>

          <div className="message-notifications-list">
            {loading && threads.length === 0 ? (
              <p className="message-notifications-empty">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="message-notifications-empty">No new messages yet.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.messageId}
                  type="button"
                  className="message-notifications-item"
                  onClick={() => handleOpenThread(notification)}
                >
                  <div className="message-notifications-item-top">
                    <strong>{notification.senderName}</strong>
                    <span>
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <p>{notification.text}</p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MessageNotifications;
