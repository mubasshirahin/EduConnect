import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    subject: { type: String, trim: true, default: "" },
    classLevel: { type: String, trim: true, default: "" },
    schedule: { type: String, required: true, trim: true },
    rate: { type: String, required: true, trim: true },
    postedBy: { type: String, required: true, trim: true },
    postedByEmail: { type: String, required: true, trim: true, lowercase: true },
    studentEmail: { type: String, trim: true, lowercase: true, default: "" },
    studentName: { type: String, trim: true, default: "" },
    tuitionRequestId: { type: String, trim: true, index: true, default: "" },
    sourceThreadId: { type: String, trim: true, default: "" },
    sourceMessageId: { type: String, trim: true, default: "" },
    applicants: [
      {
        email: { type: String, required: true, trim: true, lowercase: true },
        name: { type: String, required: true, trim: true },
        appliedAt: { type: Date, default: Date.now },
        status: { 
          type: String, 
          enum: ["pending", "shortlisted", "rejected", "hired"],
          default: "pending"
        }
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
