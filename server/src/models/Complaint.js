import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true, trim: true },
    authorEmail: { type: String, required: true, trim: true, lowercase: true },
    authorRole: { type: String, required: true, enum: ["teacher", "student"] },
    subject: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
