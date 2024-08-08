import React from 'react'
import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { Link } from "react-router-dom";
import './recentSeenHotel.css'

const RecentSeenHotel = () => {
  const [mostViewedCity, setMostViewedCity] = useState('');
  const { data: allHotelData, loading, error, reFetch } = useFetch(
    `/hotels`
  );
  const { data: suggestedHotel, loadingSuggestedHotel, errorSuggestedHotel, reFetchSuggestedHotel } = useFetch(
    `/hotels?city=${mostViewedCity}`
  );
  const [recentHotelIds, setRecentHotelIds] = useState('');


  useEffect(() => {
    if(!loading){ // Ensure data is loaded
      console.log(allHotelData)
    // tính toán từ localStorage xem city nào đc xem nhiều nhất gần đây
    //Lấy danh sách ID khách sạn đã xem từ localStorage
    const idHotelSeenString = localStorage.getItem('idHotelSeen');
    const idHotelSeen = idHotelSeenString ? JSON.parse(idHotelSeenString) : [];
    // nếu người dùng chưa xem ks nào (lần đầu vào localStorage rỗng => để mặc định HN)
    if (idHotelSeen.length == 0) {
      setMostViewedCity("Hà Nội")
    } else {
      setRecentHotelIds(idHotelSeen)
      // console.log(idHotelSeen)
      //Tạo một đối tượng để đếm số lần xuất hiện của mỗi thành phố
      const cityCount = {};
      for (let i = 0; i < idHotelSeen.length; i++) {
        const id = idHotelSeen[i];
        const hotel = allHotelData.find(hotel => hotel._id == id);
        if (hotel) {
          cityCount[hotel.city] = (cityCount[hotel.city] || 0) + 1;
        }
      }
      
      console.log(cityCount)
      // Tìm thành phố có số lần xuất hiện nhiều nhất
      let maxCount = 0;
      let mostViewedCity = '';
      for (const city in cityCount) {
        if (cityCount[city] > maxCount) {
          maxCount = cityCount[city];
          mostViewedCity = city;
        }
      }
      setMostViewedCity(mostViewedCity)
    }
  }

  }, [loading]);
  // console.log("mostviewcity"+mostViewedCity)
  console.log(mostViewedCity)
  // console.log(suggestedHotel)

  // chỉ lấy những khách sạn mà người dùng chưa xem gần đây- id khách sạn ko có trg local storage + lấy tối đa 3 ks để hiển thị
  // console.log(suggestedHotel)
  const filteredHotels = suggestedHotel.filter(item =>
    !recentHotelIds.includes(item._id) && item.cheapestPrice?.price !== 0 && item.cheapestPrice?.price !== undefined && item.city ==mostViewedCity

  );
  // console.log(filteredHotels)
  const limitedSuggestedHotels = filteredHotels.length > 3 ? filteredHotels.slice(0, 3) : filteredHotels;

  return (
    <div className="recentHotelContainer">
      <h1 style={{fontSize:'20px', }}>Các chỗ nghỉ ở {mostViewedCity}</h1>
      {loading || !mostViewedCity ? (
        "Đang tải"
      ) : (
        <div className="fp">
          {limitedSuggestedHotels
            .map((item, index) => (
              <div className="fpItem" key={item._id}>
                <Link to={`hotels/${item._id}`}>
                  <img src={item.photos[0]} alt="" className="fpImg" />
                </Link>
                <span className="fpName">{item.name}</span>
                <span className="fpCity">{item.city}</span>
                <span className="fpPrice">Giá chỉ từ  {Intl.NumberFormat('vi-VN').format(item.cheapestPrice.price * 1000)} VND cho 1 phòng mỗi đêm</span>

                {item.rating && <div className="fpRating">
                  {/* <button>{item.rating}</button> */}
                </div>}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default RecentSeenHotel
