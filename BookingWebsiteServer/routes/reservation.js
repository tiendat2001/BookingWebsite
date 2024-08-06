import express from "express"
import { createReservation ,getReservationsByAdmin,updateReservation,deleteAllReservations,
    getAllHotelRevenue,getRevenueByHotelId,getRevenueMonthsByHotelId,getAllReservations,
    getReservationsByClient,paymentAccountLastMonth,sendEmailStatusReservation,deleteReservationById
} from "../controllers/reservation.js"
import { verifyAdmin,verifyUserModifyHotel,verifyToken } from "../utils/verifyToken.js";
const router = express.Router();

//CREATE verify token để truyền vào userId sẽ lấy từ id của token trong cookie của request
router.post("/",verifyToken, createReservation);

//GET
router.get("/admin",verifyToken,getReservationsByAdmin) // ListReservation
router.get("/client",verifyToken,getReservationsByClient) // listBooking

//postman
router.get("/getall",getAllReservations)

//PUT
router.put("/:id",verifyToken,updateReservation)


//DELETE ALL 
router.delete("/",deleteAllReservations)

router.delete("/:reservationId",deleteReservationById)

// doanh thu

// GET DOANH THU SO LIEU STATISTIC TUNG HOTEL
router.get("/getRevenue/:hotelId",verifyToken,getRevenueByHotelId)

// GET DOANH THU THEO THANG TUNG HOTEL - bieu do duong
router.get("/getRevenueByMonths/:hotelId",verifyToken,getRevenueMonthsByHotelId)

//ADMINISTRATOR
// GET ALL DOANH THU HOTEL CHO ADMINISTRATOR
router.get("/getAllRevenueHotel",verifyAdmin,getAllHotelRevenue)   // cho theem verifyAdmin de chi admin goi api dc

// TIỀN CẦN THANH TOÁN CHO TÀI KHOẢN THÁNG TRC
router.get("/getAllPaymentAccount",verifyAdmin,paymentAccountLastMonth)   // cho theem verifyAdmin de chi admin goi api dc

// SEND EMAIL
router.put("/email/sendEmailStatusReservation",sendEmailStatusReservation)   // cho theem verifyAdmin de chi admin goi api dc

export default router