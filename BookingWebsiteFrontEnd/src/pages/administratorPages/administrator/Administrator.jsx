import React from 'react'
import './administrator.css'
import SidebarAdministrator from '../../../components/adminComponents/sidebarAdministrator/SidebarAdministrator'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import { DataGrid } from "@mui/x-data-grid";
import { RenenueAllHotelColumn } from '../../../datatablesource';
import useFetch from '../../../hooks/useFetch';
import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../../../context/AuthContext';
import { Link, useLocation } from "react-router-dom";
const Administrator = () => {

  const { data: hotelRevenue, loading: hotelRevenueLoading, error: hotelRevenueError, reFetch: hotelRevenueReFetch } = 
  useFetch(`/reservation/getAllRevenueHotel`);

  return (
    // css tu AdminHome
    <div className="listAdmin">
      <SidebarAdministrator />
      <div className="listContainerAdmin">
        <NavbarAdmin />
        {/* <h1>bang</h1> */}

        <div className="listAllHotelRevenue">
          <div style={{fontWeight:'bold'}}>DOANH THU CÁC CHỖ NGHỈ</div>
        <DataGrid autoHeight
                    className="datagridAllHotelRenvenue"  // css từ listRoom.css
                    rows={hotelRevenue}
                    columns={RenenueAllHotelColumn}
                    pageSize={10}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    getRowId={(row) => row.hotelId}
                />
        </div>

      </div>
    </div>
  )
}

export default Administrator
