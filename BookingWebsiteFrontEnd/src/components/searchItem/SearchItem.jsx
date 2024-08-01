import { Link } from "react-router-dom";
import "./searchItem.css";
import React from "react";
import { SearchContext } from "../../context/SearchContext";
import { useState, useContext } from "react";
import useFetch from "../../hooks/useFetch";
import { getDatesInRange } from "../../function"
// nhung HOTEL hien tren thanh search
const SearchItem = ({ item }) => {
  const { dates, options } = useContext(SearchContext);
  const [roomInSearchItem, setroomInSearchItem] = useState(1);
  // lấy ra các loại phòng của hotel này
  const { data: allTypeRoom, loading, error, reFetch } = useFetch(`/rooms/${item._id}/?status=true`);
  // console.log(allTypeRoom)
  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  function dayDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
    return diffDays;
  }

  // tính toán để hiển thị giá và option theo lựa chọn người dùng - theo phòng rẻ nhất của hotel đấy
  const days = dayDifference(dates[0].endDate, dates[0].startDate);
  const calculatePrice = (cheapestPrice) => {
    let totalPrice = 0;
    let totalPeople = parseInt(options.adult, 10) + parseFloat(options.children) * 0.5; // trẻ em tính 0.5
    // nếu người dùng có lựa chọn số phòng , totalPeople / cheapestPrice.people để tính số phòng có thể chứa đc totalPeople.
    // Math floor làm tròn xuống số nguyên gần nhất 1.2 =>1
    if (options.room > Math.floor(totalPeople / cheapestPrice.people)) {
      totalPrice = cheapestPrice.price * options.room * days;
    } else
      // nếu số người người dùng chọn ít hơn so với sức chứa của phòng rẻ nhất (VD: chọn 1 người mà phòng rẻ nhất hotel đó chứa 2 người)
      if (Math.floor(totalPeople / cheapestPrice.people) == 0) {
        totalPrice = cheapestPrice.price * days;
      } else {
        totalPrice = cheapestPrice.price * Math.floor(totalPeople / cheapestPrice.people) * days;
      }
    // nhân 1000 chỉ là để hiển thị, còn lọc giá ở trang list ko nhân 1000
    return Intl.NumberFormat('vi-VN').format(totalPrice * 1000)

  };

  const calculateRoom = (cheapestPrice) => {
    let totalPeople = parseInt(options.adult, 10) + parseFloat(options.children) * 0.5;
    // nếu số phòng người dùng chọn nhiều hơn phòng có thể chứa totalPeople thì tính theo options.room đó
    if (options.room > Math.floor(totalPeople / cheapestPrice.people)) return options.room
    // tính số phòng theo Math.floor(totalPeople / cheapestPrice.people)
    else {
      // VD:11/5=2
      return Math.floor(totalPeople / cheapestPrice.people)
    }
  };

  const alldates = getDatesInRange(dates[0].startDate, dates[0].endDate);
  const isAvailable = (roomNumber, dateToCheck) => {
    // if (!roomNumber.status) {
    //   return false; // Nếu status là false, room không khả dụng
    // }
    const isFound = roomNumber.unavailableDates.some((date) => {
      const dateMinusOneDay = new Date(date).getTime(); // theem getTIme() hay ko cung v
      // console.log(new Date(dateMinusOneDay));
      return dateToCheck == dateMinusOneDay;
    });

    return !isFound;
  };
  // console.log(alldates)
  // tính tổng phòng available của mỗi loại phòng
  const calculateAvailableRoomsEveryTypeRoom = (roomNumbers) => {
    let roomAvailable = 999;
    for (let date of alldates) {
      let dateAvailableCount = 0;
      //Với mỗi date, duyệt qua các phần tử trong mảng roomNumbers
      for (let roomNumber of roomNumbers) {
        // Kiểm tra xem phòng đó có date hiện tại trống ko
        if (isAvailable(roomNumber, date)) {
          // có phòng thỏa mãn date hiện tại
          dateAvailableCount++
        }
      };
      // với mỗi date sau khi lặp hết các room nhỏ, cập nhật roomAvailable (roomAvailable sẽ là 
      // dateAvailableCount nhỏ nhất trong tất cả các date )
      if (dateAvailableCount < roomAvailable) {
        roomAvailable = dateAvailableCount
      }
     
    }
    return roomAvailable
  }
   // tính tổng phòng avalaible của hotel đó
  const caculateTotalRoomsAvailable = () => {
    let totalRooms = 0;
    totalRooms = allTypeRoom.reduce((total, typeRoom) => {
      // Với mỗi loại phòng tính toán số phòng available của loại phòng đó, truyền vào roomNumbers
      const availableRooms = calculateAvailableRoomsEveryTypeRoom(typeRoom.roomNumbers)
      // Thêm số lượng phòng từ typeRoom vào tổng số lượng phòng
      return total + availableRooms;
    }, 0);
    return totalRooms
  }
  // tính tổng phòng avalaible của hotel đó
  const totalRooms = caculateTotalRoomsAvailable()
  // nếu hết phòng thì ko hiện hotel đó
  if (totalRooms === 0) {
    return null;
  }
  return (
    <div className="searchItem">
      <img src={item.photos[0]} alt="" className="siImg" />

      <div className="siDesc">
        <h1 className="siTitle">{item.name}</h1>
        <span className="siDistance">Khoảng cách: {item.distance}m từ trung tâm</span>
        { totalRooms == 0 ? (
          <span className="siRoomLeft">Hết phòng!</span>
        ) : (
          totalRooms && (totalRooms < 6 || totalRooms < calculateRoom(item.cheapestPrice)) && (
            <span className="siRoomLeft">Chỉ còn {totalRooms} phòng!</span>
          )
        )}
        {/* <span className="siFeatures">{item.desc}</span> */}
        {/* <span className="siCancelOp">Free cancellation </span>
        <span className="siCancelOpSubtitle">
          You can cancel later, so lock in this great price today!
        </span> */}
        <span className="siFeatures">Địa chỉ: {item.address}</span>
        <span className="siFacilities">
          {item.facilities?.map((facility, index) => (
            <div className="siFacilities_item" style={{ width: '30%' }} key={index}>
              {facility}
            </div>
          ))}
        </span>
      </div>

      <div className="siDetails">
        {/* {item.rating && <div className="siRating">
          <span>Excellent</span>
          <button>{item.rating}</button>
        </div>} */}

        <div className="siDetailTexts">
          <span className="siPrice">Giá từ: {calculatePrice(item.cheapestPrice)} VND</span>
          <span className="siTaxOp">Cho {options.adult} người, {options.children > 0 && `, ${options.children} trẻ em`}, {calculateRoom(item.cheapestPrice)} phòng, {days} đêm</span>
          {/* chuyen sang xem thong tin tung hotel */}

          <Link to={`/hotels/${item._id}`}>
            <button className="siCheckButton">Xem chỗ trống</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchItem;
