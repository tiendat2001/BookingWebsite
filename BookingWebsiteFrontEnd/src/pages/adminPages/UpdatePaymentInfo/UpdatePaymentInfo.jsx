
import React from 'react'
import "./updatePaymentInfo.css"
import Sidebar from '../../../components/adminComponents/sidebar/Sidebar'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import useFetch from '../../../hooks/useFetch'
import { useState } from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
const UpdatePaymentInfo = () => {
  const { data: dataUser, loading, error } = useFetch(`/users/getUserByTokenId`);
  const [info, setInfo] = useState(dataUser);
  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const submitChange = async (e) => {
    e.preventDefault();
    const Success = await axios.put(`/api/users`, info);
    if (Success) {
      toast.success('Thành công chỉnh sửa!');
    } else {
      toast.error("Error.Please try again");
    }
  }
  useEffect(() => {
    if (dataUser) {
      setInfo(dataUser);
    }
  }, [dataUser]);
  return (
    <div className="listAdmin">
      <Sidebar />
      <div className="listContainerAdmin">
        <NavbarAdmin />

        <div className="updatePaymentContainer">
          <h1>Cập nhật thông tin tài khoản nhận thanh toán</h1>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="updatePaymentContainer_input">
              <input
                type="text"
                id="paymentInfo"
                value={info.paymentInfo}
                onChange={handleChange}
              />
              <button onClick={submitChange}>Cập nhật</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpdatePaymentInfo

