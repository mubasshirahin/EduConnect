import express from "express";
import jwt from "jsonwebtoken";
import Blog from "../models/Blog.js";
import User from "../models/User.js";

const router = express.Router();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required." });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server configuration error." });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "Invalid user." });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked." });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Get all blogs
router.get("/", async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    next(error);
  }
});

// Create a new blog (authenticated users only)
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    if (!["teacher", "student"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only students or teachers can submit blog posts." });
    }

    const author = req.user.name;
    const authorEmail = req.user.email;
    const authorRole = req.user.role;

    const blog = await Blog.create({
      title,
      content,
      author,
      authorRole,
      authorEmail,
      tags,
    });

    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
});

export default router;