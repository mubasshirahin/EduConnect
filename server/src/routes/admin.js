import express from "express";
import User from "../models/User.js";
import Job from "../models/Job.js";

const router = express.Router();

router.get("/stats", async (req, res, next) => {
  try {
    const [totalUsers, totalJobs, totalAdmins] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      Job.countDocuments({}),
      User.countDocuments({ role: "admin" }),
    ]);
    res.json({ totalUsers, totalJobs, totalAdmins });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const role = req.query.role;
    const query = {};
    if (role === "admin") {
      query.role = "admin";
    } else if (role === "user") {
      query.role = { $ne: "admin" };
    }
    const users = await User.find(query).select("name email role createdAt").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get("/users/:email", async (req, res, next) => {
  try {
    const email = req.params.email.toLowerCase();
    const user = await User.findOne({ email }).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
