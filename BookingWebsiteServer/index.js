import express from "express"
import dotenv from "dotenv"
import authRoute from "./routes/auth.js" // authRoute la ten tu dat dat ntn cx dc
import usersRoute from "./routes/users.js" 
import hotelsRoute from "./routes/hotels.js" 
import roomsRoute from "./routes/roomTypes.js" 
import reservationRoute from "./routes/reservation.js"
import closedRoomRoute from "./routes/closedRoom.js"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import cors from "cors"
import paymentRoute from "./routes/payment.js"
import rabbitMQRoute from "./routes/rabbitmq.js"
import amqp from "amqplib"  // Import amqplib để kết nối RabbitMQ
import { Server } from "socket.io";
import http from "http";




const app = express()
// tạo server socket
const server = http.createServer(app); // Socket cần HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  })

dotenv.config()
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Connected to mongoDB.")
    } catch (error) {
        throw error;
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("mongoDB disconnected!")
})

// kết nối rabbitMQ
let channel, connection;
export { channel };
const connectRabbitMQ = async () => {
    // try {
    //     connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
    //     channel = await connection.createChannel();
    //     const queue = 'task_queue'; // Tên của queue
    //     await channel.assertQueue(queue, {
    //         durable: true, // Đảm bảo queue tồn tại sau khi RabbitMQ khởi động lại
    //     });
    //     console.log("Connected to RabbitMQ.");
    // } catch (error) {
    //     console.error("Failed to connect to RabbitMQ:", error);
    //     process.exit(1); // Dừng ứng dụng nếu không kết nối được RabbitMQ
    // }
};

// middleware
app.use(cors())
app.use(cookieParser()) // dung cookie
// de gui json dc
app.use(express.json())
// const checkOrigin = (req, res, next) => {
//     const forwardedHost = req.headers['x-forwarded-host'];
//     if (forwardedHost === 'localhost:3000') {
//         next();
//     } else {
//         res.status(403).send('Forbidden');
//     }
// };

// app.use(checkOrigin); // Apply the checkOrigin middleware to all routes
// su dung nhung duong dan nay se tiep tuc xu ly trong file routes
app.use("/api/auth", authRoute)
app.use("/api/users", usersRoute)
app.use("/api/hotels", hotelsRoute)
app.use("/api/rooms", roomsRoute)
app.use("/api/reservation", reservationRoute)
app.use("/api/closedRoom", closedRoomRoute)
app.use("/api/payment", paymentRoute)
app.use("/api/rabbitmq", rabbitMQRoute)



app.use((err,req,res,next)=>{
    const errorStatus = err.status || 500 
    const errorMessage = err.message || "Something went wrong"
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack,
    });
});
app.listen(8800, () => {
    connect()
    connectRabbitMQ()
    console.log("Connected to backend..")
});


