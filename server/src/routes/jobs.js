import express from "express";
import jwt from "jsonwebtoken";
import Job from "../models/Job.js";
import User from "../models/User.js";

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
router.patch("/:jobId/applicants/:applicantEmail/status", async (req, res, next) => {
  try {
    const { jobId, applicantEmail } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }
    
    if (!["pending", "shortlisted", "rejected", "hired"].includes(status)) {
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
    
    applicant.status = status;
    await job.save();
    
    res.json({ 
      message: `Applicant status updated to ${status}`,
      applicant: applicant
    });
    
  } catch (error) {
    next(error);
  }
});

export default router;
