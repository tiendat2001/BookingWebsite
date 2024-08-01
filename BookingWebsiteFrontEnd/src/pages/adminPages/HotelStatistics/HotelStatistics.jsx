import React from 'react'
import './hotelStatistics.css'
import Sidebar from '../../../components/adminComponents/sidebar/Sidebar'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import { Link, useLocation , useNavigate } from "react-router-dom";
import Highcharts from 'highcharts';
import axios from 'axios';
import useFetch from '../../../hooks/useFetch';
import { useEffect, useState,  } from 'react';
const HotelStatistics = () => {
  const location = useLocation();
  const hotelId = location.pathname.split("/")[4];
  const [month, setMonth] = useState(0);
  const { data, loading, error, reFetch } = useFetch(
    `/reservation/getRevenue/${hotelId}?month=${month}`);
  const { data: hotelDataByMonth, loading: loadinghotelDataByMonth, error: errorhotelDataByMonth, reFetch: reFetchhotelDataByMonth }
    = useFetch(`/reservation/getRevenueByMonths/${hotelId}`);
    console.log(hotelDataByMonth)
   
    const navigate = useNavigate()
    const previousPath = location.state?.previousPath;
    if (previousPath !== '/admin/hotels') {
      navigate('/admin/hotels');
    }
    const handleMonthChange = (event) => {
      setMonth(parseInt(event.target.value));
    };
  // Hàm định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value * 1000);
  };
  useEffect(() => {
    // biểu đồ đường

    Highcharts.chart('column_revenueByMonth', {
      chart: {
        type: 'line' // Chuyển đổi sang loại biểu đồ đường
      },
      title: {
        text: 'Biểu đồ doanh thu 6 tháng gần nhất',
        style: {
          fontWeight: "bold"
        }
      },
      xAxis: {
        categories: hotelDataByMonth.map(item => item.month + "/" + item.year).reverse(),// lấy month và đảo ngược mảng categories trực tiếp
        title: {
          text: 'Danh thu (được tính theo tổng giá trị tất cả đơn đặt phòng. Thời gian được tính theo ngày check in của đơn).'
        },
      },
      yAxis: {
        title: {
          text: 'Doanh thu',

        },
        labels: {
          formatter: function () {
            return formatCurrency(this.value); // Gọi hàm formatCurrency để định dạng tiền tệ
          }
        }
      },
      tooltip: {
        formatter: function () {
          return 'Doanh thu: ' + formatCurrency(this.y); // Định dạng giá trị tooltip thành tiền tệ
        }
      },
      credits: {
        enabled: false // Tắt chữ bản quyền
      },
      accessibility: {
        enabled: false
      },
      series: [{
        name: 'Doanh thu',
        data: hotelDataByMonth.map(item => item.revenue).reverse()
      }]



    });

    if (!loading) {
      const soldRoomsData = data.soldRooms;
      console.log(soldRoomsData)
      const pieChartData = [];
      for (const roomType in soldRoomsData) {  // roomType sẽ lặp Deluxve VIp, ...
        if (soldRoomsData.hasOwnProperty(roomType)) {
          pieChartData.push({
            name: roomType,
            y: soldRoomsData[roomType]
          });
        }
      }

      Highcharts.chart('pieChart-container', {
        chart: {
          type: 'pie'
        },
        title: {
          text: 'Tỷ lệ số lượng loại phòng đã bán',
          style: {
            fontWeight: "bold"
          }
        },
        credits: {
          enabled: false
        },

        series: [{
          name: 'Số lượng đã bán',
          data: pieChartData
        }]
      });

    }
  }, [hotelDataByMonth, data]);

  return (
    //   css từ adminHome.css
    <div className="listAdmin">
      <Sidebar />
      <div className="listContainerAdmin">
        <NavbarAdmin />

        <div className="hotelStatisticContainer">
          <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '10px' }}>Tổng quan chỗ nghỉ</div>

          <select value={month} onChange={handleMonthChange}>
            <option value={0}>Tất cả </option>
            <option value={1}>Trong tháng này </option>
            <option value={-1}>Trong tháng trước</option>
          </select>

          <div style={{marginBottom:'20px', fontSize: '14px', fontStyle: 'italic'}}>(Đối với lựa chọn tất cả và trong tháng này sẽ bao gồm cả những đơn sắp tới, 
          được tính theo ngày check-in của đơn. Tổng doanh thu bao gồm cả phí hủy của những đơn hủy có phí)</div>

          <div className="overviewStatistic">
            <div className="overviewStatistic_card">
              <div style={{ fontSize: '15px' }}>Tổng doanh thu (VND)</div>
              <div style={{ fontSize: '10px' }}></div>
              <div style={{ fontWeight: 'bold', fontSize: '30px' }}>
                {new Intl.NumberFormat('vi-VN').format(data.totalRevenue * 1000)}</div>
            </div>

            <div className="overviewStatistic_card">
              <div style={{ fontSize: '15px' }}>Tổng số khách</div>
              <div style={{ fontWeight: 'bold', fontSize: '30px' }}>{data.totalGuests}</div>
            </div>

            <div className="overviewStatistic_card">
              <div style={{ fontSize: '15px' }}>Tổng số đơn đặt thành công</div>
              <div style={{ fontWeight: 'bold', fontSize: '30px' }}>{data.totalOrders}</div>
            </div>
          </div>

          {/* <div style={{ fontSize: '15px' }}>Loại phòng bán chạy nhất: {data.maxSoldRoomType} ({data.maxSoldRoomCount} đã bán)</div> */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div id="column_revenueByMonth" style={{ flex: 1, width: '48%', height: '400px', marginTop: '50px' }}></div>

            <div id="pieChart-container" style={{ flex: 1, width: '48%', height: '400px', marginTop: '50px', marginLeft: '50px' }}></div>
          </div>



        </div>
      </div>
    </div>

  )
}

export default HotelStatistics
