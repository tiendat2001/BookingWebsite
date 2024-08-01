
import React from 'react';
import Navbar from '../navbar/Navbar';
import {
  faBed,
  faCalendarDays,
  faPerson,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DateRange } from "react-date-range";
import { useState, useContext } from "react";
// hien calendar
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { format, addDays, addHours, addYears } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./header.css";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from '../../context/AuthContext';
import { listProvinces } from '../../listObject';
const Header = ({ type }) => {
  const searchContext = useContext(SearchContext);
  const [destination, setDestination] = useState(searchContext.destination);
  const [dates, setDates] = useState(searchContext.dates);
  const [openDate, setOpenDate] = useState(false);
  const [options, setOptions] = useState(searchContext.options);
  const timeZone = new Date().getTimezoneOffset() / 60  // độ lệch múi giờ so với UTC của máy hiện tại
  const [openOptions, setOpenOptions] = useState(false);
  const [suggestedDestination, setSuggestedDestination] = useState([]);
  const navigate = useNavigate();
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    if (value) {
      const filteredSuggestions = listProvinces.filter(province =>
        province.name.toLowerCase().startsWith(value.toLowerCase())
      ).map(province => province.name);
      setSuggestedDestination(filteredSuggestions);
    } else {
      setSuggestedDestination([]);
    }
  }
  // chỉnh list gợi ý
  const handleSuggestionClick = (suggestion) => {
    setDestination(suggestion);
    setSuggestedDestination([]);
  };
  // sự kiện chỉnh sửa số người, room
  const handleOption = (name, operation) => {

    setOptions((prev) => {
      return {
        ...prev,
        // dùng [] để truy cập vì name là biến, chưa xác định rõ (hoặc giá trị chứa dấu cách), chỉ khi xđ rõ mới dùng dấu .
        [name]: operation === "i" ? options[name] + 1 : options[name] - 1,
      };
    });
    dispatch({ type: "NEW_SEARCH", payload: { destination, dates, options } });
  };

  // Search Context
  const { dispatch } = useContext(SearchContext);

  const { user } = useContext(AuthContext)

  const handleSearch = () => {
    // luu nhung lua chon de dung cho page sau
    dispatch({ type: "NEW_SEARCH", payload: { destination, dates, options } });

    navigate("/hotels", { state: { destination, dates, options } });
  };
  // console.log(dates)
  return (
    <div className="header">
      <div
        className={
          type === "list" ? "headerContainer listMode" : "headerContainer"
        }
      >
        {/* <div className="headerList">
          <div className="headerListItem active">
            <FontAwesomeIcon icon={faBed} />
            <span>Stays</span>
          </div>
          <div className="headerListItem">
            <FontAwesomeIcon icon={faPlane} />
            <span>Flights</span>
          </div>
          <div className="headerListItem">
            <FontAwesomeIcon icon={faCar} />
            <span>Car rentals</span>
          </div>
          <div className="headerListItem">
            <FontAwesomeIcon icon={faBed} />
            <span>Attractions</span>
          </div>
          <div className="headerListItem">
            <FontAwesomeIcon icon={faTaxi} />
            <span>Airport taxis</span>
          </div>
        </div> */}
        {type !== "list" && (
          <>
            <h1 className="headerTitle">
              Du lịch đến bất cứ đâu trên Việt Nam
            </h1>
            <p className="headerDesc">
              Chọn khách sạn với giá rẻ nhất dành cho bạn
            </p>
            {/* {!user && <button className="headerBtn">Sign in / Register</button>} */}
            <div className="headerSearch">
              {/* thanh search city */}
              <div className="headerSearchItem">
                <FontAwesomeIcon icon={faBed} className="headerIcon" />
                <input style ={{fontSize:'16px',color: 'black'}}
                  type="text"
                  value={destination}
                  className="headerSearchInput "
                  // doi trang thai state destination moi khi thay doi
                  onChange={handleDestinationChange}
                />
                {suggestedDestination.length > 0 && (
                  <div className="suggestionDestination">
                    <div  className="suggestionsList">
                      {suggestedDestination.map((suggestion, index) => (
                        <div 
                          key={index}
                          className="suggestionItem"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>



              {/* thanh search ngày */}
              <div className="headerSearchItem">
                <FontAwesomeIcon icon={faCalendarDays} className="headerIcon" />
                {/* chỗ hiển thị lên UI */}
                <span
                  onClick={() => setOpenDate(!openDate)}
                  className="headerSearchText"
                >{`${format(dates[0].startDate, "dd/MM/yyyy")} đến ${format(
                  dates[0].endDate,
                  "dd/MM/yyyy"
                )}`}</span>

                {openDate && (
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => {
                      const utc = new Date().getTimezoneOffset() / 60 //-7
                      const newSelection = { ...item.selection };
                      let { startDate, endDate } = newSelection;
                      if(startDate === endDate){
                        // nếu người dùng chỉ chọn 1 ngày
                         endDate = addDays(new Date(startDate), 1);
                      }
                      // 14+ getTimezoneOffset Múi giờ lệch ở khách sạn mà nó đặt thay cho số 7
                      // khi lấy từ lịch giờ đang để 0, với việt nam thì utc là -7, startDate sẽ là 14h, vì csdl lưu 7hUTC lên client thành 14h GMT+7
                      // nếu máy client để múi giờ GMT -1, tức startDate sẽ để 6h, csdl lưu 7h UTC nên lên client thành 6h => giống nhau để so ngày
                      startDate = addHours(startDate, 7 - utc);
                      endDate = addHours(endDate, 7 - utc);
                      setDates([{ ...newSelection, startDate, endDate }]);
                    }}
                    moveRangeOnFirstSelection={true}
                    ranges={dates}
                    className="date"
                    minDate={addHours(new Date(),10+(-7-timeZone))} // ngày tối thiểu đc chọn, 
                    maxDate={addDays(new Date(),365)}
                  />
                )}
              </div>


              <div className="headerSearchItem">
                <FontAwesomeIcon icon={faPerson} className="headerIcon" />
                <span
                  onClick={() => setOpenOptions(!openOptions)}
                  className="headerSearchText"
                >{`${options.adult} người lớn · ${options.children} trẻ em · ${options.room} phòng`}</span>
                {openOptions && (
                  <div className="options">
                    <div className="optionItem">
                      <span className="optionText">Người lớn</span>
                      <div className="optionCounter">
                        <button
                          disabled={options.adult <= 1}
                          className="optionCounterButton"
                          onClick={() => handleOption("adult", "d")}
                        >
                          -
                        </button>
                        <span className="optionCounterNumber">
                          {options.adult}
                        </span>
                        <button
                          className="optionCounterButton"
                          onClick={() => handleOption("adult", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="optionItem">
                      <span className="optionText">Trẻ em</span>
                      <div className="optionCounter">
                        <button
                          disabled={options.children <= 0}
                          className="optionCounterButton"
                          onClick={() => handleOption("children", "d")}
                        >
                          -
                        </button>
                        <span className="optionCounterNumber">
                          {options.children}
                        </span>
                        <button
                          className="optionCounterButton"
                          onClick={() => handleOption("children", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="optionItem">
                      <span className="optionText">Phòng</span>
                      <div className="optionCounter">
                        <button
                          disabled={options.room <= 1}
                          className="optionCounterButton"
                          onClick={() => handleOption("room", "d")}
                        >
                          -
                        </button>
                        <span className="optionCounterNumber">
                          {options.room}
                        </span>
                        <button
                          className="optionCounterButton"
                          onClick={() => handleOption("room", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="headerSearchItem">
                <button className="headerBtn" onClick={handleSearch}>
                  Tìm kiếm
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;