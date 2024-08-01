import React from 'react'
import "./listBooking.css"
import Navbar from '../../../components/navbar/Navbar'
import Header from '../../../components/header/Header'
import { useState, useContext } from "react";
import axios from 'axios';
import useFetch from '../../../hooks/useFetch';
import { AuthContext } from '../../../context/AuthContext';
import { format, addDays, subDays, subHours, addHours } from "date-fns";
import { confirmAlert } from 'react-confirm-alert';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Footer from '../../../components/footer/Footer';
const ListBooking = () => {
  // const { user } = useContext(AuthContext)
  const { data, loading, error, reFetch } = useFetch(
    `/reservation/client`
  );
  const [isSending,setIsSending] = useState(false)

  const handleCancelReserve = async (selectedReservation) => {
    let message = ""
    let cancelFee =0;
    // hủy trong khoảng time 3 ngày trc ngày nhận phòng và ko trong khoảng 24h sau thời gian đặt 
    // và ko phải là yêu cầu hủy từ admin thì bị coi là muộn - tính phí đêm đầu
    const isLateCancel = (new Date() > subHours(new Date(selectedReservation.start), 24 * 3)) &&  !selectedReservation.cancelDetails.isAdminCancel
      && (new Date() > addHours(new Date(selectedReservation.createdAt), 24))

    if (isLateCancel) {
      cancelFee = selectedReservation.totalPrice / selectedReservation.allDatesReserve.length
      message = `Bạn có chắc chắn muốn hủy đơn đặt phòng này? Bạn không thể hoàn tác sau khi hủy. Bạn mất phí hủy 
      (phí đêm đầu- ${new Intl.NumberFormat('vi-VN').format(cancelFee* 1000)} VND)
       nếu hủy đơn đặt này.`
    } else message = "Bạn có chắc chắn muốn hủy đơn đặt phòng này? Bạn không thể hoàn tác sau khi hủy. Bạn sẽ không mất phí hủy nếu hủy đơn đặt này"

    confirmAlert({
      title: 'Xác nhận hủy',
      message: message,
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            deleteAvailability(cancelFee,selectedReservation);
          }
        },
        {
          label: 'No',
          onClick: () => {
            // Không làm gì cả
          }
        }
      ]
    });


  }

  // bỏ unavailabledates trong mỗi phòng đặt
  const deleteAvailability = async (cancelFee,selectedReservation) => {
    setIsSending(true)
    let hasError = false;
    // console.log(roomNumbersId)
    try {

      // đẩy available
      for (const roomTypeId of selectedReservation.roomTypeIdsReserved) {
        for (var i = 0; i < roomTypeId.quantity; i++) {
          try {
            const res = await axios.put(`/rooms/cancelAvailability/${roomTypeId.roomTypeId}`, {
              dates: selectedReservation.allDatesReserve,
              unavailableRangeDates: {
                startDateRange: selectedReservation.start,
                endDateRange: selectedReservation.end
              }
            });
            // console.log(`Room ${roomId} updated successfully.`);
          } catch (err) {
            console.error(err);
            hasError = true;
            return;
          }
        }
      }


      // chỉnh lại trạng thái reservation
      try {
        await axios.put(`/reservation/${selectedReservation._id}`, {
          status: 0,
          cancelDetails:{
            // giữ nguyên isAdminCancel, update phí hủy theo trường hợp
            isAdminCancel:selectedReservation.cancelDetails.isAdminCancel,
            cancelFee:cancelFee
        }
        })
      } catch (err) {
        hasError = true;
        console.log(err)
        return;
      }

      // // gửi email xác nhận đã hủy phòng thành công
      let emailSubject = "THÔNG BÁO HỦY PHÒNG THÀNH CÔNG"
      // try {
      //   const res = await axios.put(`/reservation/email/sendEmailStatusReservation`, {
      //     userId:selectedReservation.userId,
      //     emailSubject:"THÔNG BÁO HỦY PHÒNG THÀNH CÔNG",
      //     emailContent:`Đơn đặt phòng mã ${selectedReservation._id} của quý khách đã được hủy thành công.\n Chi tiết đơn đặt xem tại trên website`
      //   });
      // } catch (err) {
      //   hasError = true;
      //   console.log(err)
      //   return;
      // }

    } catch (err) {
      console.error('Error:', err);
      hasError = true;
    } finally {
      if (hasError) {
        toast.error("Đã xảy ra lỗi trong quá trình hủy phòng.");
      } else {
        toast.success("Hủy phòng thành công");
      }
      setIsSending(false)
      reFetch();
    }

  }


  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="listBookingContainer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Đặt phòng của bạn</h1>
          <Link style={{ fontSize: '16px', fontStyle: 'italic', marginTop: '5px' }} to="/policy">Xem thêm về chính sách hủy</Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          data.map((item, index) => (
            <div key={index} className="flex_div_booking">
              <div className="booking_details">
                <div>Mã đặt phòng: {item._id}</div>
                <div>Chỗ nghỉ: {item.hotelName} </div>
                <div>Địa chỉ: {item.hotelAddress}</div>
                <div>Phòng đặt: {item.roomsDetail}</div>
                <div>Tổng giá: {new Intl.NumberFormat('vi-VN').format(item.totalPrice * 1000)} VND</div>
                <div style={{ fontWeight: 'bold' }}>Ngày nhận phòng:  {new Date(item.start).toLocaleString('vi-VN')}</div>
                <div style={{ fontWeight: 'bold' }}>Ngày trả phòng: {subHours(new Date(item.end), 2).toLocaleString('vi-VN')}</div>
                {/* <div>(Thời gian được tính theo múi giờ hiện tại máy của bạn)</div> */}
                <div style={{ color: item.status === 1 ? 'green' : item.status === 0 ? 'red' : 'blue', fontWeight: 'bold' }}>
                  Tình trạng: {item.status === 1 ? "Thành công" : item.status === 0 ? "Hủy" : "Đang chờ"}
                </div>
                {/* xem có yêu cầu hủy từ chủ chỗ nghỉ ko */}
                {item.status ===1 && item.cancelDetails.isAdminCancel ? 
                (
                  <div style={{ fontWeight: 'bold',color:'red',fontStyle:'italic' }}>(Đơn này đang được yêu cầu hủy từ chủ chỗ nghỉ. <br/>
                   Đặt phòng này vẫn sẽ có hiệu lực cho đến khi bạn hủy. <br/>Bạn sẽ không mất phí hủy nếu hủy đơn này)</div>
                ):''}
                <div>Thông tin liên lạc chỗ nghỉ: {item.hotelContact}</div>



              </div>

              <div style={{ width: '25%', display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button className="cancel_booking" onClick={() => handleCancelReserve(item)}
                  disabled={new Date() > new Date(item.start) || item.status ==0}>
                  {/* disabled={ new Date() > new Date(item.start) || !item.status}> */}

                    {isSending ? 'Đang xử lý' : 'Hủy đặt phòng' }</button> <br />

                {/* <button className="cancel_booking" onClick={() => handleCancelReserve(item.allDatesReserve, item.roomNumbersId, item._id, item.start, item.end, item.roomTypeIdsReserved)}
                >Hủy đặt phòng</button>  */}
                <br />
                <div style={{ textAlign: 'right' }}>(Bạn sẽ được miễn phí hủy nếu hủy trong 24h kể từ lúc đặt hoặc trước thời gian nhận phòng 3 ngày (trước {subHours(new Date(item.start), 24 * 3).toLocaleString('vi-VN')}))</div>
              </div>

            </div>
          ))
        )}


      </div>

      {/* <Footer /> */}
    </div>
  )
}

export default ListBooking
