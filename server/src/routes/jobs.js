import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.postedByEmail) {
      query.postedByEmail = req.query.postedByEmail.toLowerCase();
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
router.post("/", async (req, res, next) => {
  try {
    const { title, location, schedule, rate, postedBy, postedByEmail } = req.body;
    if (!title || !location || !schedule || !rate || !postedBy || !postedByEmail) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const job = await Job.create({ title, location, schedule, rate, postedBy, postedByEmail });
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