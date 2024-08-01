import React from 'react'
import './roomDetails.css'
import Sidebar from '../../../components/adminComponents/sidebar/Sidebar'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useContext, } from "react";
import useFetch from '../../../hooks/useFetch';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import { SearchContext } from '../../../context/SearchContext'
import { format, addDays, addYears, addHours } from "date-fns";
import { confirmAlert } from 'react-confirm-alert';
import {
    faBed,
    faCalendarDays,
    faPerson,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { jwtDecode } from "jwt-decode";
const currentDate = new Date();
const INITIAL_STATE =
    [
        {
            startDate: currentDate, 
            endDate: addDays(currentDate, 29),
            key: "selection",
        },
    ];
const RoomDetails = () => {
    const [datesToFilter, setDatesToFilter] = useState(INITIAL_STATE);
    const location = useLocation();
    // id RoomType
    const idRoom = location.pathname.split("/")[4];
    const { data: roomTypeData, loading, error, reFetch: roomTypeDataReFetch } = useFetch(`/rooms/find/${idRoom}`);
    const { data: roomCountStatus, loading: loadingroomCountStatus,
        error: errorroomCountStatus, reFetch: reFetchRoomCountStatus } = useFetch(`/rooms/statusRoomCount/${idRoom}?startDate=${datesToFilter[0].startDate}&endDate=${datesToFilter[0].endDate}`);
    const { data: roomCloseData, loading: loadingroomCloseData,
        error: errorroomCloseData, reFetch: roomCloseDataReFetch } = useFetch(`/closedRoom/${idRoom}`);
    const [openDate, setOpenDate] = useState(false);
    const [openDate30Days, setOpenDate30Days] = useState(false);
    const searchContext = useContext(SearchContext);
    const [dates, setDates] = useState(searchContext.dates);
    // date để lọc status 30 day
    const [selectedRoomIdsToDelete, setSelectedRoomIdsToDelete] = useState([]);
    const [key, setKey] = useState(Math.random());
    const [roomQuantityToClose, setRoomQuantityToClose] = useState(0);
    // const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
    // const decodedToken = jwtDecode(token);
    const { user } = useContext(AuthContext) // {user._id}
    // check đường dẫn lần trc
    const navigate = useNavigate()
    const previousPath = location.state?.previousPath;
    if (previousPath !== '/admin/rooms') {
        navigate('/admin/rooms');
    }

    // RIÊNG HÀM NÀY Ở ĐÂY SẼ TÍNH CẢ NGÀY CUỐI, VÍ DỤ NGÀY 17-19 THÌ ALLDATES LÀ 17,18,19
    const getDatesInRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const date = new Date(start.getTime());
        const dates = [];
        while (date <= end) {
            dates.push(new Date(date).getTime());
            date.setDate(date.getDate() + 1);
        }
        return dates;
    };
    // tính alldates Close
    const alldates = getDatesInRange(dates[0].startDate, dates[0].endDate);
    // console.log(alldates)
    const handleDayChange = (item) => {
        const utc = new Date().getTimezoneOffset() / 60 //-7
        const newSelection = { ...item.selection };
        let { startDate, endDate } = newSelection;
        startDate = addHours(startDate, 7 - utc);
        endDate = addHours(endDate, 7 - utc);

        setDates([{ ...newSelection, startDate, endDate }]);
        setKey(Math.random()); // Bắt reload lại phần chọn phòng
    };

    const handleDayChangeFilter30Days = (item) => {
        const utc = new Date().getTimezoneOffset() / 60 //-7
        const newSelection = { ...item.selection };
        let { startDate, endDate } = newSelection;
        startDate = addHours(startDate, 7 - utc);
        // endDate = addHours(endDate, 7 - utc);
        endDate = addDays(new Date(startDate), 29);
        setDatesToFilter([{ ...newSelection, startDate, endDate }]);
        setKey(Math.random()); // Bắt reload lại phần chọn phòng
    };
    // console.log(datesToFilter)

    // phần đóng phòng
    const isAvailable = (roomNumber, dateToCheck) => {
        // if (!roomNumber.status) {
        //     return false; // Nếu status là false, room không khả dụng
        // }
        const isFound = roomNumber.unavailableDates.some((date) => {
            const dateMinusOneDay = new Date(date).getTime(); // theem getTIme() hay ko cung v
            // console.log(new Date(dateMinusOneDay));
            return dateToCheck == dateMinusOneDay;
        });

        return !isFound;
    };

    // thay doi so luong phong dong
    let updatedSelectedRoomToClose = [];
    const handleSelectChange = (event, roomNumbers) => {
        // lấy lựa chọn trong select
        let roomQuantitySelected = event.target.value;
        setRoomQuantityToClose(roomQuantitySelected)
        // updatedSelectedRoomToClose = [];
    };
    // khi ấn xác nhận đóng phòng
    const handelCloseRoom = async () => {
       
        try {
           
            if (parseInt(roomQuantityToClose, 10) == 0) {
                toast.error("Số lượng phòng muốn đóng phải lớn hơn 0")
                return;
            }
            const res = await axios.put(`/rooms/availability/`, {
                roomTypeIdsReserved: [{ roomTypeId: idRoom, quantity: parseInt(roomQuantityToClose, 10) }], // chuyển về dạng số
                dates: alldates,
                startDateRange: dates[0].startDate,
                endDateRange: addDays(dates[0].endDate, 1) // cần cộng 1 ngày do riêng đóng phòng tính cả ngày cuối
            });
        } catch (err) {
            console.log(err)
            toast.error("Có lỗi xảy ra vui lòng tải lại trang và thử lại")
            return; // Ngưng thực thi hàm nếu có lỗi
        }


        // tạo lịch sử đóng phòng
        try {
            const upload = await axios.post(`/closedRoom/createCloseRoom/${idRoom}`, {
                // ownerId: decodedToken.id,
                roomTypeId: idRoom,
                startClose: dates[0].startDate,
                endClose: dates[0].endDate, // cái này chỉ hiển thị ra bảng lịch sử đóng phòng sẽ là đến hết ngày ( ko cộng 1)
                quantityRoomClosed: roomQuantityToClose,
                allDatesClosed: alldates,
            });
        } catch (err) {
            console.log(err)
            toast.error("Có lỗi xảy ra")
            return;
        }
        toast.success('Đóng phòng thành công');
        roomCloseDataReFetch()
        roomTypeDataReFetch()
        reFetchRoomCountStatus()

    }

    // ẤN MỞ LẠI PHÒNG ĐÃ ĐÓNG
    const openHandleCancelCloseRoom = (allDatesClose, startDateClose, endDateClose, quantityRoomClosed, roomCloseId) => {
        confirmAlert({
            title: 'Xác nhận',
            message: 'Bạn có chắc chắn muốn mở lại phòng đã đóng ?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        handleCancelCloseRoom(allDatesClose, startDateClose, endDateClose, quantityRoomClosed, roomCloseId);
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
    const handleCancelCloseRoom = async (allDatesClose, startDateClose, endDateClose, quantityRoomClosed, roomCloseId) => {
        // console.log(startDateClose)
        // console.log(addDays(new Date(endDateClose), 1))
        let hasError = false;
        try {
            // gọi API bằng số lượng quantity của typeRoom đó
            for (var i = 0; i < quantityRoomClosed; i++) {
                try {
                    const res = await axios.put(`/rooms/cancelAvailability/${roomTypeData._id}`, {
                        dates: allDatesClose,
                        unavailableRangeDates: {
                            startDateRange: startDateClose,
                            endDateRange: addDays(new Date(endDateClose), 1) // cộng 1 do riêng đóng phòng tính cả phòng cuối
                        }
                    });
                    // console.log(`Room ${roomId} updated successfully.`);
                } catch (err) {
                    console.error(err);
                    hasError = true;
                }
            }

            // xóa lịch sử closeRoom
            try {
                const Success = await axios.delete(`/closedRoom/${roomCloseId}`);
                roomCloseDataReFetch()
                roomTypeDataReFetch()
                reFetchRoomCountStatus()

            } catch (error) {
                console.error(error);
                hasError = true;
                toast.error('Có lỗi xảy ra trong khi xóa lịch sử đóng phòng');
            }


        } catch (err) {
            console.error('Error:', err);
            hasError = true;
        }
        if (!hasError) {
            toast.success("Đã mở lại phòng đóng")
        }

    }
    // console.log(selectedRoomIdsToDelete)
    let roomAvailable = 0; // Khởi tạo biến đếm
    return (
        <div className="listAdmin">
            <Sidebar />
            <div className="listContainerAdmin">
                <NavbarAdmin />

                <div key={key} className="detailsRoomTypeContainer">
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Loại phòng/căn: {roomTypeData.title} (tổng số lượng phòng/căn: {roomTypeData.roomNumbers?.length})</div>
                        <button  className="detailsRoomTypeContainer_modifyNumberRooms"  onClick={() => navigate(`/admin/rooms/smallRoomDetails/modifyRoomCount/${idRoom}`, { state: { previousPath: '/admin/rooms/smallRoomDetails' } })}>Chỉnh số lượng</button>

                    </div>

                    <div style={{ fontWeight: 'bold',fontSize:'18px' }}>
                        Số lượng phòng/căn đang rao bán trong 30 ngày tới

                    </div>
                     {/* thanh chọn khoảng ngày muốn loc status 30day */}
                     <div style={{ width: '20%',margin:'10px 0px' }} className="closeRoomSearchBar">
                                <FontAwesomeIcon icon={faCalendarDays} className="icon" />
                                <span onClick={() => setOpenDate30Days(!openDate30Days)}>{`${format(
                                    datesToFilter[0].startDate,
                                    "dd/MM/yyyy"
                                )} đến ${format(datesToFilter[0].endDate, "dd/MM/yyyy")}`}</span>
                                {openDate30Days && (
                                    <DateRange
                                        onChange={(item) => handleDayChangeFilter30Days(item)}
                                        // minDate={new Date()}
                                        ranges={datesToFilter}
                                        moveRangeOnFirstSelection={false}
                                        editableDateInputs={true}
                                        className="dateRange"
                                    />
                                )}
                            </div>
                    <div className="tableRoomStatus">
                        <div className="grid-container">
                            {roomCountStatus.map((status, index) => (
                                <div className="grid-item" key={index}>
                                    <div>{`${status.day}/${status.month}/${status.year}`}</div>
                                    <div>Đang rao bán: {status.countAvailable}</div>
                                    {/*  số lượng bán = số lượng tổng - đang rao bán - số lượng đóng */}
                                    <div style={{ color: roomTypeData.roomNumbers?.length - status.countAvailable-status.closeRoomCount !== 0 ? 'red' : 'inherit', fontWeight: roomTypeData.roomNumbers?.length - status.countAvailable-status.closeRoomCount !== 0 ? 'bold' : 'normal' }}>
                                        Đã bán: {roomTypeData.roomNumbers?.length - status.countAvailable-status.closeRoomCount}
                                    </div>

                                    <div style={{ color:status.closeRoomCount  !== 0 ? 'red' : 'inherit', fontWeight: status.closeRoomCount !== 0 ? 'bold' : 'normal' }}>
                                        Đã đóng: {status.closeRoomCount}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="closeRoomContainer">
                        <div style={{ fontWeight: 'bold', fontSize: '20px' }}>Đóng phòng/căn</div>
                        <div style={{ fontStyle: 'italic', marginBottom: '10px' }}>(Bạn có thể đóng 1 số lượng phòng/căn vào trong 1 khoảng ngày nhất định)</div>

                        <div className="selectRoomClose">
                            {/* thanh chọn khoảng ngày muốn đóng phòng */}
                            <div style={{ width: '20%' }} className="closeRoomSearchBar">
                                <FontAwesomeIcon icon={faCalendarDays} className="icon" />
                                <span onClick={() => setOpenDate(!openDate)}>{`${format(
                                    dates[0].startDate,
                                    "dd/MM/yyyy"
                                )} đến ${format(dates[0].endDate, "dd/MM/yyyy")}`}</span>
                                {openDate && (
                                    <DateRange
                                        onChange={(item) => handleDayChange(item)}
                                        // minDate={new Date()}
                                        ranges={dates}
                                        moveRangeOnFirstSelection={false}
                                        editableDateInputs={true}
                                        className="dateRange"
                                    />
                                )}
                            </div>

                            {/* hiện ds số lượng phòng */}
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div>Số lượng phòng muốn đóng:  </div>

                                <select style={{ height: '20px' }} onChange={(event) => handleSelectChange(event, roomTypeData.roomNumbers)}>
                                    <option value={0}>0 phòng</option>
                                    {(() => {
                                        // // let roomIndex = 0; // Khởi tạo biến đếm
                                        // return roomTypeData.roomNumbers?.map((roomNumber, index) => {
                                        //     if (isAvailable(roomNumber)) {
                                        //         roomIndex++; // Tăng giá trị biến đếm khi phòng thỏa mãn điều kiện
                                        //         return (
                                        //             <option key={roomNumber._id} value={roomIndex}>
                                        //                 {`${roomIndex} phòng`}
                                        //             </option>
                                        //         );
                                        //     }
                                        //     return null;
                                        // });
                                         roomAvailable = 999;
                                        for (let date of alldates) {
                                            let dateAvailableCount = 0;
                                            //Với mỗi date, duyệt qua các phần tử trong mảng roomNumbers
                                            if (roomTypeData && Array.isArray(roomTypeData.roomNumbers)) {
                                                for (let roomNumber of roomTypeData.roomNumbers) {
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
                                        }
                                        // const maxOptions = 10; // Số lượng phòng tối đa sẽ hiện của thẻ option
                                        const options = [];
                                        for (let i = 1; i <= roomAvailable; i++) {
                                            options.push(<option value={i}>{i} phòng</option>);
                                        }
                                        return options;
                                    })()}
                                </select>
                            </div>

                            <div>Số lượng phòng hiện đang rao bán (có thể đóng): {roomAvailable}</div>

                            <button className="closeRoomContainer_btn" onClick={handelCloseRoom}>Xác nhận đóng</button>

                        </div>

                        <div style={{ fontWeight: 'bold', fontSize: '20px', marginTop: '20px' }}>Lịch sử đơn đóng phòng</div>

                        <div className="listRoomClosed">
                            {/* hàng tiêu đề */}
                            <div style={{ backgroundColor: '#ccc' }} className="roomCloseContainer">
                                <div className="roomClose">STT</div>
                                <div className="roomClose">Đóng từ ngày</div>
                                <div className="roomClose">Đến hết ngày</div>
                                <div className="roomClose">Số lượng phòng đóng</div>
                                <div style={{ width: '20%' }} className="roomClose" >Hành động</div>
                            </div>

                            {roomCloseData
                                // lấy những cái >= ngày hiện tại
                                ?.filter(roomClose => {
                                    const currentDate = new Date();
                                    currentDate.setHours(0, 0, 0, 0);
                                    return new Date(roomClose.endClose) > currentDate;
                                })
                                .map((roomClose, index) => (
                                    <div key={index} className="roomCloseContainer">
                                        <div className="roomClose">{index + 1}</div>
                                        <div className="roomClose">{new Date(new Date(roomClose.startClose)).toLocaleDateString('vi-VN')}</div>
                                        <div className="roomClose">{new Date(new Date(roomClose.endClose)).toLocaleDateString('vi-VN')}</div>
                                        <div className="roomClose">{roomClose.quantityRoomClosed}</div>
                                        <button style={{ width: '20%' }} className="roomNumber" onClick={() => openHandleCancelCloseRoom(roomClose.allDatesClosed, roomClose.startClose, roomClose.endClose,
                                            roomClose.quantityRoomClosed, roomClose._id)}>MỞ LẠI</button>
                                    </div>
                                ))}
                        </div>

                    </div>



                </div>

            </div>
        </div>

    )
}

export default RoomDetails
