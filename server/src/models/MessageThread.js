import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, trim: true, lowercase: true },
    to: { type: String, required: true, trim: true, lowercase: true },
    text: { type: String, required: true, trim: true },
    tuitionRequest: {
      requestId: { type: String, trim: true, index: true },
      subject: { type: String, trim: true, default: "" },
      classLevel: { type: String, trim: true, default: "" },
      medium: { type: String, trim: true, default: "" },
      location: { type: String, trim: true, default: "" },
      landmark: { type: String, trim: true, default: "" },
      schedule: { type: String, trim: true, default: "" },
      budget: { type: String, trim: true, default: "" },
      details: { type: String, trim: true, default: "" },
      studentEmail: { type: String, trim: true, lowercase: true, default: "" },
      studentName: { type: String, trim: true, default: "" },
      status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
      },
      acceptedAt: { type: Date },
      acceptedBy: { type: String, trim: true, lowercase: true },
      acceptedByName: { type: String, trim: true },
      jobId: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

const threadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    participants: [{ type: String, required: true, trim: true, lowercase: true }],
    participantNames: { type: Map, of: String },
    messages: [messageSchema],
  },
  { timestamps: true }
);

threadSchema.index({ participants: 1 });

export default mongoose.model("MessageThread", threadSchema);
