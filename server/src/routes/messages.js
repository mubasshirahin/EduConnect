import express from "express";
import MessageThread from "../models/MessageThread.js";
import User from "../models/User.js";

const router = express.Router();

const resolveParticipantNames = async (threads) => {
  const normalizedThreads = Array.isArray(threads) ? threads : [threads];
  const emails = [
    ...new Set(
      normalizedThreads.flatMap((thread) =>
        (thread?.participants || []).map((participant) => participant.toLowerCase())
      )
    ),
  ];

  if (emails.length === 0) {
    return normalizedThreads;
  }

  const users = await User.find({ email: { $in: emails } }).select("email name").lean();
  const userNameMap = new Map(
    users.map((entry) => [entry.email.toLowerCase(), entry.name])
  );

  return normalizedThreads.map((thread) => {
    const plainThread = typeof thread.toObject === "function" ? thread.toObject() : { ...thread };
    const participantNames = { ...(plainThread.participantNames || {}) };

    (plainThread.participants || []).forEach((participant) => {
      const normalizedEmail = participant.toLowerCase();
      const existingName = participantNames[normalizedEmail];
      const resolvedName = userNameMap.get(normalizedEmail);

      if (!existingName || existingName.toLowerCase() === normalizedEmail) {
        participantNames[normalizedEmail] = resolvedName || existingName || participant;
      }
    });

    return {
      ...plainThread,
      participantNames,
    };
  });
};

router.get("/", async (req, res, next) => {
  try {
    const user = (req.query.user || "").toLowerCase();
    if (!user) {
      return res.status(400).json({ message: "User email is required." });
    }
    const threads = await MessageThread.find({ participants: user }).sort({ updatedAt: -1 });
    const hydratedThreads = await resolveParticipantNames(threads);
    res.json(hydratedThreads);
  } catch (error) {
    next(error);
  }
});

router.post("/send", async (req, res, next) => {
  try {
    const { from, to, text, fromName, toName } = req.body;
    if (!from || !to || !text) {
      return res.status(400).json({ message: "From, to, and text are required." });
    }
    const participants = [from.toLowerCase(), to.toLowerCase()].sort();
    const threadId = participants.join("|");
    const update = {
      $setOnInsert: { participants },
      $set: {
        [`participantNames.${from.toLowerCase()}`]: fromName || from,
        [`participantNames.${to.toLowerCase()}`]: toName || to,
      },
      $push: {
        messages: { from, to, text },
      },
    };
    const thread = await MessageThread.findOneAndUpdate(
      { _id: threadId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const [hydratedThread] = await resolveParticipantNames(thread);
    res.json(hydratedThread);
  } catch (error) {
    next(error);
  }
});

export default router;
