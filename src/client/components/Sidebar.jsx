import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import texts from "../texts/layout.json";


function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const logout = async () => {
    try {
      await axios.post("/logout");
      console.log("logged out");
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className='sidebar'>
      <Navbar variant="dark" className={texts.header.sidebar[0]["navbarClassname"]} style={{ minHeight: '100vh' }}>
        <Navbar.Brand href="#home" className={texts.header.sidebar[0]["Navbar.BrandClassName"]}>
          <img src="/img/Picture1.svg" alt="CAE-logo" />
        </Navbar.Brand>
        <Nav className={texts.header.sidebar[0]["navLinksClassName"]}>
          {texts.header.sidebar[0]["links"].map((link, index) => (
            <Nav.Link
              key={index}
              href={link.url}
              className={currentPath === link.url ? texts.header.sidebar[0]["activeLinkClassName"] : ''}
            >
              <i className={link.icon}></i> <p>{link.label}</p>
            </Nav.Link>
          ))}
        </Nav>
        <Nav className={texts.header.sidebar[0]["logoutButtonClassName"]}>
          {texts.header.sidebar[0]["settings"].map((setting, index) => (
            <Nav.Link key={index} onClick={setting.label === "Logout" ? logout : undefined}>
              <i className={setting.icon}></i> <p>{setting.label}</p>
            </Nav.Link>
          ))}
        </Nav>

      </Navbar>
    </div>
  );
}

export default SideBar;
