import express from "express"
import { createRoom, deleteRoom, getRoomsByHotelId, getRooms, updateRoom, updateRoomAvailability,
    getRoomById,cancelRoomReservation,statusRoomCount, addRoomToRoomType, deleteRoomInRoomType,changeStatusRoomInRoomType} from "../controllers/roomtype.js";
import { verifyAdmin,verifyUserModifyHotel,verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

//CREATE
router.post("/:hotelid", verifyToken, createRoom);
//UPDATE avai khi đặt phòng, hủy/đóng phòng
router.put("/availability/",verifyToken, updateRoomAvailability);

router.put("/cancelAvailability/:id", cancelRoomReservation); // id ở đây là id của typeRoom phòng lớn



// UPDATE ROOM
router.put("/:id", verifyToken, updateRoom);
// THÊM PHÒNG NHỎ VÀO LOẠI PHÒNG
router.put("/addRoomToRoomType/:roomId",verifyToken, addRoomToRoomType);
// XÓA PHÒNG NHỎ
router.put("/deleteRoomInRoomType/:roomId",verifyToken, deleteRoomInRoomType);
// CHỈNH STATUS PHÒNG NHỎ
router.put("/changeStatusRoomInRoomType/:roomId",verifyToken, changeStatusRoomInRoomType);


//DELETE ROOM
router.delete("/:id", verifyToken, deleteRoom);
//GET ROOM TYPE BY HOTEL ID
router.get("/:hotelId", getRoomsByHotelId);

//GET ROOM BY ROOM ID
router.get("/find/:roomid", getRoomById);

//GETALL
router.get("/", getRooms);

// GET STATUS ROOM NEXT 30 DAYS
router.get("/statusRoomCount/:roomId",statusRoomCount)




export default router