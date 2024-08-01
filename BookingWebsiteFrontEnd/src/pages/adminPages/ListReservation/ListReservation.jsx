import React from 'react'
import './listReservation.css'
import { DataGrid } from "@mui/x-data-grid";
import { ReservationColumns } from '../../../datatablesource';
import useFetch from '../../../hooks/useFetch';
import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../../../context/AuthContext';
import { Link, useLocation } from "react-router-dom";
import Sidebar from '../../../components/adminComponents/sidebar/Sidebar'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import { DateRange } from "react-date-range";
import { format, addDays, addYears, subYears } from "date-fns";
import { SearchContext } from '../../../context/SearchContext'
import { toast } from 'react-toastify';
import {
    faBed,
    faCalendarDays,
    faPerson,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { jwtDecode } from "jwt-decode";
import Modal from 'react-modal';
import axios from 'axios';
const currentDate = new Date();
// để hiện tất cả reservations (khi người dùng chưa lọc theo ngày)
const INITIAL_STATE =
    [
        {
            startDate: subYears(currentDate, 100), // ngày từ 100 năm trước và sau 100 năm
            endDate: addYears(currentDate, 100),
            key: "selection",
        },
    ];

const ListReservation = () => {
    const { user } = useContext(AuthContext) // {user._id}
    // const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
    // const decodedToken = jwtDecode(token);
    const searchContext = useContext(SearchContext);
    const [dates, setDates] = useState(searchContext.dates);
    //date này để lọc trong API query
    const [datesToFilter, setDatesToFilter] = useState(INITIAL_STATE);
    const { data: reservationData, loading: reservationLoading, error: reservationError,
        reFetch: reservationReFetch } = useFetch(`/reservation/admin?startDay=${datesToFilter[0].startDate}&endDay=${datesToFilter[0].endDate}`);
    const [openDate, setOpenDate] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [reasonCancel, setReasonCancel] = useState('');
    const [selectedCancelReservation, setSelectedCancelReservation] = useState("");
    // console.log(selectedCancelReservation)
    // đổi giá trị hiển thị trên lịch - ko cần phải chuẩn giờ vì bên backend sẽ quét từ 0h ngày đó theo UTC
    const handleDayChange = (item) => {
        const newSelection = { ...item.selection };
        const { startDate, endDate } = newSelection;
        startDate.setHours(14, 0, 0, 0);
        endDate.setHours(14, 0, 0, 0);
        // dates này để hiển thị lịch trên giao diện
        setDates([{ ...newSelection, startDate, endDate }]);
    };

    // khi bấm lọc mới lưu vào biến trong API query
    const filterByDates = () => {
        //date này để lọc trong API query
        setDatesToFilter(dates);
    }

    const cancelFilterByDates = () => {
        //date này để lọc trong API query - hủy lọc theo ngày lấy tất cả đơn
        setDatesToFilter(INITIAL_STATE);
    }

    // mở modal yêu cầu hủy
    const closeModalCancelRequest = () => {
        setModalIsOpen(false)
    }
    const openRequestCancelModal = (canceledReservation) => {
        // kiểm tra nếu thời gian nhận phòng đơn đấy đã qua hoặc đơn đấy ở status khác 1 (tức khác thành công) là hủy thì ko đc 
        if (new Date() > new Date(canceledReservation.start) || canceledReservation.status !== 1) {
            toast.error("Bạn không thể yêu cầu hủy đơn này!")
            return;
        }
        setSelectedCancelReservation(canceledReservation)
        setModalIsOpen(true)
    }


    // khi admin bấm yêu cầu hủy đơn đặt
    const requestCancel = async () => {
        setIsRequesting(true)
        let hasError = false
        try {
            // chỉnh lại reservation này là do admin yêu cầu hủy
            try {
                await axios.put(`/reservation/${selectedCancelReservation._id}`, {
                    cancelDetails: {
                        isAdminCancel: true
                    }
                })
            } catch (err) {
                hasError = true;
                console.log(err)
                return;
            }

            // gửi email xác nhận cho khách về yêu cầu hủy của admin
            // try {
            //     const res = await axios.put(`/reservation/email/sendEmailStatusReservation`, {
            //         userId: selectedCancelReservation.userId, // gửi cho email của account khách - userId khách
            //         emailSubject: "THÔNG BÁO YÊU CẦU HỦY ĐƠN ĐẶT PHÒNG TỪ CHỦ CHỖ NGHỈ ",
            //         emailContent: `Đơn đặt phòng mã ${selectedCancelReservation._id} của quý khách được chủ chỗ nghỉ yêu cầu hủy \n Lý do hủy: ${reasonCancel} \n Chi tiết xem tại trang web phần Đơn đặt phòng `
            //     });
            // } catch (err) {
            //     console.log(err)
            //     hasError = true;
            //     return;
            // }

        } catch (err) {
            console.log(err)
        } finally {
            if (hasError) {
                toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
                setModalIsOpen(false)
            } else {
                toast.success("Gửi yêu cầu hủy thành công");
                setModalIsOpen(false)
            }
            // setIsSending(false)
            setIsRequesting(false)
            reservationReFetch();
        }

    }
    // thêm cột xóa sửa
    const actionColumn = [
        {
            field: "action",
            headerName: "Yêu cầu hủy",
            flex:1,
            minWidth: 120,
            headerAlign: 'center',

            renderCell: (params) => {
                const { cancelDetails, status } = params.row;
                const isAdminCancel = cancelDetails?.isAdminCancel;
                // khi đơn có y/c hủy từ admin
                if (isAdminCancel) {
                 // khi đơn có yêu cầu hủy từ admin nhưng chưa được khách chấp nhận - status đơn =1 là thành công
                    if(status ==1){
                        return (
                            <div className="cellRequestCancel">
                                <div style={{color:"blueviolet"}}>Đã yêu cầu hủy</div>
                            </div>
                        );
                    } else{
                    // khi đơn có yêu cầu hủy từ admin và được khách chấp nhận
                        return (
                            <div className="cellRequestCancel">
                                <div style={{color:"blueviolet", whiteSpace:'normal',textAlign:'center'}}>Yêu cầu hủy thành công</div>
                            </div>
                        );
                    }
                   
                }
                // trường hợp đơn ở trạng thái hủy hoặc quá ngày thì ko hiện yêu cầu hủy
                if (new Date() > new Date(params.row.start) || params.row.status !== 1) {

                }else{
                    return (
                        <div className="cellRequestCancel">
                            <div className="requestCancelButton" onClick={() => openRequestCancelModal(params.row)}>
                                Yêu cầu hủy
                            </div>
                        </div>
                    );
                }
              
            },
        },
    ];
    return (
        <div className="listAdmin">
            <Sidebar />
            {/* css từ adminHome css */}
            <div className="listContainerAdmin">
                <NavbarAdmin />

                {/* Modal */}
                <div className="ListReservationAdminContainer">
                    { modalIsOpen && (
                        <div className="modalCancelRequest">
                            <div className="modal-content">
                                <span className="modalCancelRequest_close" onClick={closeModalCancelRequest}>&times;</span>
                                <div className="modalCancelRequest_title">YÊU CẦU HỦY PHÒNG</div>
                                <textarea  type="text" value={reasonCancel} rows="4"
                                 placeholder="Nhập lý do muốn hủy. Yêu cầu hủy và lý do sẽ được gửi đến email của khách. Lưu ý rằng đơn đặt phòng vẫn sẽ có hiệu lực cho đến khi khách đồng ý hủy."
                                 onChange={(e) => setReasonCancel(e.target.value)} />
                                <div >
                                    <button className="modalCancelRequest_btn" disabled={isRequesting}  onClick={requestCancel}> {isRequesting ? 'Đang xử lý...' : 'Yêu cầu hủy'}</button>
                                </div>

                            </div>
                        </div>
                    )}
                    <h2>Những đơn đặt phòng tại chỗ nghỉ của bạn</h2>

                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: "10px", marginBottom: '10px', textAlign: 'center' }}>
                        {/* css từ listRoomCLient */}
                        <div style={{ width: '20%' }} className="ListReservationAdminContainer_searchDates">
                            <FontAwesomeIcon icon={faCalendarDays} className="ListReservationAdminContainer_icon" />
                            <span onClick={() => setOpenDate(!openDate)}>{`${format(
                                dates[0].startDate,
                                "dd/MM/yyyy"
                            )} to ${format(dates[0].endDate, "dd/MM/yyyy")}`}</span>
                            {openDate && (
                                <DateRange
                                    onChange={(item) => handleDayChange(item)}
                                    // minDate={new Date()}
                                    ranges={dates}
                                    moveRangeOnFirstSelection={false}
                                    editableDateInputs={true}
                                    className="date"
                                />
                            )}
                        </div>

                        <button className="ListReservationAdminContainer_filterBtn" onClick={filterByDates}>Lọc theo ngày</button>
                        <button className="ListReservationAdminContainer_filterBtn" onClick={cancelFilterByDates}>Hủy lọc</button>
                        <div style={{ fontStyle: 'italic' }}>(Lọc theo ngày được tính theo ngày check in của đơn, ví dụ nếu <br />để khoảng ngày 19 đến 20 sẽ lấy đơn có check in ngày 19 và 20)</div>
                    </div>




                    <DataGrid autoHeight getRowHeight={() => 'auto'}
                        // className="datagrid"
                        sx={{
                            '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': { py: '8px' },
                            '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': { py: '15px' },
                            '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': { py: '22px' },
                          }}
                        rows={reservationData}
                        columns={ReservationColumns.concat(actionColumn)}
                        pageSize={8}
                        rowsPerPageOptions={[5]}
                        // checkboxSelection
                        getRowId={(row) => row._id}
                    />
                </div>


            </div>
        </div>

    )
}

export default ListReservation
