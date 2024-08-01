import React from 'react'
import "./allHotelPayment.css"
import SidebarAdministrator from '../../../components/adminComponents/sidebarAdministrator/SidebarAdministrator'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import useFetch from '../../../hooks/useFetch'
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { allHotelPaymentColumn } from '../../../datatablesource';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const AllHotelPayment = () => {
  const { data: hotelRevenue, loading: hotelRevenueLoading, error: hotelRevenueError, reFetch: hotelRevenueReFetch } = 
  useFetch(`/reservation/getAllPaymentAccount`);

  const exportToExcel = () => {
    const columns = allHotelPaymentColumn.map(col => col.headerName);
    const data = hotelRevenue.map(row => {
      let rowData = {};
      allHotelPaymentColumn.forEach(col => {
        // cột tổng odanh thu
        if (col.field === "totalPrice") {
          rowData[col.headerName] = new Intl.NumberFormat('vi-VN').format(row[col.field] * 1000);
        } else
        // cột cần thanh toán
        if (col.valueGetter) {
          rowData[col.headerName] = new Intl.NumberFormat('vi-VN').format(col.valueGetter({ row }));
        } else {
          rowData[col.headerName] = row[col.field];
        }
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(data, { header: columns });
    worksheet['!cols'] = allHotelPaymentColumn.map(col => {
      return { wpx: 170 }; // sử dụng `col.width` nếu có, nếu không mặc định là 100px
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HotelRevenue");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, 'HotelRevenue.xlsx');
  };
  return (
    // css tu AdminHome
    <div className="listAdmin">
      <SidebarAdministrator />
      <div className="listContainerAdmin">
        <NavbarAdmin />

        <div className="listAllHotelPayment">
          <div style={{fontWeight:'bold'}}>KHOẢN CẦN THANH TOÁN CHO CÁC CHỦ CHỖ NGHỈ TRONG THÁNG TRƯỚC</div>
          <button className="export_btn" onClick={exportToExcel} style={{ marginBottom: '10px' }}>Xuất Excel</button>
        <DataGrid  autoHeight slots={{ toolbar: GridToolbar }}
                    className="datagridListAllHotelPayment"  
                    rows={hotelRevenue}
                    columns={allHotelPaymentColumn}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    getRowId={(row) => row.idOwnerHotel}
                />
        </div>
        

      </div>
    </div>
  )
}

export default AllHotelPayment
