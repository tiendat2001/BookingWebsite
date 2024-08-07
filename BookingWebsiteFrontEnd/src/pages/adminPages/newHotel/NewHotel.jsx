import React from 'react'
import "./newHotel.css"
import axios from "axios";
import useFetch from '../../../hooks/useFetch';
import { useState, useContext } from "react";
import Sidebar from '../../../components/adminComponents/sidebar/Sidebar'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { hotelInputs, hotelFacilities } from '../../../formSource';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { listProvinces } from "../../../listObject";


const NewHotel = () => {
  const [files, setFiles] = useState("");
  const [info, setInfo] = useState({});
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [customFacilities, setCustomFacilities] = useState("");
  const handleCustomFacilitiesChange = (event) => {
    setCustomFacilities(event.target.value);
  };
  // const [rooms, setRooms] = useState([]);
  // const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
  // const decodedToken = jwtDecode(token);
  const { user } = useContext(AuthContext) // {user._id}
  const navigate = useNavigate()

  const { data, loading, error } = useFetch("/rooms");

  // xử lý khi submit form
  const [isSending, setIsSending] = useState(false);
  const removeImage = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  // validate
  const validateInputs = () => {
    // Check if all hotelInputs are filled
    for (let input of hotelInputs) {
      if (!document.getElementById(input.id).value || !document.getElementById("type").value) {
        return false;
      }
    }
    // Check if description is filled
    if (!document.getElementById("desc").value.trim() || (!customFacilities && selectedFacilities.length == 0)
      || (files.length === 0)) {//|| (files.length === 0) sau thêm cái này vào lúc triển khai
      return false;
    }

    if (document.getElementById("distance").value < 0) {
      return false;
  }
    return true;
  };

  // khi ng dùng nhập thông tin
  const handleChange = (e) => {
    const { id, value } = e.target;
    setInfo((prev) => ({
      ...prev,
      [id]: id === "city" ? value.trim() : value,
    }));
  };
  // facilities người dùng tích
  const handleCheckboxChange = (facility) => {
    setSelectedFacilities((prevSelected) => {
      // nếu người dùng tích cái đã có - tức bỏ nó đi thì bỏ nó khỏi mảng
      if (prevSelected.includes(facility)) {
        return prevSelected.filter((item) => item !== facility);
      } else {
        return [...prevSelected, facility];
      }
    });
  };

  // console.log(selectedFacilities)
  // khi ng dùng submit
  const handleClick = async (e) => {
    e.preventDefault();
    const customFacilitiesArray = customFacilities.split(',').map(item => item.trim()).filter(item => item);
    const allSelectedFacilities = [...selectedFacilities, ...customFacilitiesArray];
    setIsSending(true);
    try {
      if (allSelectedFacilities.length > 12) {
        toast.error("Chỉ được chọn tối đa 12 cơ sở vật chất");
        return;
      }
      if (!validateInputs()) {
        toast.error("Bạn chưa điền đủ các thông tin hoặc thông tin không hợp lệ!.");
      } else {
        // CHUYỂN ẢNH THÀNH LINK ĐỂ LƯU CSDL
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

        const newhotel = {
          ...info,
          photos: list,
          facilities: allSelectedFacilities
          // ownerId: decodedToken.id
        };

        const Success = await axios.post("/api/hotels", newhotel);
        if (Success) {
          toast.success('Thành công!');
          toast.warning(`Vẫn chưa xong! Hãy tiếp tục thêm chi tiết về loại phòng ở chỗ nghỉ của bạn ở mục "Phòng". Chỗ nghỉ
          của bạn sẽ được đăng sau khi có ít nhất 1 loại phòng`, {
            autoClose: 20000,
          });
          navigate("/admin/hotels");

        } else toast.error("Có lỗi xảy ra.Vui lòng tải lại trang và thử lại");
      }


    } catch (err) {
      console.log(error);
    } finally {
      setIsSending(false); // Kết thúc xử lý, trả lại trạng thái ban đầu cho nút
    }
  };
  return (
    // lấy css từ ListHotel.css
    <div className="listAdmin">
      <Sidebar />
      <div className="listContainerAdmin">
        <NavbarAdmin />
        <div className="top">
          <h1>Thêm chỗ nghỉ</h1>
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
              <div className="formInput">
                <label htmlFor="file">
                  Up ảnh: (Click vào đây để thêm ảnh) <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  multiple
                  onChange={(e) => setFiles([...e.target.files])}
                  style={{ display: "none" }}
                />
              </div>

              <div className="formInput" key='type'>
                <label>Chọn loại chỗ nghỉ</label>
                <select
                  id='type'
                  onChange={handleChange}
                  value={info.type}
                >
                  <option value="" >Chọn loại chỗ nghỉ</option> {/* Các option của dropdown */}
                  <option value="Khách sạn" >Khách sạn</option> {/* Các option của dropdown */}
                  <option value="Căn hộ" >Căn hộ</option>
                  <option value="Biệt thự" >Biệt thự</option> {/* Các option của dropdown */}
                  <option value="Resort" >Resort</option>
                  <option value="Nhà nghỉ" >Nhà nghỉ</option>

                </select>
                {info.type == "Căn hộ" || info.type == "Biệt thự" || info.type == "Resort" ?
                  (
                    <div style={{ fontStyle: 'italic' }}>(Trong trường hợp bạn muốn bán nhiều {info.type} tại cùng 1 địa chỉ, bạn chỉ cần tạo 1 chỗ nghỉ sau đó thêm
                      nhiều loại {info.type} ở mục "Phòng". Trong trường hợp bạn chỉ bán 1 {info.type} thì chỉ thêm 1 loại). </div>
                  )
                  : ""}
              </div>

              <div className="formInput" key='type'>
                <label>Tỉnh thành chỗ nghỉ</label>
                <select
                  id='city'
                  onChange={handleChange}
                  value={info.city}
                >
                  <option value="" >Chọn tỉnh thành</option> {/* Các option của dropdown */}
                  {listProvinces.map((province, index) => (
                    <option key={index} value={province.name}>
                      {province.name}
                    </option>
                  ))}

                </select>
              </div>
              {/* render các trường */}
              {hotelInputs.slice(0, 1).concat(hotelInputs.slice(2)).map((input) => (
                <div className="formInput" key={input.id}>
                  {/* <label>{input.label}</label> */}
                  <label>
                    {input.label} {info?.type ? info.type.toLowerCase() : "chỗ nghỉ"}
                  </label>
                  <input
                    id={input.id}
                    onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                  />
                </div>
              ))}
              {/* test */}
              <label>Mô tả chỗ nghỉ của bạn (Tối đa 1000 ký tự) </label>
              <textarea
                id="desc"
                rows="10" /* Số dòng mặc định hiển thị ban đầu */
                maxLength="1000"
                onChange={handleChange}
                style={{ width: "100%", padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" }}
              ></textarea>


              <div className="hotelFacilities">
                <div style={{ marginBottom: '10px' }}>Cơ sở vật chất chỗ nghỉ </div>
                {hotelFacilities.map((facility) => (
                  <div style={{ marginBottom: "10px" }} key={facility}>
                    <label>
                      <input
                        type="checkbox"
                        value={facility}
                        onChange={() => handleCheckboxChange(facility)}
                        checked={selectedFacilities.includes(facility)}
                      />
                      {facility}
                    </label>
                  </div>
                ))}

                {/* tự nhập */}
                <div className="customFacilities">
                  <label>Nhập cơ sở vật chất khác (ngăn cách bằng dấu phẩy): </label>
                  <input style={{ width: "100%" }}
                    type="text"
                    value={customFacilities}
                    placeholder="Ví dụ:Thuê xe đạp, Dịch vụ phòng"
                    onChange={handleCustomFacilitiesChange}
                  />
                </div>
              </div>

              <button onClick={handleClick} disabled={isSending}>
                {isSending ? 'Đang lưu...' : 'Đăng chỗ nghỉ'}
              </button>
            </form>
          </div>



        </div>
      </div>
    </div>
  );
}

export default NewHotel
