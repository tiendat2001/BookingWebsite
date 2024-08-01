import { format,addDays,subDays   } from "date-fns";
import React from 'react';

export const roomColumns = [
    { field: "_id", headerName: "ID", width: 100, hide:true },
    {
      field: "title",
      headerName: "Tên loại phòng (loại căn hộ, biệt thự,...) ",
      // width: 200,
      align:'center',
      headerAlign:'center',
      flex:1.25,
      renderHeader: (params) => (
        <div style={{ whiteSpace: 'normal', textAlign:'center',lineHeight: '1.2' }}>
          {params.colDef.headerName}
        </div>
      )
      
    },
    {
      field: "desc",
      headerName: "Mô tả ",
      flex:2,
      // width: 330,
      cellClassName: 'wrap-content', // listReservation.css
      // align:'center',
      headerAlign:'center'
    },
    // {
    //   field: "hotelName",
    //   headerName: "Hotel",
    //   width: 200,
    // },
    {
      field: "price",
      headerName: "Giá mỗi đêm(VND)",
      // width: 140,
      flex:1,
      valueFormatter: (params) => {
            const formattedValue = new Intl.NumberFormat('vi-VN').format(params.value*1000)
            return `${formattedValue}`;
    },
      align:'center',
      headerAlign:'center'

    },
    {
      field: "maxPeople",
      headerName: "Số người",
      // width: 130,
      flex:0.5,
      align:'center',
      headerAlign:'center'
    },
    {
      field: "roomCount",
      headerName: "Số lượng",
      flex:0.5,
      // width: 150,
      align:'center',
      headerAlign:'center',
      renderCell: (params) => {
          const roomNumbers = params.row.roomNumbers || [];
          return roomNumbers.length;
      }
    },
 
  ];



  const formatDate = (date) => {
    let dateFormat = new Date(date)
    // const [month, day, year] = dateFormat.toLocaleDateString().split('/');
    return dateFormat.toLocaleDateString('vi-VN');
  };


  // cột danh sách reservations
  export const ReservationColumns = [
    { field: "_id", headerName: "Mã đặt phòng",flex:1, width: 140 },
    {
      field: "start",
      headerName: "Check-in",
      flex:1,
      width: 90,
      valueFormatter: (params) => formatDate(params.value),
      headerAlign: 'center',
      align:'center',
      comparator: (a, b) => new Date(a).getTime() - new Date(b).getTime()

    },
    {
      field: "end",
      headerName: "Check-out",
      flex:1,
      width: 90,
      valueFormatter: (params) => formatDate(params.value),
      headerAlign: 'center',
      align:'center'
      
    },
    { field: "hotelName", headerName: "Chỗ nghỉ",flex:2, width: 180, headerAlign: 'center',  align:'center' },

    {
      field: "roomsDetail",
      headerName: "Phòng",
      flex:2,
      width: 250,
      cellClassName: 'wrap-content', // xuống dòng khi nội dung dài
      headerAlign: 'center',
      align:'center',
      renderCell: (params) => {
        const roomDetails = params.value;
        return (
          <div className="wrap-content">
            {roomDetails}
          </div>
        );
      }
    },
    
    {
      field: "guest",
      headerName: "Số người",
      width: 100,
      flex:1,
      cellClassName: 'wrap-content', // xuống dòng khi nội dung dài
      headerAlign: 'center',
      align:'center',
      renderCell: (params) => {
        const { adult, children } = params.row.guest;
        return `${adult} người lớn, ${children} trẻ em`;
      }
    },

    {
      field: "totalPrice",
      headerName: "Tổng giá(VND)",
      flex:1,
      width: 100,
      valueFormatter: (params) => {
        if (params.value !== null) {
            const formattedValue = new Intl.NumberFormat('vi-VN').format(params.value*1000)
            return `${formattedValue}`;
        }
        return null; // Trả về null nếu giá trị là null
    },
      headerAlign: 'center',
      align:'center'
    },
    // {
    //   field: "createdAt",
    //   headerName: "Thời gian đặt",
    //   width: 115,
    //   valueGetter: (params) => new Date(params.value).toLocaleDateString('vi-VN'),
    //   headerAlign: 'center',
    //   align:'center'

    // },
    {
      field: "phoneNumber",
      headerName: "Số điện thoại",
      width: 120,
      headerAlign: 'center',
      align:'center'
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 100,
      flex:0.75,
      renderCell: (params) => {
        let statusText;
        let statusColor;
      
        switch (params.value) {
          case 1:
            statusText = "OK";
            statusColor = "green";
            break;
          case 0:
            statusText = "HỦY";
            statusColor = "red";
            break;
          case -1:
            statusText = "Đang chờ";
            statusColor = "blue";
            break;
          default:
            statusText = "Không xác định";
            statusColor = "black";
            break;
        }
      
        return (
          <span style={{ color: statusColor }}>{statusText}</span>
        );
      },
      headerAlign: 'center',
      align:'center'
    },

  ];
  
  export const RenenueAllHotelColumn =
  // cột ds hotel revenue
  [
    {
      field: "hotelName",
      headerName: "Tên chỗ nghỉ",
      width: 350,
      headerAlign: 'center',
      align:'center'
    },
    {
      field: "userOwner",
      headerName: "Email tài khoản chủ",
      width: 350,
      headerAlign: 'center',
      align:'center'
    },
    {
      field: "createdAt",
      headerName: "Ngày hoạt động",
      // renderHeader: () => (
      //   <div style={{whiteSpace:'normal'}} className="wrap-Headercontent">
      //     Ngày bắt đầu hoạt động
      //   </div>
      // ),
      width: 115,
      valueFormatter: (params) => {
        const value = params.value ? params.value : '2024-05-20';
        return formatDate(value);
      },      comparator: (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      headerAlign: 'center',
      align:'center'

    },
    {
      field: "totalRevenue",
      headerName: "Tổng doanh thu",
      width: 250,
      valueFormatter: (params) => {
        const multipliedValue = params.value * 1000;
        // Định dạng giá trị thành số nguyên
        const formattedValue = new Intl.NumberFormat('vi-VN').format(multipliedValue);
        return `${formattedValue} VND`;
    },
      headerAlign: 'center',
      align:'center'
    },

    {
      field: "commission",
      headerName: "Tiền hoa hồng",
      width: 150,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (params) => {
          // Lấy giá trị của trường "Tổng doanh thu" từ params.row
          const totalRevenue = params.row.totalRevenue;
          if (totalRevenue !== undefined && totalRevenue !== null) {
              return totalRevenue * 0.1*1000; // 15% của giá trị "totalRevenue"
          }
          return null; 
      },
      valueFormatter: (params) => {
          if (params.value !== null) {
              const formattedValue = new Intl.NumberFormat('vi-VN').format(params.value)
              return `${formattedValue} VND`;
          }
          return null; // Trả về null nếu giá trị là null
      }
  }
  
  ]

  export const allHotelPaymentColumn=
  [
    {
      field: "idOwnerHotel",
      headerName: "Id tài khoản",
      width: 350,
      headerAlign: 'center',
      align:'center'
    },
    {
      field: "email",
      headerName: "Email tài khoản chủ",
      width: 250,
      headerAlign: 'center',
      align:'center'
    },
 
    {
      field: "totalPrice",
      headerName: "Tổng doanh thu",
      width: 250,
      valueFormatter: (params) => {
        const multipliedValue = params.value * 1000;
        // Định dạng giá trị thành số nguyên
        const formattedValue = new Intl.NumberFormat('vi-VN').format(multipliedValue);
        return `${formattedValue} VND`;
    },
      headerAlign: 'center',
      align:'center'
    },

    {
      field: "needToPaid",
      headerName: "Cần thanh toán",
      width: 150,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (params) => {
          // Lấy giá trị của trường "Tổng doanh thu" từ params.row
          const totalRevenue = params.row.totalPrice;
          if (totalRevenue !== undefined && totalRevenue !== null) {
              return totalRevenue * 0.9*1000; // 90% của giá trị "totalRevenue"
          }
          return null; 
      },
      valueFormatter: (params) => {
          if (params.value !== null) {
              const formattedValue = new Intl.NumberFormat('vi-VN').format(params.value)
              return `${formattedValue} VND`;
          }
          return null; // Trả về null nếu giá trị là null
      }
  },

  {
    field: "paymentInfo",
    headerName: "Thông tin thanh toán",
    width: 250,
    cellClassName: 'wrap-content', 
    headerAlign: 'center',
    align: 'center',
  }
  ]