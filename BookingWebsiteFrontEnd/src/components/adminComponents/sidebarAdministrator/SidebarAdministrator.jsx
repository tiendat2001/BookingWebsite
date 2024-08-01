import "./sidebarAdministrator.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import StoreIcon from "@mui/icons-material/Store";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";
const SidebarAdministrator = () => {
  // const { dispatch } = useContext(DarkModeContext);
  const {user , dispatch} = useContext(AuthContext)

  const navigate = useNavigate();
  const handleLogOut = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/logout");
      dispatch({ type: "LOGOUT"});
      navigate("/login");
    } catch (err) {}
  };
  return (
    // css từ sidebar.css
    <div className="sidebar">
      <div className="top">

        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">HotelBooking</span>
        </Link>
      </div>
      {/* <hr /> */}
      <div className="center">
        <div style={{color:'red'}}>Quyền admin</div>
        <ul>
          {/* <p className="title">MAIN</p> */}
          {/* <Link to="/" style={{ textDecoration: "none" }}>
            <li>
              <DashboardIcon className="icon" />
              <span>Dashboard</span>
            </li>
          </Link> */}
          <p className="title">MỤC</p>
          <Link to="/administrator/allHotelPayments" style={{ textDecoration: "none" }}>
            <li>
              <CreditCardIcon className="icon" />
              <span>Thanh toán</span>
            </li>
          </Link>
          <Link to="/administrator" style={{ textDecoration: "none" }}>
            <li>
              <StoreIcon className="icon" />
              <span>Doanh thu các chỗ nghỉ</span>
            </li>
          </Link>
         
          <p className="title">TÀI KHOẢN</p>
          {/* <li>
            <AccountCircleOutlinedIcon className="icon" />
            <span>Profile</span>
          </li> */}
          <li onClick={handleLogOut}>
            <ExitToAppIcon className="icon" />
            <span>Đăng xuất</span>
          </li>
        </ul>
      </div>
      {/* <div className="bottom">
        <div
          className="colorOption"
          // onClick={() => dispatch({ type: "LIGHT" })}
        ></div>
        <div
          className="colorOption"
          // onClick={() => dispatch({ type: "DARK" })}
        ></div>
      </div> */}
    </div>
  );
};

export default SidebarAdministrator;
