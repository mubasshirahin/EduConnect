import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const createToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error("JWT_SECRET is missing in .env");
    error.status = 500;
    throw error;
  }
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
};

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }
    if (!["teacher", "student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be teacher, student, or admin." });
    }
    if (role === "admin") {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        return res.status(500).json({ message: "ADMIN_EMAIL is missing in .env." });
      }
      if (adminEmail.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({ message: "This email is not allowed to register as admin." });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role });
    const token = createToken(user._id);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required." });
    }
    if (!["teacher", "student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be teacher, student, or admin." });
    }
    if (role === "admin") {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        return res.status(500).json({ message: "ADMIN_EMAIL is missing in .env." });
      }
      if (adminEmail.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({ message: "This email is not allowed to login as admin." });
      }
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== role) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
