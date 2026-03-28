import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const role = req.body.role?.trim().toLowerCase();

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }
    if (!["teacher", "student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be teacher, student, or admin." });
    }
    if (role === "admin") {
      return res.status(403).json({ message: "Admin registration is disabled." });
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
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const role = req.body.role?.trim().toLowerCase();

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required." });
    }
    if (!["teacher", "student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be teacher, student, or admin." });
    }
    if (role === "admin") {
      const adminAccountsRaw = process.env.ADMIN_ACCOUNTS;
      if (!adminAccountsRaw) {
        return res.status(500).json({ message: "ADMIN_ACCOUNTS is missing in .env." });
      }
      const pairs = adminAccountsRaw.split(",").map((entry) => entry.trim());
      const match = pairs.find((entry) => {
        const [accEmail, accPass] = entry.split(":");
        return accEmail?.toLowerCase() === email.toLowerCase() && accPass === password;
      });
      if (!match) {
        return res.status(403).json({ message: "Invalid admin credentials." });
      }
      let adminUser = await User.findOne({ email: email.toLowerCase() });
      if (!adminUser) {
        adminUser = await User.create({
          name: email.split("@")[0],
          email,
          passwordHash: await bcrypt.hash(password, 12),
          role: "admin",
        });
      }
      if (adminUser.isBlocked) {
        return res.status(403).json({ message: "Account is blocked." });
      }
      const token = createToken(adminUser._id);
      return res.status(200).json({
        message: "Login successful.",
        token,
        user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role },
      });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== role) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked." });
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

// Forgot Password - Request reset link
router.post("/forgot-password", async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with that email." });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // For now, return the token (in production you would send an email)
    res.json({ 
      message: "Password reset link sent. Use this token to reset your password.",
      resetToken: resetToken
    });
    
  } catch (error) {
    return next(error);
  }
});

// Reset Password - Set new password
router.post("/reset-password", async (req, res, next) => {
  try {
    const token = req.body.token?.trim();
    const newPassword = req.body.newPassword;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.json({ message: "Password has been reset successfully." });
    
  } catch (error) {
    return next(error);
  }
});

export default router;
