import { createContext, useReducer } from "react";
import React from "react";
import { format,addDays,addHours  } from "date-fns";
const utc = new Date().getTimezoneOffset() / 60 //-7
// nếu qua 14h thì mặc định để  khoảng ngày là ngày tới + ngày tiếp theo
const currentDate = addHours(new Date(),10+(-7-utc));
currentDate.setHours(0, 0, 0, 0);
const startDate = addHours(currentDate, 7 - utc);
const INITIAL_STATE = {
  destination: "Hà Nội",
  dates: [
    {
      // nếu máy ở múi giờ VN thì đang là 14h
      startDate: startDate,
      endDate: addDays(startDate, 1),
      key: "selection",
    },
  ],
  options: {
    adult: 2,
    children: 0,
    room: 1,
  },
};

export const SearchContext = createContext(INITIAL_STATE);

const SearchReducer = (state, action) => {
  switch (action.type) {
    case "NEW_SEARCH": // MÕI KHI thay đổi thông tin thanh search
      return action.payload; // GỒM CITY, DATE RANGE, OPTION
    case "RESET_SEARCH":
      return INITIAL_STATE;
    default:
      return state;
  }
};

export const SearchContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(SearchReducer, INITIAL_STATE);

  return (
    <SearchContext.Provider
      value={{
        destination: state.destination,
        dates: state.dates,
        options: state.options,
        dispatch,  // dispatch khi muốn dùng SearchReducer
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};