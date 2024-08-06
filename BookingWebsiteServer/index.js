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


const app = express()


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
    console.log("Connected to backend..")
});


