import React, { createContext, useState, useEffect, useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Picture1 from "/img/Picture1.svg";

function SideBar() {
    return (
        <div className='sidebar'>
          <Navbar variant="dark" className="flex-column nav-menu" style={{ minHeight: '100vh' }}>
            <Navbar.Brand href="#home" className='nav-logo'>
                <img src="/img/Picture1.svg" alt="CAE-logo" />
                </Navbar.Brand>
            <Nav className="flex-column nav-links">
              <Nav.Link href="/classes">
              <i class='bx bx-food-menu'></i></Nav.Link>
              <Nav.Link href="/tutors"><i class='bx bx-group'></i></Nav.Link>
              <Nav.Link href="/"><i class='bx bx-chalkboard'></i>
              </Nav.Link>
              <Nav.Link href="/report"><i class='bx bx-bar-chart'></i>
              </Nav.Link>
            </Nav>
            <Nav className='nav-setting'>
              <Nav.Link><i class='bx bx-cog'></i></Nav.Link>
            </Nav>
          </Navbar>
        </div>
      );
}

export default SideBar;