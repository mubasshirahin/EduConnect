import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

// Get all blogs
router.get("/", async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    next(error);
  }
});

// Create a new blog
router.post("/", async (req, res, next) => {
  try {
    const { title, content, author, authorEmail, tags } = req.body;
    if (!title || !content || !author || !authorEmail) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const blog = await Blog.create({ title, content, author, authorEmail, tags });
    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
});

export default router;