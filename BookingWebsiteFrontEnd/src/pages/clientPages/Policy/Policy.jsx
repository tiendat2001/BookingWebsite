import React from 'react'
import "./policy.css"
import Navbar from '../../../components/navbar/Navbar'
import Header from '../../../components/header/Header'
const Policy = () => {
    return (
        <div>
            <Navbar />
            <Header type="list" />
            <div className="policyContainer">
                <h1>Các chính sách</h1>
                <h2>Chính sách hủy</h2>
                <p>Để tránh các vấn đề đặt phòng do nhầm lẫn, chúng tôi tự động miễn phí hủy cho các khách
                    hủy trong vòng 24 giờ kể từ thời điểm đặt. <br />
                    Trong khoảng thời gian 3 ngày trước ngày nhận phòng, quý khách sẽ bị tính phí cho giá đêm đầu nếu hủy đơn đặt phòng.
                    Quý khách vui lòng cân nhắc kỹ trước khi quyết định hủy đơn đặt phòng.<br />
                    Đối với chủ chỗ nghỉ, nếu vì một lý do đặc biệt (như phòng bất chợt bị hỏng hóc không thể phục vụ khách), quý vị có thể
                    yêu cầu khách hủy đơn đặt phòng trong mục "Đơn đặt phòng" và bấm vào nút "Yêu cầu hủy". Khách sẽ nhận được email thông báo
                    về yêu cầu hủy của quý khách. Tuy nhiên lưu ý rằng đơn đặt phòng vẫn sẽ có hiệu lực cho đến khi khách xác nhận hủy đơn đặt phòng.
                    Trong trường hợp khách này nếu khách đồng ý hủy đơn đặt phòng, khách sẽ không mất phí hủy và quý vị không nhận được phí hủy.
                </p>

                {/* <h2>Chính sách thanh toán</h2>
                <p>Để đặt phòng, quý khách có thể chọn 2 phương thức thanh toán: thanh toán qua thẻ ATM nội địa hoặc thanh toán qua thẻ
                    VISA. Đối với những đơn đặt phòng đã hủy, tiền sẽ được hoàn lại vào tài khoản của quý khách trong khoảng thời gian 30 ngày
                    kể từ ngày đặt.
                </p> */}

                <h2>Chính sách hoa hồng</h2>
                <p>Đối với đối tác của chúng tôi(chủ những khách sạn và chỗ nghỉ), chúng tôi sẽ tính phí 10% hoa hồng cho mỗi đơn đặt phòng thành
                    công của quý khách. Phí hoa hồng này cũng được áp dụng cho phí hủy của những đơn hủy không trong diện hủy miễn phí. Tiền của quý vị
                    sẽ được thanh toán trong 10 ngày đầu tiên của mỗi tháng, quý khách có thể cập nhật tài khoản nhận thanh toán của quý khách
                    tại đây     <a href="/admin/updatePaymentInfo">Cập nhật thông tin thanh toán</a>
                </p>
            </div>
        </div>
    )
}

export default Policy
