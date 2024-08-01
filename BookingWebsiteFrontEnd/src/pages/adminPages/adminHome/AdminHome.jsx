import React from 'react'
import { useContext } from 'react'
import { AuthContext } from '../../../context/AuthContext'
import Sidebar from '../../../components/adminComponents/sidebar/Sidebar'
import NavbarAdmin from '../../../components/adminComponents/navbarAdmin/NavbarAdmin'
import './adminHome.css'
const AdminHome = () => {

  const { user, dispatch } = useContext(AuthContext) // {user._id}
  return (

    <div className="listAdmin">
      <Sidebar />
      <div className="listContainerAdmin">
        <NavbarAdmin />
        {/* <h1>bang</h1> */}
      </div>
    </div>
  )
}

export default AdminHome
