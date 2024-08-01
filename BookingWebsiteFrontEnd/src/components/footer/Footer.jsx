import "./footer.css";
import React from "react";
const Footer = () => {
  return (
    <div className="footer">


      <div className="footerContainer">
        <div className="fLists">
          <ul className="fList">
            <li className="fListItem">Theo dõi chúng tôi trên </li>
            <li className="fListItem">Facebook </li>
            <li className="fListItem">Youtube </li>
            <li className="fListItem">Instagram</li>
            <li className="fListItem">Telegram</li>

          </ul>
          <ul className="fList">
            <li className="fListItem">Đặt phòng khách sạn: 0938473948 </li>
            <li className="fListItem">Tư vấn đặt phòng: 0847583758</li>
            <li className="fListItem">Tổng đài hỗ trợ: 3849573293 </li>
            <li className="fListItem">Địa điểm trụ sở: 374 đường ABC, Hai Bà Trưng, Hà Nội</li>
            {/* <li className="fListItem">Seasonal and holiday deals </li> */}
          </ul>
          <ul className="fList">
            <li className="fListItem">Chính sách và quy định </li>
            <li className="fListItem">Quyền riêng tư</li>
            <li className="fListItem">Điều khoản, điều kiện </li>
            <li className="fListItem">Quy chế hoạt động</li>
          </ul>

        </div>

      </div>
    </div>
  );
};

export default Footer;