import express from "express"
import {channel} from "../index.js"
import { createError } from "../utils/error.js";
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
export default router