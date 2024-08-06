import express from "express"
import Hotel from "../models/Hotel.js" // phai co .js
import {createHotel, deleteHotel,getHotelById,  getHotels, updateHotel,countByCity,countByType ,getHotelsByAdmin} from "../controllers/hotel.js";
import { verifyAdmin, verifyUser,verifyToken,verifyUserModifyHotel } from "../utils/verifyToken.js";

const router = express.Router()
//CREATE
router.post("/",verifyToken,createHotel);
//UPDATE
router.put("/:id",verifyToken, updateHotel); 
//DELETE
router.delete("/:id",verifyToken,deleteHotel);
//GET
router.get("/find/:id", getHotelById);
//GETALL hoặc get theo condition (cho client)
router.get("/", getHotels);

// GET NHỮNG HOTEL LÀ CỦA MÌNH (CHO BÊN ADMIN-NGƯỜI BÁN)
router.get("/getByAdmin",verifyToken, getHotelsByAdmin);

router.get("/countByCity", countByCity); // để ý api này sẽ bị nhầm với api get by id nếu ở trên ko ghi thêm chữ find

router.get("/countByType", countByType); // để ý api này sẽ bị nhầm với api get by id nếu ở trên ko ghi thêm chữ find

// lấy danh sách type room trong hotel theo hotel id
// router.get("/room/:id",getHotelRoomsType)
export default router