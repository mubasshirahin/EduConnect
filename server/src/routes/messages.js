import express from "express";
import MessageThread from "../models/MessageThread.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const user = (req.query.user || "").toLowerCase();
    if (!user) {
      return res.status(400).json({ message: "User email is required." });
    }
    const threads = await MessageThread.find({ participants: user }).sort({ updatedAt: -1 });
    res.json(threads);
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
    res.json(thread);
  } catch (error) {
    next(error);
  }
});

export default router;
