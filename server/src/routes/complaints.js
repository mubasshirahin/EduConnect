import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";

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
  } catch {
    return res.status(401).json({ message: "Invalid token." });
  }
};

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Only admins can view complaints." });
    }

    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    if (!["teacher", "student"].includes(req.user?.role)) {
      return res.status(403).json({ message: "Only teachers and students can submit complaints." });
    }

    const { subject, details } = req.body;
    if (!subject || !details) {
      return res.status(400).json({ message: "Subject and details are required." });
    }

    const complaint = await Complaint.create({
      authorName: req.user.name,
      authorEmail: req.user.email,
      authorRole: req.user.role,
      subject,
      details,
    });

    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
});

export default router;
