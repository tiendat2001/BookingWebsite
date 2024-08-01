import React from 'react'
import './modifyRoomCount.css'
import Sidebar from '../../../components/adminComponents/sidebar/Sidebar'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useContext, } from "react";
import useFetch from '../../../hooks/useFetch';
import { AuthContext } from '../../../context/AuthContext';
import { roomInputs } from '../../../formSource';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
const ModifyRoomCount = () => {
    const location = useLocation();
    const idRoom = location.pathname.split("/")[5];
    const { data: roomTypeData, loading, error, reFetch } = useFetch(`/rooms/find/${idRoom}`);
    const [roomCountToAdd, setRoomCountToAdd] = useState(0);
    const [roomCountToDelete, setRoomCountToDelete] = useState(0);
    const navigate = useNavigate()
    const previousPath = location.state?.previousPath;
    if (previousPath !== '/admin/rooms/smallRoomDetails') {
        navigate('/admin/rooms');
    }
    const handleCloseRoom = async (roomId, currentStatus) => {
        // console.log("Room ID to delete:", roomId);
        // Thêm logic xử lý xóa phần tử ở đây
        try {
            // neu trang thai hien tai la true, tức đang mở và người dùng muốn đóng
            if (currentStatus) {
                for (const room of roomTypeData.roomNumbers) {
                    // nếu vẫn còn loại phòng xóa được
                    if (canDelete(room)) {
                        toast.error("Nếu bạn muốn giảm số lượng phòng bán,hãy xóa hết phòng trước thay vì đóng phòng")
                        return;
                    }
                }

            }
            
            const res = await axios.put(`/rooms/changeStatusRoomInRoomType/${roomId}`)

            if (res.status === 200) {
                toast.success("Chỉnh thành công") // In ra thông báo nếu thành công
                reFetch();
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra vui lòng thử lại")
            console.log(error)
        }
    };

    // kiểm tra xem xóa đc phòng ko
    const canDelete = (roomNumber) => {
        if (!roomNumber.unavailableDates || roomNumber.unavailableDates.length === 0) {
            // Nếu không có unavailableDates hoặc mảng rỗng, cho phép xóa
            return true;
        }
        // Lặp qua tất cả các phần tử trong mảng unavailableDates
        for (const date of roomNumber.unavailableDates) {
            //VÍ DỤ HÔM NAY 1/5 14H10 THÌ XÓA ĐƯỢC PHÒNG NHỎ CÓ ĐƠN NGÀY 1/5 (>14H)
            // Kiểm tra nếu ngày hiện tại không lớn hơn mọi phần tử trong mảng
            if (new Date() <= new Date(date)) {
                // 14h GMT
                return false; // Nếu có ít nhất một ngày trong tương lai, không cho phép xóa
            }
        }
        return true; // Nếu ngày hiện tại lớn hơn tất cả các ngày trong mảng, cho phép xóa
    };

    const handleRoomCountToAddChange = (event) => {
        const count = parseInt(event.target.value);
        setRoomCountToAdd(count);
    };
    const handleRoomCountToDeleteChange = (event) => {
        setRoomCountToDelete(parseInt(event.target.value));
    };

    // hàm submit
    const submitAddRoom = async (event) => {
        try {
            const res = await axios.put(`/rooms/addRoomToRoomType/${idRoom}`, {
                roomCountToAdd: roomCountToAdd
            });
            if (res.status === 200) {
                toast.success("Thêm thành công") // In ra thông báo nếu thành công
                reFetch(); // Thực hiện lại fetch dữ liệu nếu cần
            }

        } catch (error) {
            console.log(error);
        }
        setRoomCountToAdd(0)
    };

    const submitDeleteRoom = async (event) => {
        try {
            const res = await axios.put(`/rooms/deleteRoomInRoomType/${idRoom}`, {
                roomCountToDelete: roomCountToDelete
            });

            if (res.status === 200) {
                toast.success("Xóa thành công") // In ra thông báo nếu thành công
                reFetch(); // Thực hiện lại fetch dữ liệu nếu cần
            }
        } catch (error) {
            toast.error(error.response.data.message)
            reFetch();
            console.log(error);
        }
        setRoomCountToDelete(0)
    };
    return (
        <div className="listAdmin">
            <Sidebar />
            <div className="listContainerAdmin">
                <NavbarAdmin />

                <div className="ModifyRoomCountContainer">

                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Loại phòng: {roomTypeData.title} (tổng số lượng phòng: {roomTypeData.roomNumbers?.length})</div>
                    <div className="modifyRoomCount">
                        <label style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', alignItems: 'center' }}>
                            Nhập lượng phòng cần thêm (tăng):
                            <input
                                type="number"
                                value={roomCountToAdd}
                                onChange={handleRoomCountToAddChange}
                                min={1}
                            />
                        </label>
                        <button style={{ backgroundColor: 'rgb(91, 248, 0)' }} className="modifyRoomCount_btn" onClick={submitAddRoom}>Thêm</button>
                        <label style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', alignItems: 'center' }}>
                            Nhập lượng phòng cần xóa (giảm):
                            <input
                                type="number"
                                value={roomCountToDelete}
                                onChange={handleRoomCountToDeleteChange}
                                max={roomTypeData.roomNumbers?.length} 
                                min={1}
                            />
                        </label>
                        <button style={{ backgroundColor: 'red' }} className="modifyRoomCount_btn" onClick={submitDeleteRoom}>Xoá</button>
                    </div>

                    {/* <div style={{ fontStyle: 'italic', marginBottom: '10px' }}>(Với những phòng đã có đơn đặt phòng hoặc đơn đóng phòng trong thời gian tới sẽ hiện màu đỏ,
                        không thể xóa được. Trong trường hợp đó,nếu bạn muốn giảm số lượng phòng muốn bán, bạn sử dụng chức năng đóng phòng.
                      )</div> */}
                       <div style={{ fontStyle: 'italic', marginBottom: '10px' }}>(Với những phòng đã có đơn đặt phòng hoặc đơn đóng phòng trong thời gian tới sẽ hiện màu đỏ,
                        không thể xóa được (Số lượng phòng đỏ là số lượng phòng tối thiểu cần giữ). 
                        Trong trường hợp đó, nếu bạn muốn giảm số lượng phòng, bạn có thể yêu cầu hủy đơn của khách hoặc sử dụng chức năng đóng phòng. 
                       
                      )</div>
                    {/*  danh sách phòng */}
                    <div style={{ backgroundColor: '#ccc' }} className="roomNumberContainer">
                        <div className="roomNumber">STT</div>
                        <div className="roomNumber">ID phòng</div>
                        {/* <div className="roomNumber">Trạng thái</div> */}
                        <div style={{ width: '20%' }} className="roomNumber" >Tình trạng</div>
                    </div>
                    {roomTypeData.roomNumbers?.map((roomNumber, index) => (
                        <div key={index} className="roomNumberContainer" style={{ backgroundColor: canDelete(roomNumber) ? '' : 'red' }}>

                            <div className="roomNumber">{index + 1}</div>
                            <div className="roomNumber" style={{ fontWeight: 'unset' }}>{roomNumber._id}</div>
                            {/* <div className="roomNumber" style={{ color: roomNumber.status ? 'green' : 'yellow' }}>
                                {roomNumber.status ? 'Mở' : 'Đóng'}
                            </div> */}
                            {/* nếu ko xóa được  */}
                            {!canDelete(roomNumber) ? (
                                <div className="roomNumber">
                                    {/* <button className="roomNumber_btn" onClick={() => handleCloseRoom(roomNumber._id, roomNumber.status)}>Đóng/Mở</button> */}
                                    Đã đặt hoặc đóng
                                </div>

                            ) : (
                                <div className="roomNumber">
                                </div>
                            )}

                        </div>
                    ))}

                </div>
            </div>
        </div>
    )
}

export default ModifyRoomCount
