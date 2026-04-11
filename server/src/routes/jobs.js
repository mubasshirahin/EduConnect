import express from "express";
import jwt from "jsonwebtoken";
import Job from "../models/Job.js";
import MessageThread from "../models/MessageThread.js";
import User from "../models/User.js";

const router = express.Router();
const APPLICANT_STATUSES = [
  "pending",
  "shortlisted",
  "profile_shared",
  "appointed",
  "confirmed",
  "rejected",
  "hired",
];

const ADVANCED_SINGLE_SELECT_STATUSES = ["appointed", "confirmed", "hired"];

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

const buildTeacherSummary = (user) => {
  if (!user) {
    return "";
  }

  const parts = [
    user.phone ? `Phone: ${user.phone}` : "",
    user.city ? `City: ${user.city}` : "",
    user.location ? `Area: ${user.location}` : "",
    user.preferredSubjects ? `Subjects: ${user.preferredSubjects}` : "",
    user.preferredClasses ? `Classes: ${user.preferredClasses}` : "",
    user.expectedSalary ? `Expected Salary: ${user.expectedSalary}` : "",
  ].filter(Boolean);

  return parts.join(" | ");
};

const buildThreadId = (firstEmail, secondEmail) =>
  [String(firstEmail || "").toLowerCase(), String(secondEmail || "").toLowerCase()].sort().join("|");

const pushThreadMessage = async ({
  fromEmail,
  fromName,
  toEmail,
  toName,
  text,
  jobApplicationUpdate,
}) => {
  const normalizedFrom = String(fromEmail || "").toLowerCase();
  const normalizedTo = String(toEmail || "").toLowerCase();

  if (!normalizedFrom || !normalizedTo || !text?.trim()) {
    return null;
  }

  const participants = [normalizedFrom, normalizedTo].sort();
  const threadId = buildThreadId(normalizedFrom, normalizedTo);

  return MessageThread.findOneAndUpdate(
    { _id: threadId },
    {
      $setOnInsert: { participants },
      $set: {
        [`participantNames.${normalizedFrom}`]: fromName || normalizedFrom,
        [`participantNames.${normalizedTo}`]: toName || normalizedTo,
      },
      $push: {
        messages: {
          from: normalizedFrom,
          to: normalizedTo,
          text: text.trim(),
          jobApplicationUpdate: jobApplicationUpdate || undefined,
        },
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

router.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.postedByEmail) {
      query.postedByEmail = req.query.postedByEmail.toLowerCase();
    }
    if (req.query.studentEmail) {
      query.studentEmail = req.query.studentEmail.toLowerCase();
    }
    if (req.query.applicantEmail) {
      query["applicants.email"] = req.query.applicantEmail.toLowerCase();
    }
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
});
router.post("/", authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Only admins can post jobs." });
    }

    const { title, subject, classLevel, location, schedule, rate, postedBy, postedByEmail } = req.body;
    if (!title || !location || !schedule || !rate || !postedBy || !postedByEmail) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const job = await Job.create({ title, subject: subject || "", classLevel: classLevel || "", location, schedule, rate, postedBy, postedByEmail });
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/apply", async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ message: "Applicant name and email are required." });
    }
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    const exists = job.applicants.some((app) => app.email === email.toLowerCase());
    if (!exists) {
      job.applicants.push({ email, name });
      await job.save();

      const admins = await User.find({ role: "admin" }).select("email name").lean();
      await Promise.all(
        admins
          .filter((admin) => admin?.email)
          .map((admin) =>
            pushThreadMessage({
              fromEmail: email,
              fromName: name,
              toEmail: admin.email,
              toName: admin.name || admin.email,
              text: `${name} applied for ${job.title}.`,
            })
          )
      );
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/withdraw", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Applicant email is required." });
    }
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    job.applicants = job.applicants.filter((app) => app.email !== email.toLowerCase());
    await job.save();
    res.json(job);
  } catch (error) {
    next(error);
  }
});

// Update applicant status (for teachers)
router.patch("/:jobId/applicants/:applicantEmail/status", authenticate, async (req, res, next) => {
  try {
    const { jobId, applicantEmail } = req.params;
    const { status, action } = req.body;

    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update applicant status." });
    }

    if (!status && action !== "increment_demo") {
      return res.status(400).json({ message: "Status is required." });
    }

    if (status && !APPLICANT_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const applicant = job.applicants.find(
      (app) => app.email === applicantEmail.toLowerCase()
    );

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found." });
    }

    if (action === "increment_demo") {
      if (!["appointed", "confirmed", "hired"].includes(applicant.status)) {
        return res.status(400).json({ message: "Only appointed teachers can receive demo class updates." });
      }
      applicant.demoClassCount = Math.min((applicant.demoClassCount || 0) + 1, 3);
      await job.save();
      return res.json({
        message: `Demo class count updated to ${applicant.demoClassCount}`,
        applicant,
      });
    }

    if (status === "confirmed" && (applicant.demoClassCount || 0) < 3) {
      return res.status(400).json({ message: "Complete 3 demo classes before confirming this job." });
    }

    applicant.status = status;

    if (status === "shortlisted" && !applicant.shortlistedAt) {
      applicant.shortlistedAt = new Date();
    }

    if (status === "profile_shared") {
      applicant.shortlistedAt = applicant.shortlistedAt || new Date();
      applicant.sharedWithGuardianAt = new Date();
    }

    if (status === "appointed") {
      applicant.shortlistedAt = applicant.shortlistedAt || new Date();
      applicant.appointedAt = new Date();
      applicant.demoClassCount = applicant.demoClassCount || 0;
    }

    if (status === "confirmed" || status === "hired") {
      applicant.shortlistedAt = applicant.shortlistedAt || new Date();
      applicant.appointedAt = applicant.appointedAt || new Date();
      applicant.confirmedAt = new Date();
    }

    if (ADVANCED_SINGLE_SELECT_STATUSES.includes(status)) {
      job.applicants.forEach((entry) => {
        if (entry.email === applicant.email) {
          return;
        }
        if (ADVANCED_SINGLE_SELECT_STATUSES.includes(entry.status)) {
          entry.status = entry.shortlistedAt ? "shortlisted" : "pending";
          entry.appointedAt = undefined;
          entry.confirmedAt = undefined;
          entry.demoClassCount = 0;
        }
      });
    }

    await job.save();

    const teacher = await User.findOne({ email: applicant.email }).select("name email").lean();
    const teacherName = teacher?.name || applicant.name || applicant.email;

    if (status === "appointed") {
      await pushThreadMessage({
        fromEmail: req.user.email,
        fromName: req.user.name || req.user.email,
        toEmail: applicant.email,
        toName: teacherName,
        text: `You were appointed for ${job.title}.`,
        jobApplicationUpdate: {
          type: "teacher_appointed",
          jobId: String(job._id),
          jobTitle: job.title || "",
          teacherEmail: applicant.email,
          teacherName,
          summary: `You were appointed for this tuition opportunity. Demo progress: ${applicant.demoClassCount || 0}/3.`,
          demoClassCount: applicant.demoClassCount || 0,
        },
      });
    }

    if (status === "confirmed" || status === "hired") {
      await pushThreadMessage({
        fromEmail: req.user.email,
        fromName: req.user.name || req.user.email,
        toEmail: applicant.email,
        toName: teacherName,
        text: `Your job for ${job.title} is confirmed.`,
        jobApplicationUpdate: {
          type: "job_confirmed",
          jobId: String(job._id),
          jobTitle: job.title || "",
          teacherEmail: applicant.email,
          teacherName,
          summary: "Your tuition job has been confirmed.",
          demoClassCount: applicant.demoClassCount || 0,
        },
      });
    }

    res.json({
      message: `Applicant status updated to ${status}`,
      applicant,
      job,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:jobId/applicants/:applicantEmail/share-profile", authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Only admins can share teacher profiles with guardians." });
    }

    const { jobId, applicantEmail } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const applicant = job.applicants.find(
      (entry) => entry.email === applicantEmail.toLowerCase()
    );
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found." });
    }

    if (applicant.sharedWithGuardianAt) {
      return res.status(400).json({ message: "This teacher profile was already shared with the guardian." });
    }

    const { summary } = req.body || {};
    const teacher = await User.findOne({ email: applicant.email }).select("name email");
    const teacherSummary = String(summary || "").trim() || buildTeacherSummary(teacher);
    const studentEmail = (job.studentEmail || job.postedByEmail || "").toLowerCase();

    if (!studentEmail) {
      return res.status(400).json({ message: "Guardian contact was not found for this job." });
    }

    const participants = [req.user.email.toLowerCase(), studentEmail].sort();
    const threadId = participants.join("|");
    const teacherName = teacher?.name || applicant.name || applicant.email;
    const shareText = `Teacher profile shared for ${job.title}: ${teacherName}`;

    const update = {
      $setOnInsert: { participants },
      $set: {
        [`participantNames.${req.user.email.toLowerCase()}`]: req.user.name || req.user.email,
        [`participantNames.${studentEmail}`]: job.studentName || studentEmail,
      },
      $push: {
        messages: {
          from: req.user.email,
          to: studentEmail,
          text: shareText,
          jobApplicationUpdate: {
            type: "teacher_profile_shared",
            jobId: String(job._id),
            jobTitle: job.title || "",
            teacherEmail: applicant.email,
            teacherName,
            summary: teacherSummary,
            demoClassCount: applicant.demoClassCount || 0,
          },
        },
      },
    };

    await MessageThread.findOneAndUpdate(
      { _id: threadId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    applicant.shortlistedAt = applicant.shortlistedAt || new Date();
    applicant.sharedWithGuardianAt = new Date();
    applicant.status = "profile_shared";
    await job.save();

    res.json({
      message: "Teacher profile shared with the guardian.",
      applicant,
      job,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
