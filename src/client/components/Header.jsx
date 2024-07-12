import React, { useState, useEffect } from "react";
import { Link, useOutletContext, Outlet } from "react-router-dom";
import SideBar from "./Sidebar";

const Header = () => {
    const { user } = useOutletContext();

    return(
        <>
        <div className="heading">
            <div className="heading-phrase">
            <p>Writing Studio Center</p>
            </div>
            <div className="user-welcome">
                <i className='bx bx-user user-icon'></i>
                <Link to={`/profile/${user.user_id}`} className="user-link">{user ? user.first_name+ ' ' +user.last_name : "User"}</Link>
            </div>
      </div>
      <SideBar/>
        </>
    );
}

export default Header;