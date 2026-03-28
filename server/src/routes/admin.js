import express from "express";
import User from "../models/User.js";
import Job from "../models/Job.js";

const router = express.Router();

router.get("/stats", async (req, res, next) => {
  try {
    const [totalUsers, totalJobs, totalAdmins, totalBlocked] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      Job.countDocuments({}),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: { $ne: "admin" }, isBlocked: true }),
    ]);
    res.json({ totalUsers, totalJobs, totalAdmins, totalBlocked });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const role = req.query.role;
    const blockedFilter = req.query.blocked;
    const query = {};
    if (role === "admin") {
      query.role = "admin";
    } else if (role === "teacher") {
      query.role = "teacher";
    } else if (role === "student") {
      query.role = "student";
    } else if (role === "user") {
      query.role = { $ne: "admin" };
    }
    if (blockedFilter === "true") {
      query.isBlocked = true;
    } else if (blockedFilter === "false") {
      query.isBlocked = false;
    }
    const users = await User.find(query)
      .select("name email role createdAt isBlocked blockedAt")
      .sort({ createdAt: -1 });
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

router.patch("/users/:email/block", async (req, res, next) => {
  try {
    const email = req.params.email.toLowerCase();
    const { blocked } = req.body;
    if (typeof blocked !== "boolean") {
      return res.status(400).json({ message: "blocked must be a boolean." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin accounts cannot be blocked." });
    }

    user.isBlocked = blocked;
    user.blockedAt = blocked ? new Date() : null;
    await user.save();

    res.json({
      message: blocked ? "User blocked successfully." : "User unblocked successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        blockedAt: user.blockedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
