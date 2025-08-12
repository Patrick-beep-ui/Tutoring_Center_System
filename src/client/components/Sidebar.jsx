import React, {useCallback, memo, useEffect} from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { useNavigate, useLocation, matchPath, Link } from "react-router-dom";
import texts from "../texts/layout.json";


function SideBar({user}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  console.log("Location:", currentPath);
  console.log("User on Sidebar:", user.role);

  useEffect(() => {
    console.log("Location:", currentPath);
    console.log(currentPath.startsWith("/settings"));
  }, [])

  const logout = useCallback(async () => {
    try {
        await axios.post("/logout"); 
    } catch (e) {
        console.error("Logout error:", e);
    } finally {
        localStorage.removeItem("jwtToken");
        delete axios.defaults.headers.common["Authorization"];
        console.log("Logged out");
        navigate('/login');
    }
}, []);


  return (
    <div className='sidebar'>
      <Navbar variant="dark" className={texts.header.sidebar[0]["navbarClassname"]} >

        <Navbar.Brand href="#home" className={texts.header.sidebar[0]["Navbar.BrandClassName"]} x>
          <img src="/img/Picture1.svg" alt="CAE-logo" />
        </Navbar.Brand>

        <Nav className={texts.header.sidebar[0]["navLinksClassName"]}>
          {texts.header.sidebar[0]["links"]
            .filter(link => {
              // If the link has a role array → check if the user's role is in it
              if (link.role) {
                return link.role.includes(user.role);
              }
              // If no role restriction → always show
              return true;
            })
            .map((link, index) => (
              <Nav.Link
                key={index}
                href={link.url}
                className={
                  currentPath === link.url
                    ? texts.header.sidebar[0]["activeLinkClassName"]
                    : ""
                }
              >
                <i className={link.icon}></i> <p>{link.label}</p>
              </Nav.Link>
            ))}
        </Nav>


        <Nav className={texts.header.sidebar[0]["logoutButtonClassName"]}>
          {texts.header.sidebar[0]["settings"].map((setting, index) => (
            setting.label === "Logout" ? (
              <Nav.Link key={index} onClick={logout}>
                <i className={`${setting.icon} ${currentPath === setting.url ? "active" : ""}`}
                ></i> <p>{setting.label}</p>
              </Nav.Link>
            ) : (
              console.log("Setting Url:", setting.url),
              <Link key={index} to={`${setting.url}/${user.user_id}`} className={`nav-link ${currentPath.startsWith(setting.url) ? "active" : ""}`}>
                <i className={`${setting.icon}`}></i> <p>{setting.label}</p>
              </Link>
            )
          ))}
        </Nav>

      </Navbar>
    </div>
  );
}

export default memo(SideBar);
