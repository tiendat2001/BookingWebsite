import React from 'react'
import axios from "axios";
import { AuthContext } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import "./listRoomClient.css"
import { useContext, useState, useEffect } from "react";
import { SearchContext } from '../../context/SearchContext';
import { format, addDays, subDays, addHours } from "date-fns";
import { DateRange } from "react-date-range";
import {
  faBed,
  faCalendarDays,
  faPerson,
} from "@fortawesome/free-solid-svg-icons";
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faCircleXmark,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const ListRoomClient = ({ hotelId, hotelType }) => {
  const timeZone = new Date().getTimezoneOffset() / 60  // độ lệch múi giờ so với UTC của máy hiện tại
  // các room type đang hoạt động của chỗ nghỉ hiện tại
  const { data, loading, error, reFetch } = useFetch(`/rooms/${hotelId}/?status=true`);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const searchContext = useContext(SearchContext);
  const [dates, setDates] = useState(searchContext.dates);
  // dates[0].startDate.setHours(14, 0, 0, 0);
  // dates[0].endDate.setHours(14, 0, 0, 0);
  const [options, setOptions] = useState(searchContext.options);
  const [destination, setDestination] = useState(searchContext.destination);
  const [openDate, setOpenDate] = useState(false);
  // const [expandedPhotoIndex, setExpandedPhotoIndex] = useState(null); // State để lưu index của ảnh đang được phóng to
  const [openExpandPhoto, setOpenExpandPhoto] = useState(false);
  const [slideNumber, setSlideNumber] = useState(0);
  const [indexItem, setIndexItem] = useState(0);
  const { dispatch } = useContext(SearchContext);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [key, setKey] = useState(Math.random());
  const selectedRoomDetais = [];
  const { user } = useContext(AuthContext)
  // gía tổng hóa đơn tạm thời
  const [totalPriceReservation, setTotalPriceReservation] = useState(0);
  // console.log(dates)
  // var totalRoomQuantitySelected = 0;
  const navigate = useNavigate()

  useEffect(() => {
    dispatch({ type: "NEW_SEARCH", payload: { destination, dates, options } });
  }, [destination, dates, options]);

  // console.log(dates)
  const handleOpen = (i, indexItem) => {
    setSlideNumber(i);       // set vị trí ảnh trong mảng data[index].photos
    setIndexItem(indexItem)  // set vị trí phần tử data (tức từng roomType mà người dùng click vào)
    setOpenExpandPhoto(true); // để mở slider ảnh phóng to
  };

  const handleMove = (direction, item) => { // item chính là data[index], là thông tin room-room chứa ảnh người dùng c
    let newSlideNumber;

    if (direction === "l") {
      newSlideNumber = slideNumber === 0 ? (item.photos.length - 1) : slideNumber - 1;
    } else {
      newSlideNumber = slideNumber === (item.photos.length - 1) ? 0 : slideNumber + 1;
    }

    setSlideNumber(newSlideNumber);
  };
  // const toggleExpandedPhoto = (index) => {
  //   setExpandedPhotoIndex(index === expandedPhotoIndex ? null : index);
  // };
  // ng dùng thay đổi khoảng ngày
  const handleDayChange = (item) => {
    const utc = new Date().getTimezoneOffset() / 60 //-7
    const newSelection = { ...item.selection };
    let { startDate, endDate } = newSelection;
    if (startDate === endDate) {
      // nếu người dùng chỉ chọn 1 ngày
      endDate = addDays(new Date(startDate), 1);
    }
    // 14+ getTimezoneOffset Múi giờ lệch ở khách sạn mà nó đặt 
    startDate = addHours(startDate, 7 - utc);
    endDate = addHours(endDate, 7 - utc);
    setDates([{ ...newSelection, startDate, endDate }]);
    setSelectedRoomIds([])
    setKey(Math.random()); // Bắt reload lại phần chọn phòng
    setTotalPriceReservation(0)
    reFetch()
  };

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  function dayDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
    return diffDays;
  }

  const days = dayDifference(dates[0].endDate, dates[0].startDate);

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const date = new Date(start.getTime());
    const dates = [];
    while (date < end) {
      dates.push(new Date(date).getTime());
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  // lựa chọn của khach
  const alldates = getDatesInRange(dates[0].startDate, dates[0].endDate);
  // alldates.forEach(timestamp => {
  //   const date = new Date(timestamp);
  //   console.log(date.toLocaleDateString());
  // });

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

  // thay đổi số lượng
  const handleSelectChange = (event, roomNumbers) => {
    let roomQuantitySelected = 0;
    data.forEach((dataItem) => {
      // Lấy giá trị được chọn từ <select> tương ứng với item hiện tại
      const selectedValue = parseInt(document.getElementById(`select_${dataItem._id}`).value);
      roomQuantitySelected = roomQuantitySelected + selectedValue;
    });
    // console.log("Tổng Số lượng phòng đã chọn:", roomQuantitySelected);
    const updatedSelectedRooms = selectedRoomIds;

    let updatedSelectedRoomsCopy = [...updatedSelectedRooms];
    // Duyệt qua mỗi phần tử trong mảng roomNumbers
    roomNumbers.forEach(room => {
      // Kiểm tra xem _id của phần tử hiện tại có tồn tại trong mảng updatedSelectedRooms không
      const index = updatedSelectedRoomsCopy.findIndex(selectedRoom => selectedRoom === room._id);
      // Nếu có tồn tại, loại bỏ phần tử đó khỏi mảng updatedSelectedRoomsCopy
      if (index !== -1) {
        updatedSelectedRoomsCopy.splice(index, 1);
      }
    });

    roomNumbers.forEach((roomNumber) => {
      if (isAvailable(roomNumber) && updatedSelectedRoomsCopy.length < roomQuantitySelected) {
        updatedSelectedRoomsCopy.push(roomNumber._id);
      }
    });

    setSelectedRoomIds(updatedSelectedRoomsCopy);

    // ghi tổng hóa đơn hiện tại
    let totalPrice = 0;
    updatedSelectedRoomsCopy.forEach(roomId => {
      // với mỗi _id phòng nhỏ thì tìm typeRoom tương ứng
      const room = data.find(room => room.roomNumbers.some(rn => rn._id == roomId));
      if (room) {
        totalPrice = totalPrice + room.price
      }
    });
    // giá hóa đơn theo lựa chọn hiện tại ng dùng
    totalPrice = totalPrice* alldates.length
    setTotalPriceReservation(totalPrice)
  };
  // console.log("Giá hiện tại:", totalPriceReservation * alldates.length);

  // hàm nút đặt phòng
  const reserveRoom = async () => {
    //check xem đăng nhập chưa
    if (!user.username) {
      navigate("/login")
      return;
    }

    // Lặp qua từng item trong data-là list những loại phòng, lấy ra những loại phòng mà người dùng chọn
    data.forEach((item) => {
      const selectedValue = parseInt(document.getElementById(`select_${item._id}`).value);
      // Kiểm tra nếu số lượng phòng đã chọn khác 0
      if (selectedValue !== 0) {
        // Thêm đối tượng vào mảng selectedRoomDetais, mảng này để sử dụng cho bên reserve
        selectedRoomDetais.push({ roomTypeId: item._id, typeRoom: item.title, quantity: selectedValue });
      }

    });
    // seletedRoomIdsReserved gồm roomtype id, roomtype name, quantity, còn selectedRoomIds gồm id những phòng nhỏ
    if (selectedRoomIds.length > 0 && alldates.length >= 1) {
      navigate("/reserve", {
        state: {
          selectedRoomIds, alldates, hotelId, startDate: dates[0].startDate, endDate: dates[0].endDate,
          seletedRoomIdsReserved: selectedRoomDetais
        }
      });
      //seletedRoomIdsReserved là mảng để truyền vào reserve xử lý tìm id sau
    } else {
      toast.error('Bạn chưa chọn phòng muốn đặt hoặc ngày bạn chọn phải tối thiểu 1 đêm');
    }

  };



  return (
    <div className="RoomClientContainer">
      {/* tieu de va thanh search ngay */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Bạn muốn đặt phòng?</h1>
        {/* Hiển thị ngày */}
        <div style={{ width: '30%' }} className="RoomClientContainer_searchDates">
          <FontAwesomeIcon icon={faCalendarDays} className="RoomClientContainer_icon" />
          <span onClick={() => setOpenDate(!openDate)}>{`${format(
            dates[0].startDate,
            "dd/MM/yyyy"
          )} đến ${format(dates[0].endDate, "dd/MM/yyyy")}`}</span>
          {openDate && (
            <DateRange
              onChange={(item) => handleDayChange(item)}
              minDate={addHours(new Date(),10+(-7-timeZone))} // ngày tối thiểu đc chọn, 
              maxDate={addDays(new Date(),365)}
              ranges={dates}
              moveRangeOnFirstSelection={true}
              editableDateInputs={true}
              className="date"
            />

          )}
        </div>

        {/* Hiện số người */}
        <div ><FontAwesomeIcon icon={faPerson} className="RoomClientContainer_icon" /> {options.adult} người lớn, {options.children} trẻ em</div>

      </div>



      {/* Phần đặt phòng gom nhieu flex_div */}
      {data.map((item, index) => (
        <div className="flex_div" style={{ border: '1px solid #7fc7af' }}>

          <div style={{ width: '50%' }} >
            <div className="rTitle">{item.title}</div>
            <div className="rDesc" >Số lượng người: {item.maxPeople}</div>
            <div className="rMax">{item.desc}</div>
            <div className="rImages">
              {item.photos?.slice(0, 3).map((photo, i) => (
                <div className="rImgWrapper" key={i}>
                  <img
                    src={photo}
                    alt=""
                    className="roomImg"
                    onClick={() => handleOpen(i, index)}
                  />
                  {i === 2 && item.photos.length > 3 && (
                    <div style={{ fontStyle: 'italic' }}>
                      (Còn {item.photos.length - 3} ảnh tiếp...)
                    </div>
                  )}
                  {/* Kiểm tra nếu index của ảnh được click trùng với expandedPhotoIndex thì hiển thị ảnh phóng to */}
                  {openExpandPhoto && (
                    <div className="expandedPhotoWrapper">
                      {/* css dùng từ hotel */}
                      <FontAwesomeIcon
                        icon={faCircleXmark}
                        className="close"
                        onClick={() => setOpenExpandPhoto(false)}
                      />
                      <FontAwesomeIcon
                        icon={faCircleArrowLeft}
                        className="arrow"
                        onClick={() => handleMove("l", data[indexItem])}
                      />
                      {/* hiển thị ảnh phóng to */}
                      <div className="sliderWrapper">
                        <img
                          src={data[indexItem].photos[slideNumber]}
                          alt=""
                          className="sliderImg"
                        />
                      </div>
                      <FontAwesomeIcon
                        icon={faCircleArrowRight}
                        className="arrow"
                        onClick={() => handleMove("r", data[indexItem])}
                      />

                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/*  hiện giá */}
          <div>
            Giá: {new Intl.NumberFormat('vi-VN').format(item.price * 1000)} VND
            <br />
            (Mỗi đêm)
          </div>
          {/* chứa chỗ chọn phòng */}
          <div key={key} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'flex-end', width: '20%', alignItems: 'center', gap: '10px' }}>

            <select style={{ height: '20px' }} id={`select_${item._id}`} onChange={(event) => handleSelectChange(event, item.roomNumbers)}>

              {/* <option id={`defaultOption_${item._id}`} value={0}>0 phòng</option> */}
              {(() => {
                let roomAvailable = 999;
                for (let date of alldates) {
                  let dateAvailableCount = 0;
                  //Với mỗi date, duyệt qua các phần tử trong mảng roomNumbers
                  for (let roomNumber of item.roomNumbers) {
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
                const maxOptions = 10; // Số lượng phòng tối đa sẽ hiện của thẻ option
                const options = [];
                //  ko còn phòng trống nào
                if (roomAvailable === 0) {
                  options.push(<option value={0}>Đã hết</option>);
                } else {
                  options.push(<option value={0}> 0 {hotelType === "Khách sạn"||hotelType === "Nhà nghỉ" ? "phòng" : hotelType.toLowerCase()}</option>);
                  for (let i = 1; i <= roomAvailable; i++) {
                    if (i > maxOptions) break;
                    options.push(<option value={i}>{i} {hotelType === "Khách sạn" ||hotelType === "Nhà nghỉ" ? "phòng" : hotelType.toLowerCase()}</option>);
                  }
                }


                return options;


                // let roomIndex = 0; 
                // const maxOptions = 10; // Số lượng phòng tối đa sẽ hiện của thẻ option
                // let optionsCount = 0; // Biến đếm số lượng option đã được thêm vào
                // let hasAvailableRoom = false; // Biến kiểm tra xem có phòng nào thỏa mãn không
                // const options= item.roomNumbers.map((roomNumber, index) => {
                //   if (optionsCount >= maxOptions) return null; // Nếu đã thêm đủ số lượng tối đa option thì dừng
                //   if (isAvailable(roomNumber)) {
                //     roomIndex++; // Tăng giá trị biến đếm khi phòng thỏa mãn điều kiện
                //     optionsCount++; 
                //     hasAvailableRoom = true;
                //     return (
                //       <option key={roomNumber._id} value={roomIndex}>
                //         {`${roomIndex} phòng`}
                //       </option>
                //     );
                //   }
                //   return null;
                // });

                // if(hasAvailableRoom){
                //   return (
                //     <>
                //       <option  value={0}>0 phòng</option>
                //       {options}
                //     </>
                //   );
                // } else{
                //   // ko còn phòng nào
                //   return (
                //     <option  value={0}>Hết phòng</option>
                //     );
                // } 

              })
                ()}
            </select>

            <div style={{ width: '30%', height: '100%', fontSize: '14px' }}>(Chọn số lượng muốn đặt)</div>

          </div>



        </div>
      ))}

      <h2>Bạn đã chọn {selectedRoomIds.length} phòng</h2>
      {totalPriceReservation > 0 && (
        <h2>Tổng giá: {new Intl.NumberFormat('vi-VN').format(totalPriceReservation * 1000)} VND</h2>
      )}

      <button onClick={reserveRoom} className="rButton">
        Đi đến trang đặt phòng
      </button>


    </div>
  )
}

export default ListRoomClient

