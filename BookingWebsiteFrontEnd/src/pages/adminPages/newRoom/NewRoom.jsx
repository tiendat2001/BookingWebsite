import React from 'react'
import './newRoom.css'
import axios from "axios";
import useFetch from '../../../hooks/useFetch';
import { useState, useContext } from "react";
import Sidebar from '../../../components/adminComponents/sidebar/Sidebar'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { roomInputs } from '../../../formSource';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useLocation } from 'react-router';
const NewRoom = () => {
    const location = useLocation();
    const [files, setFiles] = useState("");
    const [info, setInfo] = useState({});
    // const [rooms, setRooms] = useState([]);
    // const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
    // const decodedToken = jwtDecode(token);
    const { user } = useContext(AuthContext) // {user._id}
    const [isSending, setIsSending] = useState(false);
    // const { data, loading, error } = useFetch(`/hotels?ownerId=${decodedToken.id}`);
    const { data, loading, error, reFetch } = useFetch(
        `/hotels/getByAdmin`);
    const [hotelId, setHotelId] = useState(location.state?.hotelIdFromListRoom);
    const navigate = useNavigate()

    const removeImage = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
    };
    const handleHotelChange = (e) => {
        setHotelId(e.target.value);
    };
    const validateInputs = () => {
        // Check if all hotelInputs are filled
        for (let input of roomInputs) {
            if (!document.getElementById(input.id).value) {
                return false;
            }
        }
        // Check if description is filled
        if (!document.getElementById("desc").value.trim() || hotelId == null) {//|| (files.length === 0) sau thêm cái này vào lúc triển khai
            return false;
        }

        if (document.getElementById("price").value < 0 || document.getElementById("maxPeople").value < 0) {
            return false;
        }
        return true;
    };

    const handleChange = (e) => {
        if (e.target.id === "roomNumbers") {
            const numberOfRooms = parseInt(e.target.value);
            const roomQuantity = Array.from({ length: numberOfRooms }, () => ({}));
            setInfo((prev) => ({ ...prev, [e.target.id]: roomQuantity }));
        } else {
            setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
        }



    };
    // console.log(info)

    // khi người dùng submit

    const handleClick = async (e) => {
        e.preventDefault();
        setIsSending(true);
        try {
            if (files.length >= 15) {
                toast.error("Bạn chỉ có thể up tối đa 15 ảnh")
                return;
            }
            const list = await Promise.all(
                Object.values(files).map(async (file) => {
                    const data = new FormData();
                    data.append("file", file);
                    const uploadRes = await axios.post(
                        `/api/closedRoom/upload/uploadImage`,
                        data
                    );

                    const { url } = uploadRes.data;
                    return url;
                })
            );



            if (!validateInputs()) {
                toast.error("Bạn chưa điền đủ thông tin hoặc thông tin không hợp lệ!");
            } else {
                const newRoom = {
                    ...info,
                    photos: list,
                    //   ownerId: decodedToken.id
                };

                // console.log(newRoom)

                const Success = await axios.post(`/api/rooms/${hotelId}`, newRoom);
                if (Success) {
                    toast.success('Thành công!');
                    navigate(`/admin/rooms`, { state: { hotelIdFromAddModifyRoom: hotelId } });
                } else toast.error("Có lỗi xảy ra vui lòng tải lại trang và thử lại");


            }


        } catch (err) {
            console.log(err);
        } finally {
            setIsSending(false); // Kết thúc xử lý, trả lại trạng thái ban đầu cho nút
        }
    };

    return (
        <div className="listAdmin">
            <Sidebar />
            <div className="listContainerAdmin">
                <NavbarAdmin />
                {/* css từ newHotel.css */}
                <div className="top">
                    <h1>Thêm loại phòng / chỗ ở</h1>
                </div>

                <div className="bottom">

                    {/*left- chỗ hiện ảnh đã chọn */}
                    <div className="left">
                        {files.length > 0 ? (
                            files.map((file, index) => (
                                <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Uploaded image ${index + 1}`}
                                        style={{ display: 'block' }}
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            backgroundColor: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))
                        ) : (
                            <img
                                src="https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                                alt="No image"
                            />
                        )}
                    </div>


                    {/* field up ảnh */}
                    <div className="right">
                        <form>

                            {/* select box khach san */}
                            <div className="roomSelectBox">
                                {/* <label>Choose a hotel</label> */}
                                <select
                                    id="hotelId"
                                    value={hotelId}
                                    onChange={handleHotelChange}
                                >
                                    <option disabled selected>Chọn chỗ nghỉ</option>
                                    {loading
                                        ? "loading"
                                        : data &&
                                        data.map((hotel) => (
                                            <option key={hotel._id} value={hotel._id}>
                                                {hotel.name}
                                            </option>
                                        ))}
                                </select>

                            </div>


                            <div className="formInput">
                                <label htmlFor="file">
                                    Up ảnh (click vào biểu tượng bên cạnh để thêm ảnh): <DriveFolderUploadOutlinedIcon className="icon" />
                                </label>
                                <input
                                    type="file"
                                    id="file"
                                    multiple
                                    onChange={(e) => setFiles([...e.target.files])}
                                    style={{ display: "none" }}
                                />
                            </div>

                            {/* render các trường */}
                            {roomInputs.map((input) => (
                                <div className="formInput" key={input.id}>
                                    <label>{input.label}</label>
                                    <input
                                        id={input.id}
                                        onChange={handleChange}
                                        type={input.type}
                                        placeholder={input.placeholder}
                                    />
                                    {/* hiển thị giá cho input price */}
                                    {input.id == "price" ?
                                        <div style={{ marginTop: '10px', fontStyle: 'italic' }}>Bạn đang để giá: {info.price && Intl.NumberFormat('vi-VN').format(info.price * 1000)} VND</div>
                                        : null}
                                </div>
                            ))}
                            {/* test */}
                            <label>Mô tả (về cơ sở vật chất,...) (tối đa 500 ký tự) </label>
                            <textarea
                                id="desc"
                                rows="4" /* Số dòng mặc định hiển thị ban đầu */
                                maxLength="500"
                                onChange={handleChange}
                                style={{ width: "100%", padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" }}
                            ></textarea>

                            <button onClick={handleClick} disabled={isSending}>
                                {isSending ? 'Đang lưu...' : 'Xác nhận'}
                            </button>
                        </form>
                    </div>



                </div>
            </div>
        </div>
    )
}

export default NewRoom
