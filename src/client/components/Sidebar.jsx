import React, { useState, useCallback, memo, useEffect } from 'react';
import axios from "axios";
import auth from '../authService';
import { useNavigate, useLocation, Link } from "react-router-dom";
import texts from "../texts/layout.json";

// ---------------------------------------------------------------------------
// SideBar — role-filtered navigation rail (desktop) / drawer (mobile).
//
// Public props:
//   user  – authenticated user object with { role, user_id, ... }
//
// ---------------------------------------------------------------------------

const MOBILE_NAV_QUERY = '(max-width: 991.98px)';

const navbarClass = [
  'relative flex! min-h-full w-full flex-col! flex-nowrap! items-stretch! justify-between overflow-x-hidden',
  'bg-blue pt-0! pr-0 pb-4! pl-0',
].join(' ');

const brandClass = [
  'box-border flex w-full items-center justify-center whitespace-nowrap text-[1.25rem] text-white! no-underline',
  'cursor-pointer border-0 bg-transparent',
  'mt-0! mr-0 mb-0! ml-0 pt-6 pr-4 pb-4! pl-4',
  'max-[991.98px]:mb-1! max-[991.98px]:pt-5 max-[991.98px]:pb-[14px]!',
  'max-[991.98px]:border-b max-[991.98px]:border-b-[rgba(255,255,255,0.12)]',
].join(' ');

const primaryNavClass = 'm-0! flex! w-full min-w-0 flex-col! items-stretch! p-0!';

const accountNavClass = [
  'mt-auto! mr-0 mb-0! ml-0 flex! w-full min-w-0 shrink-0 flex-col! items-stretch!',
  'border-t border-t-[rgba(255,255,255,0.16)]',
  'pt-3! pr-0 pb-0! pl-0',
  'max-[991.98px]:pt-[10px]! max-[991.98px]:pb-1!',
].join(' ');

const navRowClass = [
  'box-border flex! min-h-12 w-full min-w-0 shrink-0 cursor-pointer items-center border-0! border-l-[3px]!',
  'pt-0! pr-4 pb-0! pl-4 text-sm font-normal text-white! no-underline',
  '[transition:background-color_0.18s_ease,border-color_0.18s_ease]',
  'hover:text-white!',
  'visited:text-white!',
  'focus-visible:outline-[2px]! focus-visible:outline-yellow! focus-visible:outline-offset-[-2px]!',
  'focus-visible:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]!',
  'max-[991.98px]:min-h-[52px] max-[991.98px]:pr-5 max-[991.98px]:pl-5',
  'motion-reduce:[transition-duration:1ms]',
].join(' ');

const inactiveNavRowClass = [
  'border-l-transparent! bg-transparent!',
  'hover:bg-[rgba(255,255,255,0.08)]!',
].join(' ');
const activeNavRowClass = [
  'border-l-yellow! bg-[rgba(255,255,255,0.1)]!',
  'hover:bg-[rgba(255,255,255,0.1)]!',
].join(' ');

const navIconClass = 'mr-3 flex! w-[22px] shrink-0 items-center justify-center text-[1.1rem] text-white!';
const navLabelClass = 'm-0! min-w-0 flex-1 truncate text-left text-[inherit] leading-[1.35] text-white!';

const hamburgerClass = [
  'fixed top-2 z-[3100] inline-flex h-12 w-12 touch-manipulation cursor-pointer',
  'items-center justify-center rounded-lg border!',
  '[transition:left_220ms_cubic-bezier(0.2,0.8,0.2,1),background-color_160ms_ease-out,border-color_160ms_ease-out]',
  'focus-visible:outline-[2px]! focus-visible:outline-yellow! focus-visible:outline-offset-[-3px]!',
  'motion-reduce:[transition-duration:1ms]',
].join(' ');

const hamburgerOpenClass = [
  'left-[calc(min(80vw,304px)-52px)]',
  'border-[rgba(255,255,255,0.28)]! bg-[rgba(255,255,255,0.1)]!',
].join(' ');

const hamburgerClosedClass = [
  'left-2 border-transparent! bg-transparent!',
  'hover:border-transparent! hover:bg-[rgba(25,45,100,0.08)]!',
].join(' ');

const hamburgerBarClass = [
  "relative block h-[2px] w-5 rounded-[2px] [content:'']",
  '[transition:transform_220ms_cubic-bezier(0.2,0.8,0.2,1),opacity_160ms_ease-out,top_220ms_cubic-bezier(0.2,0.8,0.2,1),background-color_160ms_ease-out]',
  "before:relative before:block before:h-[2px] before:w-5 before:rounded-[2px] before:content-['']",
  'before:[transition:transform_220ms_cubic-bezier(0.2,0.8,0.2,1),opacity_160ms_ease-out,top_220ms_cubic-bezier(0.2,0.8,0.2,1),background-color_160ms_ease-out]',
  "after:relative after:top-1 after:block after:h-[2px] after:w-5 after:rounded-[2px] after:content-['']",
  'after:[transition:transform_220ms_cubic-bezier(0.2,0.8,0.2,1),opacity_160ms_ease-out,top_220ms_cubic-bezier(0.2,0.8,0.2,1),background-color_160ms_ease-out]',
  'motion-reduce:[transition-duration:1ms] motion-reduce:before:[transition-duration:1ms] motion-reduce:after:[transition-duration:1ms]',
].join(' ');

const hamburgerBarOpenClass = [
  'bg-white! [transform:rotate(45deg)]',
  'before:top-0 before:bg-white! before:[transform:rotate(90deg)]',
  'after:bg-white! after:opacity-0 after:[transform:translateY(-4px)]',
].join(' ');

const hamburgerBarClosedClass = 'bg-[#222] before:top-[-6px] before:bg-[#222] after:bg-[#222]';

const backdropClass = [
  'fixed inset-0 z-[2990] bg-[rgba(8,16,39,0.32)]',
  'transition-opacity duration-[180ms] ease-out',
  'motion-reduce:duration-[1ms]',
].join(' ');

const backdropOpenClass = 'pointer-events-auto opacity-100!';
const backdropClosedClass = 'pointer-events-none opacity-0!';

const sidebarClass = [
  'fixed top-0 left-0 z-[1000] h-screen w-sidebar-width overflow-x-hidden overflow-y-auto bg-blue',
  'max-[991.98px]:z-[3000] max-[991.98px]:h-dvh max-[991.98px]:w-[min(80vw,304px)]',
  'max-[991.98px]:rounded-r-[18px] max-[991.98px]:shadow-[0_18px_48px_rgba(5,17,45,0.32)]',
  'max-[991.98px]:overscroll-contain max-[991.98px]:[-webkit-overflow-scrolling:touch]',
  'max-[991.98px]:will-change-transform',
  'max-[991.98px]:[transition:transform_220ms_cubic-bezier(0.2,0.8,0.2,1),box-shadow_220ms_ease-out]',
  'motion-reduce:[transition-duration:1ms]',
].join(' ');

const sidebarOpenClass = 'max-[991.98px]:[transform:translate3d(0,0,0)]';
const sidebarClosedClass = 'max-[991.98px]:[transform:translate3d(-100%,0,0)]';

function SideBar({ user }) {
  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------
  const getInitialMobileState = () =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_NAV_QUERY).matches;
  const [isMobile, setIsMobile] = useState(getInitialMobileState);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !getInitialMobileState());

  // -----------------------------------------------------------------------
  // Hooks
  // -----------------------------------------------------------------------
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // -----------------------------------------------------------------------
  // Viewport detection — match the CSS breakpoint exactly.
  // -----------------------------------------------------------------------
  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_NAV_QUERY);
    const check = ({ matches: mobile }) => {
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    check(mediaQuery);
    mediaQuery.addEventListener('change', check);
    return () => mediaQuery.removeEventListener('change', check);
  }, []);

  // -----------------------------------------------------------------------
  // Close drawer on route change (mobile UX)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [currentPath, isMobile]);

  // -----------------------------------------------------------------------
  // Lock body scroll while mobile drawer is open
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [isMobile, isSidebarOpen]);

  // -----------------------------------------------------------------------
  // Logout handler — POST /logout, clear token, redirect to /login
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
          type="button"
          className={`${hamburgerClass} ${isSidebarOpen ? hamburgerOpenClass : hamburgerClosedClass}`}
          aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isSidebarOpen}
          aria-controls="primary-sidebar"
          onClick={() => setIsSidebarOpen(v => !v)}
        >
          <span
            aria-hidden="true"
            className={`${hamburgerBarClass} ${isSidebarOpen ? hamburgerBarOpenClass : hamburgerBarClosedClass}`}
          />
        </button>
      )}

      {/* ---- Backdrop (mobile only) ---- */}
      {isMobile && (
        <div
          aria-hidden="true"
          className={`${backdropClass} ${isSidebarOpen ? backdropOpenClass : backdropClosedClass}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ---- Sidebar shell (desktop rail / mobile drawer) ---- */}
      <div
        id="primary-sidebar"
        className={`${sidebarClass} ${isSidebarOpen ? sidebarOpenClass : sidebarClosedClass}`}
      >
        <nav className={navbarClass} aria-label="Primary navigation">
          {/* ---- Logo ---- */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(v => !v)}
            className={brandClass}
            aria-label="Toggle navigation"
          >
            <img
              src="/img/Picture1.svg"
              alt="CAE-logo"
              className="block h-auto w-16 max-[991.98px]:w-[52px]"
            />
          </button>

          {/* ---- Primary navigation items ---- */}
          <div className={primaryNavClass}>
            {texts.header.sidebar[0]["links"]
              .filter(link => (link.role ? link.role.includes(user.role) : true))
              .map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  aria-current={currentPath === link.url ? 'page' : undefined}
                  className={`${navRowClass} ${currentPath === link.url ? activeNavRowClass : inactiveNavRowClass}`}
                >
                  <i className={`${link.icon} ${navIconClass}`}></i>
                  <p className={navLabelClass}>{link.label}</p>
                </a>
              ))}
          </div>

          {/* ---- Account actions (Settings / Logout) ---- */}
          <div className={accountNavClass}>
            {texts.header.sidebar[0]["settings"].map((setting, index) =>
              setting.label === "Logout" ? (
                <button type="button" key={index} onClick={logout} className={`${navRowClass} ${inactiveNavRowClass}`}>
                  <i className={`${setting.icon} ${navIconClass}`} />
                  <p className={navLabelClass}>{setting.label}</p>
                </button>
              ) : (
                <Link
                  key={index}
                  to={`${setting.url}/${user.user_id}`}
                  aria-current={currentPath.startsWith(setting.url) ? 'page' : undefined}
                  className={`${navRowClass} ${currentPath.startsWith(setting.url) ? activeNavRowClass : inactiveNavRowClass}`}
                >
                  <i className={`${setting.icon} ${navIconClass}`} />
                  <p className={navLabelClass}>{setting.label}</p>
                </Link>
              )
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

export default memo(SideBar);
