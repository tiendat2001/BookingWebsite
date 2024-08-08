import "./list.css";
import React from "react";
import Navbar from "../../../components/navbar/Navbar";
import Header from "../../../components/header/Header";
import { useLocation } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import SearchItem from "../../../components/searchItem/SearchItem";
import useFetch from "../../../hooks/useFetch";
import { SearchContext } from "../../../context/SearchContext";
import { addDays, addHours } from 'date-fns';
import { listProvinces } from "../../../listObject";
import { hotelFacilities } from "../../../formSource";
import Footer from "../../../components/footer/Footer";
const List = () => {
  const timeZone = new Date().getTimezoneOffset() / 60  // độ lệch múi giờ so với UTC của máy hiện tại
  const location = useLocation();
  const searchContext = useContext(SearchContext);
  const [destination, setDestination] = useState(searchContext.destination);
  const [dates, setDates] = useState(searchContext.dates);
  const [openDate, setOpenDate] = useState(false);
  const [options, setOptions] = useState(searchContext.options);
  const [suggestedDestination, setSuggestedDestination] = useState([]);
  const [min, setMin] = useState(100);
  const [max, setMax] = useState(100000);
  const [type, setType] = useState(location.state?.typeFromPropertyList ?? "");
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [sortOrder, setSortOrder] = useState('random');
  // console.log(dates)
  const { data, loading, error, reFetch } = useFetch(
    `/hotels?city=${destination}&type=${type}`
  );
  const { dispatch } = useContext(SearchContext);
  // checkbox facilities
  const handleCheckboxChange = (facility) => {
    setSelectedFacilities((prevSelected) => {
      // nếu người dùng tích cái đã có - tức bỏ nó đi thì bỏ nó khỏi mảng
      if (prevSelected.includes(facility)) {
        return prevSelected.filter((item) => item !== facility);
      } else {
        return [...prevSelected, facility];
      }
    });
  };
  // console.log(selectedFacilities)
  // gợi ý tìm kiếm
  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
    if (e.target.value) {
      const filteredSuggestions = listProvinces.filter(province =>
        province.name.toLowerCase().startsWith(e.target.value.toLowerCase())
      ).map(province => province.name);
      setSuggestedDestination(filteredSuggestions);
    } else {
      setSuggestedDestination([]);
    }
  };
  const handleSuggestionClick = (suggestion) => {
    setDestination(suggestion);
    setSuggestedDestination([]);
  };

  // loại chỗ nghỉ
  const handleChangeType = (event) => {
    setType(event.target.value);
  };
  const handleClick = () => {
    reFetch();
    dispatch({ type: "NEW_SEARCH", payload: { destination, dates, options } });
  };

  useEffect(() => {
    // console.log("Updated changes:", dates);
    dispatch({ type: "NEW_SEARCH", payload: { destination, dates, options } });
  }, [destination, dates, options]);


  const handleDayChange = (item) => {
    const utc = new Date().getTimezoneOffset() / 60 //-7
    const newSelection = { ...item.selection };
    let { startDate, endDate } = newSelection;
    if (startDate === endDate) {
      // nếu người dùng chỉ chọn 1 ngày
      endDate = addDays(new Date(startDate), 1);
    }
    // 14+ getTimezoneOffset Múi giờ lệch ở khách sạn mà nó đặt -dùng addHours
    startDate = addHours(startDate, 7 - utc);
    endDate = addHours(endDate, 7 - utc);
    setDates([{ ...newSelection, startDate, endDate }]);
  };

  const handleOptionChange = (e, optionName) => {
    const value = e.target.value;
    setOptions(prevOptions => ({
      ...prevOptions,
      [optionName]: value
    }));
  };

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  function dayDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
    return diffDays;
  }
  const days = dayDifference(dates[0].endDate, dates[0].startDate);

  // tính giá hiển thị theo phòng rẻ nhất của ks và lựa chọn của người dùng, ko hiện những phòng chưa có phòng- phép chia cho 0-cheapestPrice.people
  const calculatePrice = (cheapestPrice) => {
    let totalPrice = 0;
    let totalPeople = parseInt(options.adult, 10) + parseFloat(options.children) * 0.5;

    // nếu số lượng phòng ng dùng chọn đã >= 
    if (options.room > Math.floor(totalPeople / cheapestPrice.people)) {
      totalPrice = cheapestPrice.price * options.room * days;
    } else
      // console.log(totalPeople)
      // nếu số người =1 hoặc quá ít 1/2=0
      if (Math.floor(totalPeople / cheapestPrice.people) == 0) {
        totalPrice = cheapestPrice.price * days;
      } else {
        //new Intl.NumberFormat('vi-VN').format(params.value*1000)
        totalPrice = cheapestPrice.price * Math.floor(totalPeople / cheapestPrice.people) * days;
      }
    return totalPrice
  };

  // sort giá
  const handleSortChange = (event) => {
    setSortOrder(event.target.value); // Cập nhật state khi người dùng thay đổi cách sắp xếp
  };

  const renderSearchItem = () => {
    const filteredData = data
      // sắp xếp theo giá
      .sort((a, b) => {
        const priceA = calculatePrice(a.cheapestPrice);
        const priceB = calculatePrice(b.cheapestPrice);
        if (sortOrder === 'asc') {
          return priceA - priceB;
        } else if (sortOrder === 'desc') {
          return priceB - priceA;
        } else if (sortOrder === 'random') {
          // nếu người dùng ko sort theo giá thì sẽ sort theo tổng số lượng phòng (nếu options.room>4 còn ko thì random)
          if (options.room > 4) {
            return b.totalRooms - a.totalRooms;
          }
          return Math.random() - 0.5;
        }
      })
      // lấy ra các phần tử trong khoảng giá - calculatePrice là tính giá theo option người dùng như ngày, số phòng...
      // lấy theo giá phòng rẻ nhất của chỗ nghỉ đó
      .filter((item) => calculatePrice(item.cheapestPrice) >= min && calculatePrice(item.cheapestPrice) <= max)
      // lọc theo cơ sở vật chất
      .filter(hotel => {
        // trả về true nếu tất cả phần tử thỏa mãn - lấy ra các phần tử có facility người dùng tích
        return selectedFacilities.every(facility => hotel.facilities?.includes(facility));
      });

    if (filteredData.length === 0) {
      return <p>Không có chỗ nghỉ thỏa mãn yêu cầu của bạn.</p>;
    }
    return filteredData.map((item) => (
      <SearchItem item={item} key={item._id} />
    ));
  }



  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          <div className="listSearch">
            <h1 className="lsTitle">Tìm kiếm</h1>
            <div className="lsItem">
              <label>Địa điểm</label>
              <input placeholder={destination} value={destination} onChange={handleDestinationChange} type="text" />
              {suggestedDestination.length > 0 && (
                // style inline để đè 1 số cái khác so với header, css còn lại ở header.css
                <div className="suggestionDestination" style={{ width: '94%' }}>
                  <div className="suggestionsList">
                    {suggestedDestination.map((suggestion, index) => (
                      <div
                        key={index}
                        style={{  }}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="lsItem">
              <label>Check-in</label>
              <span onClick={() => setOpenDate(!openDate)}>{`${format(
                dates[0].startDate,
                "dd/MM/yyyy"
              )} đến ${format(dates[0].endDate, "dd/MM/yyyy")}`}</span>
              {openDate && (
                <DateRange
                  onChange={(item) => handleDayChange(item)}
                  moveRangeOnFirstSelection={true}
                  minDate={addHours(new Date(),10+(-7-timeZone))} // ngày tối thiểu đc chọn, 
                  maxDate={addDays(new Date(),365)}
                  ranges={dates}
                />
              )}
            </div>

            {/* CHon loai cho nghi */}
            <div className="lsItem">
              <label>Chọn loại chỗ nghỉ</label>
              <select style={{ height: '25px' }}
                id='type'
                onChange={handleChangeType}
                value={type}
              >
                <option value="">Tất cả</option> {/* Option mặc định */}
                <option value="Khách sạn">Khách sạn</option> {/* Các option của dropdown */}
                <option value="Căn hộ">Căn hộ</option>
                <option value="Biệt thự">Biệt thự</option> {/* Các option của dropdown */}
                <option value="Resort">Resort</option>
                <option value="Nhà nghỉ">Nhà nghỉ</option>
              </select>
            </div>


            <div className="lsItem">
              {/*  chinh gia tien */}
              <label>Khoảng giá (theo giá loại phòng rẻ nhất của chỗ nghỉ) </label>
              <div className="lsOptions">
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Từ <small></small>
                  </span>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <div>({Intl.NumberFormat('vi-VN').format(min * 1000)} VND)</div>
                    <input
                      type="number"
                      min="0"
                      value={min}
                      onChange={(e) => {
                        const value = Math.max(0, e.target.value);
                        setMin(value);
                      }}
                      className="lsOptionInput"
                    />
                  </div>
                </div>

                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Đến <small></small>
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <div>({Intl.NumberFormat('vi-VN').format(max * 1000)} VND)</div>
                    <input
                      type="number"
                      value={max}
                      min="0"
                      onChange={(e) => setMax(e.target.value)}
                      className="lsOptionInput"
                    />
                  </div>
                </div>

              </div>
            </div>
            {/* đang css tạm */}
            <div style={{ marginTop: '-15px' }} className="lsItem">
              {/*  chinh gia tien */}
              <label>Lựa chọn </label>
              <div className="lsOptions">
                <div className="lsOptionItem">

                  <span className="lsOptionText">Người lớn</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    placeholder={options.adult}
                    onChange={(e) => handleOptionChange(e, 'adult')}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Trẻ em</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    placeholder={options.children}
                    onChange={(e) => handleOptionChange(e, 'children')}

                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Phòng</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    placeholder={options.room}
                    onChange={(e) => handleOptionChange(e, 'room')}

                  />
                </div>
              </div>
            </div>

            <div className="lsItem">
              <label>Cơ sở vật chất chỗ nghỉ</label>
              {hotelFacilities.map((facility) => (
                <div className="lsItem_hotelFacilities" key={facility}>
                  <label>
                    <input
                      type="checkbox"
                      value={facility}
                      onChange={() => handleCheckboxChange(facility)}
                      checked={selectedFacilities?.includes(facility)}
                    />
                    {facility}
                  </label>
                </div>
              ))}
            </div>
            <button onClick={handleClick}>Tìm kiếm</button>
          </div>
          <div className="listResult">
            {/* dropdown sort theo giá */}
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
              <label>
                Sắp xếp theo giá:&nbsp;
                <select value={sortOrder} onChange={handleSortChange}>
                <option value="random">Ngẫu nhiên</option>
                  <option value="asc">Thấp đến cao</option>
                  <option value="desc">Cao đến thấp</option>
                </select>
              </label>
            </div>

            {loading ? (
              "Đang tải"
            ) : (
              <>

                {renderSearchItem()}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default List;