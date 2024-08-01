import React, { useContext, useState, useEffect } from 'react'
import "./navbar.css"
import { Link } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
const Navbar = () => {
  const [user, setUser] = useState("")
  const { dispatch } = useContext(AuthContext)
  const [showInfoUser, setShowInfoUser] = useState(false);
  const navigate = useNavigate()
  useEffect(() => {
    function checkUserData() {
      const item = JSON.parse(localStorage.getItem('user'));
      if (item) {
        setUser(item)
      }
    }
    // đợi cho localstorage cập nhật
    setTimeout(checkUserData, 1);
    window.addEventListener('storage', checkUserData)

    return () => {
      window.removeEventListener('storage', checkUserData)
    }
  }, [])
  const handleUpdateInfo = () => {
    navigate('/update-info');
  };

  const handleChangePassword = (item) => {
    navigate('/admin/changePassword', { state: { item } });
  };
  const handleLogout = async () => {

    const res = await axios.post("/auth/logout");
    navigate("/login");
    dispatch({ type: "LOGOUT" });

  }

  const toggleOptions = () => {
    setShowInfoUser(!showInfoUser);
  };
  return (
    <div className="navbar">
      <div className="navContainer">
        {/* LOGO */}
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          <h1 className="logo_name">HotelBooking</h1>
          {/* <img className="logo" src="https://www.hilton.com/modules/assets/svgs/logos/WW.svg" alt="" /> */}
        </Link>


        {user?.username ? (
          <div className="logout">
            <Link to="/admin/hotels">
              <button className="navButton" >Quản lý chỗ nghỉ của bạn</button>
            </Link>

            <Link to="/bookings">
              <button className="navButton" >Đơn đặt phòng của bạn</button>
            </Link>

            <div className="account" >
              <h1 onClick={toggleOptions}>Xin chào, {user?.username}</h1>
              {showInfoUser && (
                <div className="account_options" >
                  {/* <div style={{fontWeight:'bold', cursor:'pointer'}} onClick={handleUpdateInfo}>Cập nhật thông tin</div> */}
                  <div style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleChangePassword("changePassword")}>Đổi mật khẩu</div>
                </div>
              )}
            </div>
            {/* <Link to="/login"> */}

            <button className="navButton" onClick={handleLogout} >Đăng xuất</button>
            {/* </Link> */}
          </div>

        ) : (
          <div className="navItems">
            {/* <button className="navButton" >List your Hotel</button> */}
            <Link to="/register">

              <button className="navButton" >Đăng ký</button>
            </Link>
            <Link to="/login">

              <button className="navButton" >Đăng nhập</button>
            </Link>

          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
