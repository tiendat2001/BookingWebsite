import "./hotel.css";
import React, { useEffect } from 'react';
import Navbar from "../../../components/navbar/Navbar";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import MailList from "../../../components/MailList/MailList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faCircleXmark,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "react";
import useFetch from "../../../hooks/useFetch";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchContext } from "../../../context/SearchContext";
import { AuthContext } from "../../../context/AuthContext";
// import Reserve from "../../../reserve/Reserve";
import { format, } from "date-fns";
import ListRoomClient from "../../../components/ListRoomClient/ListRoomClient";
import {
  faBed,
  faCalendarDays,
  faPerson,
} from "@fortawesome/free-solid-svg-icons";
// PAGE THONG TIN TUNG HOTEL
const Hotel = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2]; // lay hotel id
  const [slideNumber, setSlideNumber] = useState(0);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // lay thong tin cua hotel theo id hotel
  const { data, loading, error } = useFetch(`/hotels/find/${id}`);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // CONTEXT
  const searchContext = useContext(SearchContext);
  const { destination, dates, options } = useContext(SearchContext);
  // console.log(searchContext)

  // lưu id hotel đã xem vào localStorage
  useEffect(() => {
    // Lấy danh sách ID khách sạn đã xem từ localStorage
    const idHotelSeenString = localStorage.getItem('idHotelSeen');
    let idHotelSeen = idHotelSeenString ? JSON.parse(idHotelSeenString) : [];

    // Kiểm tra nếu danh sách đã đạt đến 5 phần tử, xóa phần tử đầu tiên
    if (idHotelSeen.length >= 3) {
      idHotelSeen = idHotelSeen.slice(1);
    }
    // Kiểm tra xem ID của khách sạn hiện tại đã có trong danh sách hay chưa
    if (!idHotelSeen.includes(id)) {
      // Nếu chưa có, thêm ID mới vào danh sách
      idHotelSeen.push(id);
      // Lưu danh sách mới vào localStorage
      localStorage.setItem('idHotelSeen', JSON.stringify(idHotelSeen));
    }
  }, []);
  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  function dayDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
    return diffDays;
  }

  const days = dayDifference(dates[0].endDate, dates[0].startDate);
  // console.log(data.cheapestPrice)
  const handleOpen = (i) => {
    setSlideNumber(i);
    setOpen(true);
  };

  const handleMove = (direction) => {
    let newSlideNumber;

    if (direction === "l") {
      newSlideNumber = slideNumber === 0 ? (data.photos.length - 1) : slideNumber - 1;
    } else {
      newSlideNumber = slideNumber === (data.photos.length - 1) ? 0 : slideNumber + 1;
    }

    setSlideNumber(newSlideNumber);
    // console.log(newSlideNumber)
  };

  const handleClick = () => {
    if (user) {
      setOpenModal(true);
    } else {
      navigate("/login");
    }
  };
  return (
    <div>
      <Navbar />
      <Header type="list" />

      {/* phần hiển thị thông tin chọn từ trc */}
      {/* <div className="headerSearchHotel">
              <div className="headerSearchItemHotel">
                <FontAwesomeIcon icon={faBed} className="headerIconHotel" />
                <input
                  type="text"
                  placeholder={destination}
                  className="headerSearchInputHotel "
                />
              </div>
              <div className="headerSearchItemHotel">
                <FontAwesomeIcon icon={faCalendarDays} className="headerIconHotel" />

                <span className="headerSearchTextHotel"
                >{`${format(dates[0].startDate, "MM/dd/yyyy")} to ${format(
                  dates[0].endDate,
                  "MM/dd/yyyy"
                )}`}</span>
              </div>

              <div className="headerSearchItemHotel">
                <FontAwesomeIcon icon={faPerson} className="headerIconHotel" /> 
                <span
                  className="headerSearchTextHotel"
                >{`${options.adult} adult · ${options.children} children · ${options.room} room`}</span> 
              </div>  
    </div>  */}



      {loading ? (
        "loading"
      ) : (
        <div className="hotelContainer">
          {open && (
            <div className="slider">
              <FontAwesomeIcon
                icon={faCircleXmark}
                className="close"
                onClick={() => setOpen(false)}
              />
              <FontAwesomeIcon
                icon={faCircleArrowLeft}
                className="arrow"
                onClick={() => handleMove("l")}
              />
              <div className="sliderWrapper">
                <img
                  src={data.photos[slideNumber]}
                  alt=""
                  className="sliderImg"
                />
              </div>
              <FontAwesomeIcon
                icon={faCircleArrowRight}
                className="arrow"
                onClick={() => handleMove("r")}
              />
            </div>
          )}
          <div className="hotelWrapper">
            <h1 className="hotelTitle">{data.name}</h1>
            <div className="hotelAddress">
              <FontAwesomeIcon icon={faLocationDot} />
              <span>{data.address}</span>
            </div>
            <span className="hotelDistance">
              Địa điểm tuyệt vời – {data.distance}m từ trung tâm
            </span>
            {/* <span className="hotelPriceHighlight">
              Book a stay over ${data.cheapestPrice} at this property and get a
              free airport taxi
            </span> */}
            <div className="hotelImages">
              {data.photos?.map((photo, i) => (
                // ảnh dài quá thì cho nhỏ lại tối đa chỉ 3 rows
                // <div style={{ width: `${data.photos.length >= 9 ? (100 / Math.ceil(data.photos.length / 3)) + '%' : '33%'}` }} className="hotelImgWrapper" key={i}>
                <div style={{ width: `24%` }} className="hotelImgWrapper" key={i}>

                  <img
                    onClick={() => handleOpen(i)}
                    src={photo}
                    alt=""
                    className="hotelImg"
                  />
                </div>
              ))}
            </div>
            <div className="hotelDetails">
              <div className="hotelDetailsTexts">
                {/* <h1 className="hotelTitle">sdf</h1> */}
                <p className="hotelDesc" style={{ whiteSpace: 'pre-line' }}>{data.desc}</p>

                <div style={{fontWeight:'bold'}}>Cơ sở vật chất chỗ nghỉ</div>
                <div className="hotelDetailsTexts_facilities">
                  {data.facilities?.map(facility =>
                  (
                    <div className="hotelDetailsTexts_facilities_item" >{facility}</div>
                  ))}
                </div>
              </div>
              <div className="hotelDetailsPrice">
                <span>
                  Tọa lạc tại {data.address}, đây là một địa điểm tuyệt vời!
                </span>

                <div style={{ fontSize: '26px' }}>
                  <b>Giá chỉ từ {Intl.NumberFormat('vi-VN').format(data.cheapestPrice?.price * 1000)} VND mỗi đêm</b>
                </div>

              </div>
            </div>
          </div>
          <ListRoomClient hotelId={id} hotelType={data.type} />

          {/* <MailList /> */}
          <Footer />
        </div>
      )}
      {/* {openModal && <Reserve setOpen={setOpenModal} hotelId={id}/>} */}
    </div>
  );
};

export default Hotel;