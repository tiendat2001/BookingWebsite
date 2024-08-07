
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import "./reserve.css";
import useFetch from "../../../hooks/useFetch";
import { useEffect } from "react";
import { useContext, useState } from "react";
import { SearchContext } from "../../../context/SearchContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";
import { AuthContext } from '../../../context/AuthContext';
import Navbar from "../../../components/navbar/Navbar";
import Header from "../../../components/header/Header";
import { format, addDays, subHours } from "date-fns";
import { toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
const Reserve = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // gồm id các phòng nhỏ
  const [selectedRooms, setSelectedRooms] = useState(location.state.selectedRoomIds);
  const [alldates, setAlldates] = useState(location.state.alldates);
  const [hotelId, setHotelId] = useState(location.state.hotelId);
  const [startDate, setStartDate] = useState(location.state.startDate);
  const [endDate, setEndDate] = useState(location.state.endDate);
  const searchContext = useContext(SearchContext);
  const [options, setOptions] = useState(searchContext.options);
  // gồm room type id, tên room type, và số lượng phòng đặt cho từng roomtype
  const [roomsDetailFromListClient, setRoomsDetailFromListClient] = useState(location.state.seletedRoomIdsReserved)
  const { user } = useContext(AuthContext)
  const { data: roomData, loading, error, reFetch } = useFetch(`/rooms/${hotelId}`);
  const { data: hotelData, loading: hotelLoading, error: hotelError } = useFetch(`/hotels/find/${hotelId}`);
  const [reFreshRoomData, setReFreshRoomData] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [paymentType, setPaymentType] = useState();
  const [isSending, setIsSending] = useState(false);
  const handlePaymentTypeChange = (event) => {
    setPaymentType(event.target.value);
  };
  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };
  
  // console.log(paymentType)
  var totalPrice = 0;
  var maxPeople = 0;
  // console.log(startDate)
  // lấy ra id roomType cùng số lượng - dùng để cho vào reservation - để thống kê sau này
  const roomTypeIdsReserved = roomsDetailFromListClient.map(room => ({
    roomTypeId: room.roomTypeId,
    quantity: room.quantity
  }));
  // console.log(roomTypeIdsReserved)


  const roomCounts = {};
  // để tạo ra text cho vào chỗ đơn đặt phòng VD: testx2, test3x1 và tổng giá cho mỗi đêm totalPrice cho vào đơn đặt phòng
  // Tính số lượng của từng loại phòng
  selectedRooms.forEach(roomId => {
    // với mỗi _id phòng nhỏ thì tìm typeRoom tương ứng
    const room = roomData.find(room => room.roomNumbers.some(rn => rn._id == roomId));
    if (room) {
      totalPrice = totalPrice + room.price
      maxPeople = maxPeople + room.maxPeople
      if (roomCounts[room.title]) {
        roomCounts[room.title]++;
      } else {
        roomCounts[room.title] = 1;
      }
    }
  });

  // để tạo ra text cho vào chỗ đơn đặt phòng VD: testx2, test3x1
  const detailRooms = Object.entries(roomCounts).map(([title, count]) => `${title} (x${count})`).join(', ');
  const selectedRoomIdsReserved = []
  // đặt phòng
  const reserveRoom = async () => {
    setIsSending(true)
    // check lại các trường
    if (!paymentType || !phoneNumber) {
      toast.error("Vui lòng nhập đầy đủ thông tin thanh toán")
      setIsSending(false)
      return;
    }

  

    // Đẩy available
    try {
     
      const res = await axios.put(`/api/rooms/availability/`, {
        roomTypeIdsReserved:roomTypeIdsReserved,
        dates: alldates,
        startDateRange: startDate,
        endDateRange: endDate,
        // hotelId: hotelId,
      });
    } catch (err) {
      console.log(err)
      toast.error(err.response.data.message)
      setIsSending(false)
      return; // Ngưng thực thi hàm nếu có lỗi
    }
    // tạo order
    let reservationId = ""
    try {
      const newReservation = await axios.post(`/api/reservation`, {
        phoneNumber: phoneNumber,
        start: startDate,
        end: endDate,
        roomTypeIdsReserved: roomTypeIdsReserved,
        roomsDetail: detailRooms,
        guest: { adult: options.adult, children: options.children },
        allDatesReserve: alldates,
        totalPrice: totalPrice * alldates.length,
        hotelId: hotelId,
        idOwnerHotel: hotelData.ownerId,
        status: -1,
      });
      // lấy id của đơn đặt phòng vừa tạo
      reservationId = newReservation.data._id;

    } catch (err) {
      console.log(err)
      return;
    }

    toast.success('Đi đến trang thanh toán');

    // chuyển hướng thanh toán VNPAY
    // try {
    //   const response = await axios.post('/api/payment/create_payment_url', {
    //     reservationId: reservationId,
    //     amount: totalPrice * alldates.length * 1000,
    //     paymentType: paymentType
    //   });
    //   let paymentUrl = response.data; // Giả sử API trả về link thanh toán trong trường 'paymentUrl'
    //   const startIndex = paymentUrl.indexOf('https://');
    //   // Cắt bỏ phần URL trước "https://" và lấy phần sau
    //   paymentUrl = paymentUrl.substring(startIndex);
    //   // chuyển hướng link thanh toán
    //   window.location.href = paymentUrl;
    // } catch (error) {
    //   console.error('Error creating payment:', error);
    //   // Xử lý lỗi nếu cần
    // }
    navigate("/bookings",);
    setIsSending(false)
  }

  return (
    <div>
      <Navbar />
      <Header type="list" />

      <div className="ReserveContainer">
        <h1>Thông tin đặt phòng</h1>
        {/* chứa thông tin khách sạn đang đặt */}
        <div className="ReserveHotelContainer">
          <img src={hotelData.photos?.[0]} alt="" className="reserveImg" />

          <div style={{ width: '65%' }}>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '10px', lineHeight: '30px' }}>{hotelData.name}</div>
            <div>Địa chỉ: {hotelData.address}</div>
          </div>
        </div>

        <div style={{
          width: '100%', backgroundColor: '#d5eefd', boxSizing:'border-box', alignContent: 'center',
          fontWeight: 'bold', fontSize: '25px', padding: '10px'
        }}>  Chi tiết đặt phòng của bạn</div>
        
        <div className="ReserveDetailContainer">
          <div>Thời gian nhận phòng:  {startDate.toLocaleString('vi-VN')}</div>
          <div>Thời gian trả phòng:  {subHours(endDate,2).toLocaleString('vi-VN')}</div>
          {/* <div>(Thời gian được tính theo múi giờ hiện tại máy của bạn)</div> */}
          <div>Tổng thời gian lưu trú:  {alldates.length} đêm</div>
          <div style={{ fontWeight: 'bold' }}>Phòng của bạn:  {detailRooms} </div>
          <div style={{ fontWeight: 'bold' }}>Số người: {options.adult} người lớn và {options.children} trẻ em</div>
          {(parseInt(options.adult) + parseInt(options.children) * 0.5) - maxPeople >= 2 && (
            <div style={{ fontWeight: 'bold', color: 'red' }}>
              (Phòng của bạn có thể không chứa đủ người)
            </div>
          )}
          <div style={{ fontWeight: 'bold' }}>
            Tổng giá: {new Intl.NumberFormat('vi-VN').format(totalPrice * alldates.length * 1000)} VND
          </div>


        </div>

        <div style={{
          width: '100%', backgroundColor: '#d5eefd', boxSizing:'border-box', alignContent: 'center',
          fontWeight: 'bold', fontSize: '25px', padding: '10px'
        }}>  Thông tin thanh toán</div>

        <div className="ReservePaymentContainer">
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px' }}>
            {/* input nhập số điện thoại */}
            <label htmlFor="phone">Nhập số điện thoại của bạn:</label>
            <input
              type="text"
              id="phone"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
            />
          </div>

          {/* nhập hình thức thanh toán */}
          <div>Chọn hình thức thanh toán</div>
          <div className="label_paymentMethod">
            <input
              type="radio"
              name="paymentType"
              value="VNBANK"
              // checked={paymentType === "VNBANK"}
              onChange={handlePaymentTypeChange}
            />
            Thanh toán thẻ ATM nội địa
          </div>
          <div className="label_paymentMethod">
            <input
              type="radio"
              name="paymentType"
              value="INTCARD"
              // checked={paymentType === "INTCARD"}
              onChange={handlePaymentTypeChange}
            />
            Thanh toán thẻ VISA
          </div>



        </div>

        <button onClick={reserveRoom} className="rButton" disabled={isSending}>
          {isSending ? 'Đang xử lý...' : 'Thanh toán'}
          
        </button>

      </div>

    </div>
  );
};

export default Reserve;