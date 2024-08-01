import React from 'react'
import "./statusTransaction.css"
import Navbar from "../../../components/navbar/Navbar";
import Header from "../../../components/header/Header";

const StatusTransaction = ({ status }) => {
    return (
        <div>
            <Navbar />
            <Header type="list" />
            <div style={{display:'flex',justifyContent:'center',flexDirection:'column',alignItems:'center'}} className="statusTransactionContainer">
                {status === 'success' ? (
                    <>
                        <h1 style={{ color: 'green' }}>Đặt phòng thành công</h1>
                        <button  style={{width:'20%'}} onClick={() => { window.location.href = '/bookings' }}>Xem đơn đặt phòng của bạn</button>
                    </>
                ) : status === 'fail' ? (
                    <>
                        <h1 style={{ color: 'red' }}>Đặt phòng thất bại</h1>
                        <button onClick={() => { window.location.href = '/' }}>Quay về trang chủ</button>
                    </>
                ) : (
                    <h1>Trạng thái không hợp lệ</h1>
                )}
            </div>
        </div>
    )
}

export default StatusTransaction
