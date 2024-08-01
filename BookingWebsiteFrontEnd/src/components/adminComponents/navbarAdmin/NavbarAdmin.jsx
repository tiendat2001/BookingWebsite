import "./navbarAdmin.css";

// import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";
import React from "react"
import { AuthContext } from "../../../context/AuthContext";

const NavbarAdmin = () => {
//   const { dispatch } = useContext(DarkModeContext);
  const {user , dispatch} = useContext(AuthContext)

  return (
    <div className="navbarAdmin">
        <h1 className="navbarAdmin_username">Xin chào, {user?.username}</h1>
    </div>
  );
};

export default NavbarAdmin;
