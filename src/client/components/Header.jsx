import React, { memo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import SideBar from "./Sidebar";
import texts from "../texts/layout.json";

const Header = () => {
    const { user } = useOutletContext();

    return(
        <>
        <div className="absolute z-[2] flex h-[72px] w-full items-center justify-between border-b-4 border-b-[#d7d7d3] bg-[#f4f4f4] max-[991.98px]:h-16">
            <div className="min-w-0 pl-sidebar-content-offset max-[991.98px]:pl-[68px]">
            <p className="m-0! truncate font-bold max-[991.98px]:text-[0.82rem] max-[374.98px]:text-[0.76rem]">{texts.header.title}</p>
            </div>
            <div className="flex min-w-0 items-center justify-end pr-4 max-[991.98px]:pr-3">
                <i className="bx bx-user p-0! text-[1.2rem] no-underline max-[991.98px]:text-base"></i>
                <Link
                    to={`/profile/${user.role}/${user.user_id}`}
                    className="ml-2 truncate p-0! no-underline visited:text-inherit max-[991.98px]:max-w-[92px] max-[991.98px]:text-[0.78rem] max-[374.98px]:max-w-[76px]"
                >
                    {user ? `${user.first_name} ${user.last_name}` : "User"}
                </Link>
            </div>
      </div>
      <SideBar user={user}/>
        </>
    );
}

export default memo(Header);
