import express from "express";
import jwt from "jsonwebtoken";
import MessageThread from "../models/MessageThread.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

const router = express.Router();

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

const buildJobTitle = (request) => {
  const subject = request?.subject?.trim();
  const classLevel = request?.classLevel?.trim();
  if (subject && classLevel) {
    return `${subject} Tutor - ${classLevel}`;
  }
  if (subject) {
    return `${subject} Tutor Needed`;
  }
  if (classLevel) {
    return `Tutor Needed - ${classLevel}`;
  }
  return "Tuition Request";
};

const LEGACY_REQUEST_LABEL_MAP = new Map([
  ["subject", "subject"],
  ["class level", "classLevel"],
  ["class", "classLevel"],
  ["medium", "medium"],
  ["location", "location"],
  ["landmark", "landmark"],
  ["preferred schedule", "schedule"],
  ["schedule", "schedule"],
  ["budget", "budget"],
  ["details", "details"],
  ["বিষয়", "subject"],
  ["শ্রেণী", "classLevel"],
  ["মাধ্যম", "medium"],
  ["লোকেশন", "location"],
  ["ল্যান্ডমার্ক", "landmark"],
  ["সময়সূচি", "schedule"],
  ["বাজেট", "budget"],
  ["বিস্তারিত", "details"],
]);

const parseLegacyTuitionRequest = (text = "") => {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return null;
  }

  const lines = trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return null;
  }

  const fields = {};

  lines.slice(1).forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      return;
    }

    const rawLabel = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();
    const key = LEGACY_REQUEST_LABEL_MAP.get(rawLabel);

    if (key && value) {
      fields[key] = value;
    }
  });

  return Object.keys(fields).length > 0 ? fields : null;
};

const toPlainThread = (thread) =>
  typeof thread?.toObject === "function" ? thread.toObject() : { ...thread };

const collectStudentTuitionRequests = (threads, studentEmail) => {
  const normalizedStudentEmail = (studentEmail || "").toLowerCase();
  const requestMap = new Map();

  threads.forEach((thread) => {
    const plainThread = toPlainThread(thread);
    (plainThread.messages || []).forEach((message) => {
      const request = message?.tuitionRequest;
      if (!request || request.studentEmail !== normalizedStudentEmail) {
        return;
      }

      const requestId = request.requestId || String(message._id);
      const previous = requestMap.get(requestId);

      if (!previous) {
        requestMap.set(requestId, {
          requestId,
          threadId: plainThread._id,
          messageId: String(message._id),
          studentEmail: request.studentEmail,
          studentName: request.studentName || plainThread.participantNames?.[request.studentEmail] || "",
          fields: {
            subject: request.subject || "",
            classLevel: request.classLevel || "",
            medium: request.medium || "",
            location: request.location || "",
            landmark: request.landmark || "",
            schedule: request.schedule || "",
            budget: request.budget || "",
            details: request.details || "",
          },
          status: request.status || "pending",
          submittedAt: message.createdAt,
          acceptedAt: request.acceptedAt || null,
          acceptedBy: request.acceptedBy || "",
          acceptedByName: request.acceptedByName || "",
          jobId: request.jobId || "",
        });
        return;
      }

      const previousAcceptedAt = previous.acceptedAt ? new Date(previous.acceptedAt).getTime() : 0;
      const nextAcceptedAt = request.acceptedAt ? new Date(request.acceptedAt).getTime() : 0;
      const shouldReplace =
        previous.status !== "accepted" && request.status === "accepted"
          ? true
          : request.status === "accepted" && nextAcceptedAt > previousAcceptedAt;

      if (shouldReplace) {
        requestMap.set(requestId, {
          ...previous,
          threadId: plainThread._id,
          messageId: String(message._id),
          status: request.status,
          acceptedAt: request.acceptedAt || previous.acceptedAt,
          acceptedBy: request.acceptedBy || previous.acceptedBy,
          acceptedByName: request.acceptedByName || previous.acceptedByName,
          jobId: request.jobId || previous.jobId,
        });
      }
    });
  });

  return [...requestMap.values()].sort(
    (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
  );
};

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

router.get("/tuition-requests", async (req, res, next) => {
  try {
    const studentEmail = (req.query.studentEmail || "").toLowerCase();
    if (!studentEmail) {
      return res.status(400).json({ message: "Student email is required." });
    }

    const threads = await MessageThread.find({ participants: studentEmail }).sort({ updatedAt: -1 });
    const hydratedThreads = await resolveParticipantNames(threads);
    const requests = collectStudentTuitionRequests(hydratedThreads, studentEmail);
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

router.post("/send", async (req, res, next) => {
  try {
    const { from, to, text, fromName, toName, tuitionRequest } = req.body;
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
        messages: {
          from,
          to,
          text,
          tuitionRequest: tuitionRequest
            ? {
                requestId: tuitionRequest.requestId || "",
                subject: tuitionRequest.subject || "",
                classLevel: tuitionRequest.classLevel || "",
                medium: tuitionRequest.medium || "",
                location: tuitionRequest.location || "",
                landmark: tuitionRequest.landmark || "",
                schedule: tuitionRequest.schedule || "",
                budget: tuitionRequest.budget || "",
                details: tuitionRequest.details || "",
                studentEmail: (tuitionRequest.studentEmail || from).toLowerCase(),
                studentName: tuitionRequest.studentName || fromName || from,
                status: tuitionRequest.status || "pending",
              }
            : undefined,
        },
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

router.patch("/threads/:threadId/requests/:messageId/accept", authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Only admins can accept tuition requests." });
    }

    const { threadId, messageId } = req.params;
    const thread = await MessageThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const message = thread.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: "Tuition request not found." });
    }

    const parsedLegacyRequest = parseLegacyTuitionRequest(message.text);
    const existingRequest = message.tuitionRequest?.toObject
      ? message.tuitionRequest.toObject()
      : message.tuitionRequest || {};
    const requestId = existingRequest.requestId || `legacy:${threadId}:${String(message._id)}`;
    const requestData = {
      ...parsedLegacyRequest,
      ...existingRequest,
      requestId,
      studentEmail: (existingRequest.studentEmail || message.from || "").toLowerCase(),
      studentName: existingRequest.studentName || "",
      status: existingRequest.status || "pending",
    };

    if (!requestData.studentEmail || !parsedLegacyRequest && Object.keys(existingRequest).length === 0) {
      return res.status(404).json({ message: "Tuition request not found." });
    }

    let job = null;
    const acceptedAt = new Date();

    job = await Job.findOne({ tuitionRequestId: requestData.requestId });

    if (!job) {
      job = await Job.create({
        title: buildJobTitle(requestData),
        location: requestData.location || "Location pending",
        subject: requestData.subject || "",
        classLevel: requestData.classLevel || "",
        schedule: requestData.schedule || "Schedule pending",
        rate: requestData.budget || "Budget pending",
        postedBy: req.user?.name ? `Admin: ${req.user.name}` : "Admin",
        postedByEmail: req.user?.email || "",
        studentEmail: requestData.studentEmail || "",
        studentName: requestData.studentName || "",
        tuitionRequestId: requestData.requestId || String(message._id),
        sourceThreadId: threadId,
        sourceMessageId: String(message._id),
      });
    }

    await MessageThread.updateMany(
      {
        $or: [
          { "messages.tuitionRequest.requestId": requestData.requestId },
          { _id: threadId, "messages._id": message._id },
        ],
      },
      {
        $set: {
          "messages.$[message].tuitionRequest.requestId": requestData.requestId,
          "messages.$[message].tuitionRequest.subject": requestData.subject || "",
          "messages.$[message].tuitionRequest.classLevel": requestData.classLevel || "",
          "messages.$[message].tuitionRequest.medium": requestData.medium || "",
          "messages.$[message].tuitionRequest.location": requestData.location || "",
          "messages.$[message].tuitionRequest.landmark": requestData.landmark || "",
          "messages.$[message].tuitionRequest.schedule": requestData.schedule || "",
          "messages.$[message].tuitionRequest.budget": requestData.budget || "",
          "messages.$[message].tuitionRequest.details": requestData.details || "",
          "messages.$[message].tuitionRequest.studentEmail": requestData.studentEmail,
          "messages.$[message].tuitionRequest.studentName": requestData.studentName || "",
          "messages.$[message].tuitionRequest.status": "accepted",
          "messages.$[message].tuitionRequest.acceptedAt": acceptedAt,
          "messages.$[message].tuitionRequest.acceptedBy": req.user.email,
          "messages.$[message].tuitionRequest.acceptedByName": req.user.name,
          "messages.$[message].tuitionRequest.jobId": String(job._id),
        },
      },
      {
        arrayFilters: [
          {
            $or: [
              { "message.tuitionRequest.requestId": requestData.requestId },
              { "message._id": message._id },
            ],
          },
        ],
      }
    );

    const updatedThread = await MessageThread.findById(threadId);
    const [hydratedThread] = await resolveParticipantNames(updatedThread);

    res.json({
      message: "Tuition request accepted and posted to the job board.",
      thread: hydratedThread,
      job,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
