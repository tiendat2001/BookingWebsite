import React from "react";
import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";

const Register = () => {
  const [credentials, setCredentials] = useState({
    username: undefined,
    password: undefined,
    email:undefined,
    passwordRepeat: undefined // Thêm trường passwordRepeat vào state, trường này khi đẩy vào API ko dùng

  });

  const {user, loading, error, dispatch } = useContext(AuthContext);

  const navigate = useNavigate()
  // khi thay doi field
  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // submit
  const handleClickRegister = async (e) => {
    e.preventDefault();
    if (credentials.password !== credentials.passwordRepeat) {
      alert("Mật khẩu không khớp");
      return;
    }
    try {

      const res = await axios.post("/api/auth/register", credentials);
      alert("Đăng ký thành công")
      navigate("/login")
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
    }
  };

  return (
    <div className="login">
      <div className="lContainer">
      <h1 className="Login">Đăng ký</h1>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          id="username"
          onChange={handleChange}
          className="lInput"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          id="password"
          onChange={handleChange}
          className="lInput"
        />

          <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          id="passwordRepeat"
          onChange={handleChange}
          className="lInput"
        />  

          <input
          type="email"
          placeholder="Email"
          id="email"
          onChange={handleChange}
          className="lInput"
        />

        
       
          {/* <label>
            <input 
            type="checkbox" 
            name="remember" 
            /> 
            Remember Me
          </label> */}
         
      
        
        <button disabled={loading} onClick={handleClickRegister}   className="lButton btn_registerr">
          Đăng ký
        </button>
        {error && <span>Tên đăng nhập hoặc email <br></br> đã có người sử dụng</span>}
      </div>
    </div>
  );
};

export default Register;