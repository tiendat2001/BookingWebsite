import useFetch from "../../hooks/useFetch";
import { DateRange } from "react-date-range";
import { useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import { format,addDays } from "date-fns";
import "./featured.css";
import React from "react";
import { SearchContext } from "../../context/SearchContext";
import { listProvinces } from "../../listObject";
const Featured = () => {
  // phân loại theo địa điểm
  const { data, loading, error } = useFetch(
    "/hotels/countByCity"
  );
  const searchContext = useContext(SearchContext);
  const [destination, setDestination] = useState(searchContext.destination);
  const [dates, setDates] = useState(searchContext.dates);
  const [options, setOptions] = useState(searchContext.options);

  const navigate = useNavigate();
  const { dispatch } = useContext(SearchContext);

  function handleSearch(destination) {
    dispatch({ type: "NEW_SEARCH", payload: { destination, dates, options } });
    navigate("/hotels", );
  }

  const getImageProvinceUrl = (provinceName) =>{
    const provinceFound = listProvinces.find(province => province.name == provinceName)
    return provinceFound?.imageUrl
  }
  return (
    <div className="featured">
      {loading ? (
        "Loading please wait"
      ) : (
        // dấu <> thay cho react fragment - = với việc tạo 1 div lồng ra ngoài
        <> 
          <div
            className="featuredItem"
            onClick={() => handleSearch(data[0].city)}
          >
            <img
              src={getImageProvinceUrl(data[0]?.city)}
              alt=""
              className="featuredImg"
            />
            <div className="featuredTitles">
            <h1>{data[0]?.city}</h1>
              <h2>{data[0]?.quantity} chỗ nghỉ</h2>
            </div>
          </div>

          <div className="featuredItem"  onClick={() => handleSearch(data[1].city)}>
            <img
              src={getImageProvinceUrl(data[1]?.city)}
              alt=""
              className="featuredImg"
            />
            <div
              className="featuredTitles"
             
            >
               <h1>{data[1]?.city}</h1>
              <h2>{data[1]?.quantity} chỗ nghỉ</h2>
            </div>
          </div>

          <div className="featuredItem"  onClick={() => handleSearch(data[2].city)}>
            <img
              src={getImageProvinceUrl(data[2]?.city)}
              alt=""
              className="featuredImg"
            />
            <div
              className="featuredTitles"
             
            >
                <h1>{data[2]?.city}</h1>
              <h2>{data[2]?.quantity} chỗ nghỉ</h2>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Featured;
