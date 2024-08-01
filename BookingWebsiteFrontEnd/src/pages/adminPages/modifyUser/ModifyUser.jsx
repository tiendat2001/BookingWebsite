import React from 'react'
import "./modifyUser.css"
import { useState, useContext } from "react";
import Sidebar from '../../../components/adminComponents/sidebar/Sidebar'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import { toast } from 'react-toastify';
import axios from 'axios';
const ModifyUser = ({ modify }) => {
    const [credentials, setCredentials] = useState({
        oldPassword: undefined,
        newPassword: undefined,
        newPasswordRepeat: undefined // Thêm trường passwordRepeat vào state, trường này khi đẩy vào API ko dùng
    });
    const handleChange = (e) => {
        setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };
    console.log(credentials)
    const handleChangePassword = async (e) =>{
        e.preventDefault();
        if ((credentials.newPassword !== credentials.newPasswordRepeat) || !credentials.newPassword || !credentials.oldPassword) {
            toast.error("Mật khẩu không khớp hoặc bạn chưa điền đủ từ");
            return;
          }
          try{
            const res = await axios.post("/auth/changePassword", credentials);
            if(res.status===200){
                toast.success("Đổi mật khẩu thành công")
            } 
          }catch(error){
              console.log(error)
          }
    }
    return (
        <div className="listAdmin">
            <Sidebar />
            <div className="listContainerAdmin">
                <NavbarAdmin />

                {/*  doi mat khau */}
                {modify === 'changePassword' ? (
                <div className="modifyUserContainer">
                    <h1>Đổi mật khẩu</h1>
                    <div className="modifyUserContainer_changePassword">
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu cũ"
                            id="oldPassword"
                            onChange={handleChange}
                            
                        />
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            id="newPassword"
                            onChange={handleChange}
                            
                        />

                        <input
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                            id="newPasswordRepeat"
                            onChange={handleChange}
                            
                        />

                        <button onClick={handleChangePassword}>Đổi mật khẩu</button>
                    </div>
                </div>

                // update payment info
                ) : modify === 'updatePaymentInfo' ? (
                    <>
                        <h1>dfdsf</h1>
                    </>
                ) : (
                    <h1>Trạng thái không hợp lệ</h1>
                )}




            </div>
        </div>

    )
}

export default ModifyUser
