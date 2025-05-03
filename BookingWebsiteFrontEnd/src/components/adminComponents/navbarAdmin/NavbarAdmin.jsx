import "./navbarAdmin.css";
import { useContext } from "react";
import React from "react"
import { AuthContext } from "../../../context/AuthContext";
import { io } from "socket.io-client";
import { useEffect,useRef  } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const NavbarAdmin = () => {
  const { user, dispatch } = useContext(AuthContext);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("https://bookingwebsite-vhgs.onrender.com");

    socketRef.current.on("connect", () => {
      axios.post("/api/notification/connect-socket", {
        socketId: socketRef.current.id,
      });
    });

    socketRef.current.on("notification", (data) => {
      toast.info("📢 " + data);
    });

    return () => {
      socketRef.current.off("notification");
      socketRef.current.disconnect(); // Ngắt hoàn toàn kết nối
    };
  }, []);

  return (
    <div className="navbarAdmin">
        <h1 className="navbarAdmin_username">Xin chào, {user?.username}</h1>
    </div>
  );
};

export default NavbarAdmin;
