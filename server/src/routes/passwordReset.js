import express from "express";
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();
    
    res.json({ 
      message: "Password reset link sent",
      resetToken: resetToken 
    });
    
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;