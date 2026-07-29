import React, { useState, useCallback, memo, useEffect } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import auth from '../authService';
import { useNavigate, useLocation, Link } from "react-router-dom";
import texts from "../texts/layout.json";
import "./Sidebar.css";

// ---------------------------------------------------------------------------
// SideBar â€” role-filtered navigation rail (desktop) / drawer (mobile).
//
// Public props:
//   user  â€“ authenticated user object with { role, user_id, ... }
//
// Sprint 1 notes:
//   - All sidebar/header-chrome styles moved to Sidebar.css.
//   - Generic `nav` selectors in App.css scoped to .navbar-container.
//   - TODO markers placed where Sprint 2 will extract reusable components.
// ---------------------------------------------------------------------------

function SideBar({ user }) {
  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // -----------------------------------------------------------------------
  // Hooks
  // -----------------------------------------------------------------------
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // -----------------------------------------------------------------------
  // Viewport detection â€” match Bootstrap lg breakpoint (â‰¤ 991px = mobile)
  // -----------------------------------------------------------------------
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 991;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);  // mobile starts closed, desktop starts open
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // -----------------------------------------------------------------------
  // Close drawer on route change (mobile UX)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [currentPath, isMobile]);

  // -----------------------------------------------------------------------
  // Lock body scroll while mobile drawer is open
  // TODO (Sprint 3): Remove when Offcanvas provides built-in scroll locking.
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [isMobile, isSidebarOpen]);

  // -----------------------------------------------------------------------
  // Logout handler â€” POST /logout, clear token, redirect to /login
  // -----------------------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await auth.post("/logout");
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      localStorage.removeItem("jwtToken");
      delete axios.defaults.headers.common["Authorization"];
      navigate('/login');
    }
  }, [navigate]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <>
      {/* ---- Hamburger toggle (mobile only) ---- */}
      {isMobile && (
        <button
          className={`hamburger-btn ${isSidebarOpen ? 'is-open' : ''}`}
          aria-label="Abrir menÃº"
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen(v => !v)}
        >
          <span className="bar" />
        </button>
      )}

      {/* ---- Backdrop (mobile only) ---- */}
      {isMobile && (
        <div
          className={`mobile-backdrop ${isSidebarOpen ? 'show' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ---- Sidebar shell (desktop rail / mobile drawer) ---- */}
      {/* TODO (Sprint 2): Extract shared SidebarContent helper so desktop and
          mobile render identical filtered markup from a single source. */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Navbar variant="dark" className={texts.header.sidebar[0]["navbarClassname"]}>
          {/* ---- Logo ---- */}
          <Navbar.Brand
            onClick={() => setIsSidebarOpen(v => !v)}
            className={texts.header.sidebar[0]["Navbar.BrandClassName"]}
          >
            <img src="/img/Picture1.svg" alt="CAE-logo" className="nav-logo" />
          </Navbar.Brand>

          {/* ---- Primary navigation items ---- */}
          {/* TODO (Sprint 2): Extract SidebarNavItem for reusable icon+label row markup. */}
          <Nav className={texts.header.sidebar[0]["navLinksClassName"]}>
            {texts.header.sidebar[0]["links"]
              .filter(link => (link.role ? link.role.includes(user.role) : true))
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

          {/* ---- Account actions (Settings / Logout) ---- */}
          <Nav className={texts.header.sidebar[0]["logoutButtonClassName"]}>
            {texts.header.sidebar[0]["settings"].map((setting, index) =>
              setting.label === "Logout" ? (
                <Nav.Link key={index} onClick={logout}>
                  <i className={`${setting.icon} ${currentPath === setting.url ? "active" : ""}`} />
                  <p>{setting.label}</p>
                </Nav.Link>
              ) : (
                <Link
                  key={index}
                  to={`${setting.url}/${user.user_id}`}
                  className={`nav-link ${currentPath.startsWith(setting.url) ? "active" : ""}`}
                >
                  <i className={`${setting.icon}`} />
                  <p>{setting.label}</p>
                </Link>
              )
            )}
          </Nav>
        </Navbar>
      </div>
    </>
  );
}

export default memo(SideBar);
