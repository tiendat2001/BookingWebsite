import React from 'react'
import { useContext } from 'react'
import Sidebar from '../../../components/adminComponents/sidebar/Sidebar'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import useFetch from '../../../hooks/useFetch';
import { AuthContext } from '../../../context/AuthContext'
import { Link } from 'react-router-dom';
import "./listHotel.css"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format, addDays, addYears, subYears } from "date-fns";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useEffect } from 'react';
const currentDate = new Date();
const endLessDate = addYears(currentDate, 10)

const ListHotel = () => {
    // token chứa _id tài khoản và isAdmin
    // const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
    // const decodedToken = jwtDecode(token);
    // // console.log(decodedToken);
    const { user } = useContext(AuthContext) // {user._id}
    const { data, loading, error, reFetch } = useFetch(
        `/hotels/getByAdmin`);
    // lấy ra những đơn đặt phòng trong tương lai
    const { data: reservationData, loading: reservationLoading, error: reservationError,
        reFetch: reservationReFetch } = useFetch(`/reservation/admin/?startDay=${currentDate}&endDay=${endLessDate}&status="success"`);
    // console.log(reservationData)
    const navigate = useNavigate();
    const handleDelete = (hotelId) => {
        const hasMatchingHotelId = reservationData.some(item => item.hotelId === hotelId);

        // Nếu có phần tử nào có hotelId trùng khớp, thoát ra khỏi hàm
        if (hasMatchingHotelId) {
            toast.error("Chỗ nghỉ này đang có đơn đặt phòng sắp tới, không thể xóa!")
            return;
        }
        confirmAlert({
            title: 'Confirm',
            message: 'Bạn có chắc chắn muốn xóa chỗ nghỉ này?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        // Xác nhận xóa khách sạn
                        deleteHotel(hotelId);
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
    };


    // hàm chuyển hướng
    const handleEditHotel = (itemId) => {
        navigate(`/admin/hotels/${itemId}`, { state: { previousPath: '/admin/hotels' } });
    };
    const handleStatisticHotel = (itemId) => {
        navigate(`/admin/hotels/revenue/${itemId}`, { state: { previousPath: '/admin/hotels' } });
    };
    const deleteHotel = async (hotelId) => {
        try {
            // Gửi yêu cầu xóa khách sạn đến máy chủ

            const Success = await axios.delete(`/hotels/${hotelId}`);

            if (Success) {
                // Nếu xóa thành công, tải lại dữ liệu
                reFetch();
                toast.success('Xóa thành công');
            } else {
                toast.error('Có lỗi xảy ra vui lòng thử lại');
            }
        } catch (error) {
            console.error('Error deleting hotel:', error);
            toast.error('Có lỗi xảy ra vui lòng thử lại');
        }
    };

    return (
        <div className="listAdmin">
            <Sidebar />
            <div className="listContainerAdmin">
                <NavbarAdmin />

                <div className="listHotelAdminContainer">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1>Chỗ nghỉ của bạn</h1>
                        <Link to={`/admin/hotels/new`}>
                            <button className="addHotel_btn" >Thêm chỗ nghỉ mới</button>
                        </Link>
                    </div>

                    {loading ? (
                        "loading"
                    ) : (

                        <>
                            {data.length === 0 ? (
                                <div>Bạn chưa có chỗ nghỉ nào. Hãy thêm chỗ nghỉ bằng cách ấn nút "Thêm chỗ nghỉ"</div>
                            ) : (
                                data.map((item) => (
                                    <div className="listHotelAdmin" key={item._id}>
                                        <img src={item.photos[0]} alt="" className="siImg" />
                                        <div className="siDesc">
                                            <h1 className="siTitle">{item.name}</h1>
                                            <span className="siDistance">Khoảng cách đến trung tâm: {item.distance}m từ trung tâm</span>

                                            <span className="siFeatures">Địa chỉ chỗ nghỉ: {item.address}</span>

                                        </div>
                                        <div className="listHotel_btn">
                                            {/* <span className="siTaxOp">Cho {options.adult} người, {days} đêm</span> */}
                                            {/* <Link to={`/hotels/${item._id}`}>
                                            </Link> */}
                                            <button
                                                onClick={() => handleStatisticHotel(item._id)}
                                            >Thống kê số liệu </button>

                                            <button onClick={() => handleEditHotel(item._id)} >
                                                Chỉnh sửa thông tin
                                            </button>
                                            <button style={{backgroundColor:'red'}} onClick={() => handleDelete(item._id)}>Xóa chỗ nghỉ</button>

                                        </div>
                                    </div>
                                )))}
                        </>
                    )}
                </div>


            </div>
        </div>
    )
}

export default ListHotel
