import React from 'react'
import Sidebar from '../../../components/adminComponents/sidebar/Sidebar'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useContext, } from "react";
import useFetch from '../../../hooks/useFetch';
import { AuthContext } from '../../../context/AuthContext';
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { roomInputs } from '../../../formSource';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const ModifyRoom = () => {
  const location = useLocation();
  const idRoom = location.pathname.split("/")[3];
  const { data, loading, error } = useFetch(`/rooms/find/${idRoom}`);
  const [files, setFiles] = useState("");
  const [info, setInfo] = useState(data);
  // const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
  // const decodedToken = jwtDecode(token);
  const { user } = useContext(AuthContext) // {user._id}
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate()
  const previousPath = location.state?.previousPath;
  if (previousPath !== '/admin/rooms') {
    navigate('/admin/rooms');
  }
  useEffect(() => {
    if (data) {
      setInfo(data);
    }
  }, [data]);
  const removeImage = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };
  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };
  const validateInputs = () => {
    // Check if all hotelInputs are filled
    for (let input of roomInputs.slice(0, 3)) {
      if (!document.getElementById(input.id).value) {
        return false;
      }
    }
    // Check if description is filled
    if (!document.getElementById("desc").value.trim()) {//|| (files.length === 0) sau thêm cái này vào lúc triển khai
      return false;
    }
    if (document.getElementById("price").value < 0 || document.getElementById("maxPeople").value < 0) {
      return false;
    }

    return true;
  };

  // khi người dùng submit
  const handleClick = async (e) => {
    setIsSending(true)
    e.preventDefault();
    try {
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
        return;
      }
      const newModifyRoom = {
        ...info,
        ...(list.length > 0 && { photos: list }), // nếu người dùng có thêm ảnh vào thì set lại ảnh mới, ko thì giữ nguyên
        // ownerId: decodedToken.id    // _id của tài khoản người dùng
      };

      const Success = await axios.put(`/api/rooms/${idRoom}`, newModifyRoom);
      if (Success) {
        setIsSending(false)
        toast.success('Thành công chỉnh sửa!');
        navigate(`/admin/rooms`, { state: { hotelIdFromAddModifyRoom: data.hotelId } });

      } else {
        toast.error("Có lỗi xảy ra vui lòng tải lại trang và thử lại");
        setIsSending(false)
      }

    } catch (err) {
      console.log(err);
      toast.error("Có lỗi xảy ra vui lòng tải lại trang và thử lại");
      setIsSending(false)
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
          <h1 style={{ fontWeight: 'bold' }}>Chỉnh sửa thông tin</h1>
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
              <div className="no-image-container">
                {data.photos?.map((photo, index) => (
                  <img key={index} src={photo} alt={`Ảnh ${index}`} />
                ))}
              </div>
            )}
          </div>


          {/* field up ảnh */}
          <div className="right">
            <form>

              <div className="formInput">
                <label htmlFor="file">
                  Ảnh: (Click vào đây để up lại ảnh) <DriveFolderUploadOutlinedIcon className="icon" />
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
              {roomInputs.slice(0, 3).map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    onChange={handleChange}
                    type={input.type}
                    // placeholder={data[input.id]}
                    value={info[input.id]}
                  />
                  {/* hiển thị giá cho input price */}
                  {input.id == "price" ?
                    <div style={{ marginTop: '10px', fontStyle: 'italic' }}>Bạn đang để giá: {info.price && Intl.NumberFormat('vi-VN').format(info.price * 1000)} VND</div>
                    : null}
                </div>
              ))}
              {/* test */}
              <label>Mô tả (tối đa 500 ký tự)</label>
              <textarea
                id="desc"
                rows="4" /* Số dòng mặc định hiển thị ban đầu */
                maxLength="500"
                onChange={handleChange}
                // placeholder={data.desc}
                value={info.desc}
                style={{ width: "100%", padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" }}
              ></textarea>

              <button onClick={handleClick} disabled={isSending}>
                {isSending ? 'Đang lưu...' : 'Lưu thông tin loại phòng'}
              </button>
            </form>
          </div>



        </div>
      </div>
    </div>
  )
}

export default ModifyRoom
