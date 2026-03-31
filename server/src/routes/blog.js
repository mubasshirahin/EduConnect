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

const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server configuration error." });
    }

    try {
      const payload = jwt.verify(token, secret);
      const user = await User.findById(payload.sub);
      if (user && !user.isBlocked) {
        req.user = user;
      }
    } catch (error) {
      // ignore invalid token for optional authentication
    }

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

// Rate a blog post (authenticated users only, not the author)
router.post('/:id/rate', authenticate, async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const { rating } = req.body;

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found.' });
    }

    if (blog.authorEmail && req.user.email && blog.authorEmail.toLowerCase() === req.user.email.toLowerCase()) {
      return res.status(403).json({ message: 'You cannot rate your own blog post.' });
    }

    const existing = blog.ratings.find((r) => r.userId.equals(req.user._id));
    if (existing) {
      existing.rating = rating;
    } else {
      blog.ratings.push({
        userId: req.user._id,
        email: req.user.email,
        rating,
      });
    }

    await blog.save();

    res.json(blog);
  } catch (error) {
    next(error);
  }
});

// Add a comment to a blog (everyone allowed, auth optional)
router.post('/:id/comments', optionalAuthenticate, async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    const comment = {
      authorId: req.user ? req.user._id : undefined,
      authorName: req.user ? req.user.name : 'Anonymous',
      authorEmail: req.user ? req.user.email : undefined,
      content: content.trim(),
      createdAt: new Date(),
      replies: [],
    };

    blog.comments.push(comment);
    await blog.save();

    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
});

// Add a reply to a comment in a blog (everyone allowed, auth optional)
router.post('/:id/comments/:commentId/replies', optionalAuthenticate, async (req, res, next) => {
  try {
    const { id: blogId, commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Reply content is required.' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const reply = {
      authorId: req.user ? req.user._id : undefined,
      authorName: req.user ? req.user.name : 'Anonymous',
      authorEmail: req.user ? req.user.email : undefined,
      content: content.trim(),
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await blog.save();

    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
});

export default router;