import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, trim: true, lowercase: true },
    to: { type: String, required: true, trim: true, lowercase: true },
    text: { type: String, required: true, trim: true },
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
