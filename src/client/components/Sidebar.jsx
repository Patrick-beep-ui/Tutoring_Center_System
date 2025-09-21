import React, { useState, useCallback, memo, useEffect } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import texts from "../texts/layout.json";

function SideBar({ user }) {
  // En desktop abierto, en móvil cerrado (se calcula abajo)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Detecta viewport y actualiza estados
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 991; // breakpoint ~ lg
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile); // móvil: cerrado; desktop: abierto
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Cierra el drawer al cambiar de ruta (mejor UX)
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [currentPath, isMobile]);

  // Bloquea scroll del body cuando el drawer está abierto en móvil
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [isMobile, isSidebarOpen]);

  const logout = useCallback(async () => {
    try {
      await axios.post("/logout");
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      localStorage.removeItem("jwtToken");
      delete axios.defaults.headers.common["Authorization"];
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>
      {/* Botón hamburguesa fijo SOLO en móvil */}
      {isMobile && (
        <button
          className={`hamburger-btn ${isSidebarOpen ? 'is-open' : ''}`}
          aria-label="Abrir menú"
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen(v => !v)}
        >
          <span className="bar" />
        </button>
      )}

      {/* Backdrop para cerrar tocando fuera */}
      {isMobile && (
        <div
          className={`mobile-backdrop ${isSidebarOpen ? 'show' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: en móvil actúa como drawer */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Navbar variant="dark" className={texts.header.sidebar[0]["navbarClassname"]}>
          {/* En desktop sigue togglenado el ancho, en móvil abrimos/cerramos drawer */}
          <Navbar.Brand
            onClick={() => setIsSidebarOpen(v => (isMobile ? !v : !v))}
            className={texts.header.sidebar[0]["Navbar.BrandClassName"]}
          >
            <img src="/img/Picture1.svg" alt="CAE-logo" className="nav-logo" />
          </Navbar.Brand>

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
