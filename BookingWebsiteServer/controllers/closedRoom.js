import ClosedRoom from "../models/ClosedRoom.js";
import Hotel from "../models/Hotel.js"
import Room from "../models/RoomType.js";
import multer from 'multer';
import FormData from 'form-data';
import axios from "axios";
export const createClosedRoom = async (req, res, next) => {
  try {
    const roomTypeUpdated = await Room.findById(req.params.roomTypeId)  // req.params.roomTypeId là _id của type room sẽ chỉnh sửa
    // tìm id của hotel có room sẽ chỉnh sửa
    const hotelToUpdate = await Hotel.findById(roomTypeUpdated.hotelId);
    if (hotelToUpdate.ownerId != req.user.id) {
      return res.status(403).json({ message: "You are not authorized to change this room type" });
    }

    req.body.ownerId = req.user.id; // Thêm ownerId từ req.user.id
    const newClosedRoom = new ClosedRoom(req.body)
    const savedClosedRoom = await newClosedRoom.save()
    res.status(200).json(savedClosedRoom)
  } catch (err) {
    next(err)
  }
  // console.log("d")
}
// TEST POSTMAN
export const getAllClosedRoom = async (req, res, next) => {
  try {
    // Sử dụng phương thức find() để lấy tất cả các bản ghi của model ClosedRoom
    const closedRooms = await ClosedRoom.find();

    // Trả về danh sách các phòng đã đóng
    res.status(200).json(closedRooms);
  } catch (err) {
    next(err);
  }
}

export const getAllClosedRoomByRoomTypeId = async (req, res, next) => {
  try {
    // Sử dụng phương thức find() để lấy tất cả các bản ghi của model ClosedRoom
    const closedRooms = await ClosedRoom.find({
      ownerId: req.user.id,
      roomTypeId: req.params.roomTypeId
    });

    // Trả về danh sách các phòng đã đóng
    res.status(200).json(closedRooms);
  } catch (err) {
    next(err);
  }
}

// DELETE ALL CLOSE ROOM
export const deleteAllClosedRoom = async (req, res, next) => {
  try {
    await ClosedRoom.deleteMany();
    // Trả về thông báo thành công
    res.status(200).json({ success: true, message: 'All closed rooms deleted successfully' });
  } catch (error) {
    // Nếu có lỗi, truyền lỗi đó cho middleware error handling
    next(error);
  }
}

// DELETE CLOSE ROOM BY ID
export const deleteClosedRoomById = async (req, res, next) => {
  try {
    await ClosedRoom.findByIdAndDelete(req.params.id);
    res.status(200).json("DELETE SUCCESSFUL");
  } catch (error) {
    throw error;
  }
}






/// phần test


let testAPILocks = {}; // Lưu trữ biến khóa cho mỗi giá trị id

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const uploadImageCloudinary = async (req, res, next) => {
  try {
    //   const id = req.params.id;

    //   // Kiểm tra xem có yêu cầu khác đang được xử lý với cùng giá trị id không
    //   while (testAPILocks[id]) {
    //       // Chờ 1 giây trước khi kiểm tra lại
    //       await delay(1000); // Chờ 1 giây
    //   }

    //   // Đặt biến khóa để đánh dấu rằng yêu cầu với giá trị id này đang được thực thi
    //   testAPILocks[id] = true;

    //   // Sử dụng hàm setTimeout để tạm dừng việc thực hiện trong 5 giây
    //   setTimeout(() => {
    //       // Sau 5 giây, trả về kết quả "kết thúc"
    //       console.log("dat")
    //       res.status(200).json("kết thúc");

    //       // Giải phóng biến khóa sau khi hoàn thành
    //       delete testAPILocks[id];
    //   }, 10000); // 5 giây = 5000 milliseconds

    try {
      const file = req.file;
      // if (!file) {
      //   return res.status(400).send('No file uploaded.');
      // }       
      const data = new FormData();
      data.append('file', file.buffer, file.originalname);
      data.append('upload_preset', 'upload');
      const uploadRes = await axios.post(
        'https://api.cloudinary.com/v1_1/tiendat2001/image/upload',
        data,
        {
          headers: {
            ...data.getHeaders()
          }
        }
      );

      const { url } = uploadRes.data;
      res.json({ url });
    } catch (error) {
      console.error(error);
      next(error);
    }
  } catch (error) {
    // Nếu có lỗi xảy ra, giải phóng biến khóa và chuyển giao cho middleware xử lý lỗi
    next(error);
  }
};
// Hàm delay chờ 1 giây
