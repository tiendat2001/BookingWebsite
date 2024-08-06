import Hotel from "../models/Hotel.js"
import Room from "../models/RoomType.js";
import Reservation from "../models/Reservation.js";
import axios from 'axios';
// viet xu ly khi goi api
export const createHotel = async (req, res, next) => {
  req.body.ownerId = req.user.id;
  const newHotel = new Hotel(req.body)

  try {
    const savedHotel = await newHotel.save()
    res.status(200).json(savedHotel)
  } catch (err) {
    next(err)
  }
}

export const updateHotel = async (req, res, next) => {
  try {
    const hotelToUpdate = await Hotel.findById(req.params.id);

    // Kiểm tra nếu không tìm thấy Hotel
    if (!hotelToUpdate) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    // console.log(req.body.ownerId)
    // Kiểm tra xem ownerId của Hotel cần cập nhật có trùng khớp với id trong req.user lấy từ token không
    if (hotelToUpdate.ownerId != req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this hotel" });
    }

    // Nếu ownerId khớp, thì tiến hành cập nhật
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedHotel);
  } catch (err) {
    next(err)
  }
}
export const deleteHotel = async (req, res, next) => {
  // chua test
  try {
    const hotelToDelete = await Hotel.findById(req.params.id);
    // Kiểm tra nếu không tìm thấy Hotel
    if (!hotelToDelete) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    // console.log(req.body.ownerId)
    // Kiểm tra xem ownerId của Hotel cần xóa có trùng khớp với ownerId trong req.body.ownerId không (lúc đẩy lên phải đẩy id tk)
    if (hotelToDelete.ownerId != req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this hotel" });
    }

    // Nếu ownerId khớp hoặc người dùng là admin, tiến hành xóa Hotel
    await Hotel.findByIdAndDelete(req.params.id);
    await Room.deleteMany({ hotelId: req.params.id });
    await Reservation.deleteMany({ hotelId: req.params.id });
    res.status(200).json("Hotel has been deleted.");
  } catch (err) {
    next(err)
  }
}
export const getHotels = async (req, res, next) => {
  const { name, city, type, ...others } = req.query;
  try {
    const query = {
      ...others,

    };

    if (name && name !== '') {
      query.name = { $regex: name, $options: 'i' };
    }

    if (city && city !== '') {
      query.city = city.trim()
    }
    if (type && type !== '') { // Kiểm tra và thêm type vào query nếu không rỗng, nếu rỗng thì coi như ko có và lấy tất cả
      query.type = type;
    }
    const hotels = await Hotel.aggregate([
      { $match: query }, // Lọc dựa trên điều kiện query nếu cần
      { $sample: { size: 30 } } // Lấy mẫu ngẫu nhiên với số lượng giới hạn
    ]);
    // const hotels = await Hotel.find

    // thêm tổng số phòng có của hotel này
    const hotelsWithRoomsPromises = hotels.map(async (hotel) => {
      try {
        const response = await axios.get(`http://localhost:8800/api/rooms/${hotel._id}/?status=true`);
        hotel.totalRooms = response.data.reduce((total, room) => total + room.roomNumbers.length, 0);
      } catch (error) {
        console.error(`Failed to fetch rooms for hotel ${hotel._id}:`, error);
        hotel.totalRooms = 0; // Default to 0 if the API call fails
      }
      return hotel;
    });

    // Wait for all promises to resolve
    const hotelsWithRooms = await Promise.all(hotelsWithRoomsPromises);

    res.status(200).json(hotelsWithRooms);
  } catch (err) {
    next(err);
  }

}

// GET NHỮNG HOTEL CỦA MÌNH CHO ADMIN
export const getHotelsByAdmin = async (req, res, next) => {
  try {
    const hotels = await Hotel.find(
      { ownerId: req.user.id }
    );
    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }

}
export const getHotelById = async (req, res, next) => {
  try {
    const hotelById = await Hotel.findById(req.params.id) // thong tin lay tu body cua req
    res.status(200).json(hotelById)
  } catch (err) {
    res.status(500).json(error)
  }
}

export const countByCity = async (req, res, next) => {
  // // truy cap vao param trong api (?hotel=), dung req.query, trừ khi api đc định nghĩa tham số sẵn, kiểu :id, thì dùng req.params
  // const cities = req.query.cities.split(",")
  // try {
  //     const list = await Promise.all(cities.map(city => {
  //         return Hotel.countDocuments({city:city})
  //     }))
  //     res.status(200).json(list);
  // } catch (err) {
  //     next(err)
  // }

  try {
    const cityCounts = await Hotel.aggregate([
      {
        $group: {
          _id: '$city', // Group by city
          count: { $sum: 1 }, // Count number of hotels in each city
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field from the result
          city: '$_id', // Rename _id to city
          quantity: '$count', // Rename count to quantity
        },
      },
      {
        $sort: { quantity: -1 } // Sort by quantity in descending order
      }
    ]);

    res.status(200).json(cityCounts); // Return the result
  } catch (error) {
    next(error); // Pass any errors to the error handling middleware
  }
}

export const countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotel.countDocuments({ type: "Khách sạn" });
    const apartmentCount = await Hotel.countDocuments({ type: "Căn hộ" });
    const resortCount = await Hotel.countDocuments({ type: "Resort" });
    const villaCount = await Hotel.countDocuments({ type: "Biệt thự" });
    const cabinCount = await Hotel.countDocuments({ type: "cabin" });

    res.status(200).json([
      { type: "Khách sạn", count: hotelCount },
      { type: "Căn hộ", count: apartmentCount },
      { type: "Resort", count: resortCount },
      { type: "Biệt thự", count: villaCount },
      { type: "cabins", count: cabinCount },
    ]);
  } catch (err) {
    next(err);
  }
};

// bỏ đi?
// export const getHotelRoomsType = async (req, res, next) => {
//   try {
//     const hotel = await Hotel.findById(req.params.id);
//     const list = await Promise.all(
//       //   room ở đây là roomId
//       hotel.rooms.map((room) => {
//         return Room.findById(room);
//       })
//     );
//     res.status(200).json(list)
//   } catch (err) {
//     next(err);
//   }
// };

