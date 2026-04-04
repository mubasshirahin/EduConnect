const buildStorageKey = (email) =>
  email ? `educonnect-message-seen:${email.toLowerCase()}` : "educonnect-message-seen:guest";

export function readSeenMap(email) {
  const key = buildStorageKey(email);
  const raw = localStorage.getItem(key);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function markThreadSeen(email, threadId, timestamp) {
  if (!email || !threadId || !timestamp) {
    return;
  }

  const key = buildStorageKey(email);
  const seenMap = readSeenMap(email);
  const nextTime = new Date(timestamp).toISOString();

  if (seenMap[threadId] === nextTime) {
    return;
  }

  const nextMap = { ...seenMap, [threadId]: nextTime };
  localStorage.setItem(key, JSON.stringify(nextMap));
  window.dispatchEvent(new CustomEvent("educonnect-message-seen-updated", { detail: nextMap }));
}

export function getUnreadNotifications(threads, email) {
  const normalizedEmail = email?.toLowerCase();
  if (!normalizedEmail) {
    return [];
  }

  const seenMap = readSeenMap(normalizedEmail);

  return (Array.isArray(threads) ? threads : [])
    .map((thread) => {
      const latestMessage = thread.messages?.[thread.messages.length - 1];
      if (!latestMessage || latestMessage.from?.toLowerCase() === normalizedEmail) {
        return null;
      }

      const seenAt = seenMap[thread._id] ? new Date(seenMap[thread._id]).getTime() : 0;
      const messageAt = latestMessage.createdAt ? new Date(latestMessage.createdAt).getTime() : 0;

      if (messageAt <= seenAt) {
        return null;
      }

      const otherEmail =
        thread.participants?.find((participant) => participant !== normalizedEmail) || latestMessage.from;

      return {
        threadId: thread._id,
        messageId: latestMessage._id || latestMessage.createdAt || thread._id,
        senderEmail: otherEmail,
        senderName: thread.participantNames?.[otherEmail] || otherEmail,
        text: latestMessage.text,
        createdAt: latestMessage.createdAt,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}
