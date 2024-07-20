import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

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
      <Navbar variant="dark" className="flex-column nav-menu" style={{ minHeight: '100vh' }}>
        <Navbar.Brand href="#home" className='nav-logo'>
          <img src="/img/Picture1.svg" alt="CAE-logo" />
        </Navbar.Brand>
        <Nav className="flex-column nav-links">
          <Nav.Link href="/classes" className={currentPath === '/classes' ? 'active' : ''}>
            <i className='bx bx-food-menu'></i> <p>Courses</p>
          </Nav.Link>
          <Nav.Link href="/tutors" className={currentPath === '/tutors' ? 'active' : ''}>
            <i className='bx bx-group'></i> <p>Tutors</p>
          </Nav.Link>
          <Nav.Link href="/" className={currentPath === '/' ? 'active' : ''}>
            <i className='bx bx-chalkboard'></i> <p>Sessions</p>
          </Nav.Link>
          <Nav.Link href="/report" className={currentPath === '/report' ? 'active' : ''}>
            <i className='bx bx-bar-chart'></i> <p>Report</p>
          </Nav.Link>
        </Nav>
        <Nav className='nav-setting flex-column'>
          <Nav.Link>
            <i className='bx bx-cog'></i>
          </Nav.Link>
          <Nav.Link onClick={logout}>
            <i className='bx bx-door-open'></i> <p>Logout</p>
          </Nav.Link>
        </Nav>
      </Navbar>
    </div>
  );
}

export default SideBar;
