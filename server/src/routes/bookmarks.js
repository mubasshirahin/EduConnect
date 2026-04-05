import express from "express";
import jwt from "jsonwebtoken";
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
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get all bookmarked jobs for the current user
router.get("/", authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("savedJobs");
    res.json(user.savedJobs || []);
  } catch (error) {
    next(error);
  }
});

// Toggle bookmark for a job
router.post("/toggle/:jobId", authenticate, async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user._id);
    
    const index = user.savedJobs.indexOf(jobId);
    let isSaved = false;
    
    if (index === -1) {
      user.savedJobs.push(jobId);
      isSaved = true;
    } else {
      user.savedJobs.splice(index, 1);
      isSaved = false;
    }
    
    await user.save();
    res.json({ isSaved, savedJobs: user.savedJobs });
  } catch (error) {
    next(error);
  }
});

export default router;
