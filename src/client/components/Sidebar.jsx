import React, { createContext, useState, useEffect, useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Picture1 from "/img/Picture1.svg";

function SideBar() {
    return (
        <div className='sidebar'>
          <Navbar variant="dark" className="flex-column" style={{ minHeight: '100vh' }}>
            <Navbar.Brand href="#home" className='nav-logo'>
                <img src="/img/Picture1.svg" alt="CAE-logo" />
                </Navbar.Brand>
            <Nav className="flex-column nav-links">
              <Nav.Link href="#item1">
              <i class='bx bx-food-menu'></i></Nav.Link>
              <Nav.Link href="#item2">Item 2</Nav.Link>
              <Nav.Link href="#item3">Item 3</Nav.Link>
            </Nav>
          </Navbar>
        </div>
      );
}

export default SideBar;