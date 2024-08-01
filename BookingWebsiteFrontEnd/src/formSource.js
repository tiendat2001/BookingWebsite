export const hotelInputs = [
    {
      id: "name",
      label: "Tên của",
      type: "text",
      placeholder: "",
    },
    // {
    //   id: "type",
    //   label: "Type",
    //   type: "text",
    //   placeholder: "",
    // },
    {
      id: "city",
      label: "Tỉnh thành",
      type: "text",
      placeholder: `(Hãy viết đúng chính tả để người dùng có thể tìm được chỗ nghỉ của bạn. VD: "Hà Nội", "Hồ Chí Minh"`,
    },
    {
      id: "address",
      label: "Địa chỉ của",
      type: "text",
      placeholder: "",
    },
    {
      id: "distance",
      label: "Khoảng cách từ trung tâm đến(m)",
      type: "number",
      placeholder: "",
    },
    {
      id: "hotelContact",
      label: "Số điện thoại liên lạc của ",
      type: "number",
      placeholder: "Số điện thoại để khách có thể gọi cho bạn sau khi đặt phòng thành công",
    },
    // {
    //   id: "desc",
    //   label: "Description",
    //   type: "text",
    //   placeholder: "description",
    // },
 
  ];

  export const roomInputs = [
    {
      id: "title",
      label: "Tên loại phòng (hay loại căn hộ, biệt thự,...) của bạn",
      type: "text",
      placeholder: "VD: Phòng Deluxe giường đôi, Căn hộ 2 ngủ,...",
    },
    {
      id: "maxPeople",
      label: "Số người",
      type: "number",
      placeholder: "Số người cho loại phòng (hay loại căn hộ, biệt thự,...) này",
    },
    {
      id: "price",
      label: "Giá mỗi đêm (Đơn vị: nghìn đồng. Ví dụ giá 250.000 VND thì hãy ghi 250)",
      type: "number",
      placeholder: "",
    },
    {
      id: "roomNumbers",
      label: "Số lượng",
      type: "number",
      placeholder: "Số lượng phòng (hay căn hộ, biệt thự,...) bạn muốn bán cho loại phòng (hay loại căn hộ, biệt thự,...) này",
    },
    
    // {
    //   id: "desc",
    //   label: "Description",
    //   type: "text",
    //   placeholder: "description",
    // },
 
  ];

  export const hotelFacilities = 
  [
    "Free Wifi",
    "Chỗ đậu xe",
    "Miễn phí ăn sáng",
    "Bể bơi",
    "Phòng tập Gym",
    "Spa"
  ]