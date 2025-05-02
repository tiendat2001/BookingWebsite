import express from "express"
import {channel, io} from "../index.js"
import { createError } from "../utils/error.js";
import { verifyAdmin,verifyUserModifyHotel,verifyToken } from "../utils/verifyToken.js";
import User from "../models/User.js"

const router = express.Router()

router.post("/send-message", async (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    return next(createError(400, "Message is required"));
  }

  try {
    if (!channel) {
      return next(createError(500, "RabbitMQ channel is not ready"));
    }

    const queue = "task_queue";

    channel.sendToQueue(queue, Buffer.from(message), {
      persistent: true,
    });

    console.log("Sent message to RabbitMQ:", message);

    return res.status(200).json({ success: true, message: "Message sent to RabbitMQ" });
  } catch (err) {
    console.error("Error sending message to RabbitMQ:", err);
    return next(createError(500, "Failed to send message to RabbitMQ"));
  }
});

router.post("/notify", async (req, res, next) => {
  io.to(req.body.socketId).emit("notification", req.body.message);
  res.status(200).json({ success: true, message: "Notification sent!" });
});

router.post("/connect-socket",verifyToken, async (req, res, next) => {
  try {
    const { socketId } = req.body;

    if (!socketId) {
        return res.status(400).json({ message: "socketId is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { socketId: socketId }, // Chỉ cập nhật socketId
        { new: true }
    );

    res.status(200).json(socketId);
} catch (err) {
    next(err);
}
});


export default router