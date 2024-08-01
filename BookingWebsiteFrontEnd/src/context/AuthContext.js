import { createContext, useEffect, useReducer } from "react";
import React from "react";
// khi dispatch co user,loading,error, user tra ve action.payload la thong tin tk trong csdl
const INITIAL_STATE = {
  user:  JSON.parse(localStorage.getItem("user")) ||null,
  loading: false,
  error: null,
};
// khi mà user = AuthContext() thì mặc định user sẽ có những thứ trên
export const AuthContext = createContext(INITIAL_STATE);

// quản lý các trạng thái của context- các action như LOGIN_START để cập nhật trạng thái context
const AuthReducer = (state, action) => {
  switch (action.type) {
    //   luc bam nut dang nhap
    case "LOGIN_START": 
      return {
        user: null,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        loading: false,
        error: null,
      };
      // khi co action gui sang  dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      // sẽ có thuộc tính payload, action.payload để truy cập vào đó
    case "LOGIN_FAILURE":
      return {
        user: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        user: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
      // luu giu user khi refresh, luu state thanh 1 chuoi vao local storage, khi biến user thay đổi thì hàm này gọi, thônng
      // tin user sẽ lưu trong localstorage
    // const userWithoutAdmin = { ...state.user };
    // delete userWithoutAdmin.isAdmin;
    const userInfoLocalStorage = { username: state.user?.username };
    localStorage.setItem("user", JSON.stringify(userInfoLocalStorage));
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};