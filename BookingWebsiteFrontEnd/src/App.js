import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import Home from "./pages/clientPages/home/Home";
import List from "./pages/clientPages/list/List";
import Hotel from "./pages/clientPages/hotel/Hotel";
import Login from "./pages/clientPages/login/Login";
import Register from "./pages/clientPages/register/Register";
import AdminHome from "./pages/adminPages/adminHome/AdminHome";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import ListHotel from "./pages/adminPages/ListHotel/ListHotel";
import NewHotel from "./pages/adminPages/newHotel/NewHotel";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModifyHotel from "./pages/adminPages/ModifyHotel/ModifyHotel";
import ListRoom from "./pages/adminPages/ListRoom/ListRoom";
import ListBooking from "./pages/clientPages/listBooking/ListBooking";
import Reserve from "./pages/clientPages/reserve/Reserve";
import NewRoom from "./pages/adminPages/newRoom/NewRoom";
import ModifyRoom from "./pages/adminPages/ModifyRoom/ModifyRoom";
import ListReservation from "./pages/adminPages/ListReservation/ListReservation";
import HotelStatistics from "./pages/adminPages/HotelStatistics/HotelStatistics";
import Administrator from "./pages/administratorPages/administrator/Administrator";
import AllHotelPayment from "./pages/administratorPages/AllHotelPayment/AllHotelPayment";
import { getCookie } from 'react-use-cookie';
import RoomDetails from "./pages/adminPages/RoomDetails/RoomDetails";
import ModifyRoomCount from "./pages/adminPages/ModifyRoomCount/ModifyRoomCount";
import StatusTransaction from "./pages/clientPages/StatusTransaction/StatusTransaction";
import ModifyUser from "./pages/adminPages/modifyUser/ModifyUser";
import UpdatePaymentInfo from "./pages/adminPages/UpdatePaymentInfo/UpdatePaymentInfo";
import Policy from "./pages/clientPages/Policy/Policy";
import axios from 'axios';
function App() {

  // phải có access token ms đc vào
  const ProtectedRoute = ({ children }) => {
    // const { user } = useContext(AuthContext);
    // const userToken = getCookie('access_token');
    // // console.log(userToken)
    // // chua dang nhap (user sẽ mảng rỗng) thi tu dong nhay sang trang login, có user sẵn trong localSto và token trong cookie thì k cần login
    // if (!user.username || !userToken) {
    //   return <Navigate to="/login" />;
    // }

    // return children;

    // check api
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);

    useEffect(() => {
      const checkAccessToken = async () => {
        try {
          const response = await fetch('/auth/checkHasAccessToken');
          if (response.status === 200) {
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Error checking access token:', error);
        } finally {
          setLoading(false);
        }
      };
      checkAccessToken();
    }, []);

    if (loading) {
      return <h1>Loading ....</h1>;
    }
    if (isLoggedIn) {
      return children;
    } else {
      return <Navigate to="/login" />;
    }
  };

  const ProtectedAdministratorRoute = ({ children }) => {
    // const { user } = useContext(AuthContext);
    // đang bỏ tạm 
    // const userToken = getCookie('access_token');
    // console.log(user)
    // if (!user||!user.isAdmin) {
    //   return <Navigate to="/login" />;
    // }

    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    useEffect(() => {
      const checkAccessToken = async () => {
        try {
          const response = await fetch('/auth/checkHasAccessTokenAdministrator');
          if (response.status === 200) {
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Error checking access token:', error);
        } finally {
          setLoading(false);
        }
      };

      checkAccessToken();
    }, []);

    if (loading) {
      return <h1>Loading ....</h1>;
    }

    if (isLoggedIn) {
      return children;
    } else {
      return <Navigate to="/login" />;
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<List />} />
        <Route path="/hotels/:id" element={<Hotel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bookings" element={<ProtectedRoute><ListBooking /></ProtectedRoute>} />
        <Route path="/reserve" element={<ProtectedRoute><Reserve /></ProtectedRoute>} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/statusTransaction/success" element={<StatusTransaction status="success" />} />
        <Route path="/statusTransaction/fail" element={<StatusTransaction status="fail" />} />

        {/* tổng doanh thu all hotel */}
        <Route path="/administrator" element={<ProtectedAdministratorRoute><Administrator /></ProtectedAdministratorRoute>} />
        <Route path="/administrator/allHotelPayments" element={<ProtectedAdministratorRoute><AllHotelPayment /></ProtectedAdministratorRoute>} />


        {/* cho admin */}
        <Route path="/admin/">
          <Route index element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          } />

          <Route path="changePassword" element={
            <ProtectedRoute>
              <ModifyUser modify="changePassword" />
            </ProtectedRoute>
          } />

          <Route path="updatePaymentInfo" element={
            <ProtectedRoute>
              <UpdatePaymentInfo />
            </ProtectedRoute>
          } />

          <Route path="hotels" element={
            <ProtectedRoute>
              <ListHotel />
            </ProtectedRoute>
          } />

          <Route path="hotels/new" element={
            <ProtectedRoute>
              <NewHotel />
            </ProtectedRoute>
          } />

          <Route path="hotels/:id" element={
            <ProtectedRoute>
              <ModifyHotel />
            </ProtectedRoute>
          } />

          <Route path="hotels/revenue/:id" element={
            <ProtectedRoute>
              <HotelStatistics />
            </ProtectedRoute>
          } />

          <Route path="rooms" element={
            <ProtectedRoute>
              <ListRoom />
            </ProtectedRoute>
          } />

          <Route path="rooms/new" element={
            <ProtectedRoute>
              <NewRoom />
            </ProtectedRoute>
          } />

          <Route path="rooms/:id" element={
            <ProtectedRoute>
              <ModifyRoom />
            </ProtectedRoute>
          } />

          <Route path="rooms/smallRoomDetails/:id" element={
            <ProtectedRoute>
              <RoomDetails />
            </ProtectedRoute>
          } />

          <Route path="rooms/smallRoomDetails/modifyRoomCount/:id" element={
            <ProtectedRoute>
              <ModifyRoomCount />
            </ProtectedRoute>
          } />

          <Route path="reservations" element={
            <ProtectedRoute>
              <ListReservation />
            </ProtectedRoute>
          } />



        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>

  );
}

export default App;
