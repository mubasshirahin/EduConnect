import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true, trim: true },
    authorRole: { type: String, enum: ["student", "teacher"], default: "student" },
    authorEmail: { type: String, required: true, trim: true, lowercase: true },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    tags: [{ type: String }],
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        email: { type: String, required: true, lowercase: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);