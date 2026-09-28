import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;
  const displayName = user?.name || user?.email?.split("@")[0] || "Account";

  const handleLogout = async () => {
    await logout();
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex h-17 max-w-360 items-center justify-between px-4 sm:px-8">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="VidSeek AI dashboard">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
              <rect x="3" y="5" width="13" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 10 5-3v10l-5-3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <circle cx="9.5" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <span className="text-[17px] font-bold tracking-[-0.02em] text-slate-950">VidSeek <span className="text-blue-600">AI</span></span>
        </Link>

        {isAuthenticated && (
          <div className="hidden h-full items-center gap-1 sm:flex">
            <NavLink to="/" active={isActive("/")}>Dashboard</NavLink>
            <NavLink to="/videos" active={isActive("/videos")}>Videos</NavLink>
            <NavLink to="/about" active={isActive("/about")}>About</NavLink>
          </div>
        )}

        <div className="hidden items-center gap-3 sm:flex">
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-100 focus-visible:outline-offset-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold uppercase text-blue-800">{displayName.charAt(0)}</span>
                <span className="max-w-32 truncate text-sm font-semibold text-slate-700">{displayName}</span>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`h-4 w-4 text-slate-500 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}><path fillRule="evenodd" d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
              </button>
              {profileMenuOpen && (
                <div role="menu" className="absolute right-0 top-12 w-48 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button type="button" role="menuitem" onClick={handleLogout} className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 transition-colors hover:bg-red-50">Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">Sign in</Link>
              <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">Create account</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 sm:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-6 w-6">
            {mobileMenuOpen ? <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
          {isAuthenticated ? (
            <>
              <div className="mb-3 flex items-center gap-3 px-2 py-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold uppercase text-blue-800">{displayName.charAt(0)}</span>
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{displayName}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div>
              </div>
              <MobileLink to="/" active={isActive("/")} onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/videos" active={isActive("/videos")} onClick={() => setMobileMenuOpen(false)}>Videos</MobileLink>
              <MobileLink to="/about" active={isActive("/about")} onClick={() => setMobileMenuOpen(false)}>About</MobileLink>
              <button type="button" onClick={handleLogout} className="mt-2 w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-700 transition-colors hover:bg-red-50">Sign out</button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700">Sign in</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white">Create account</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ to, active, onClick, children }) {
  return <Link to={to} onClick={onClick} className={`relative flex h-full items-center px-4 text-sm font-semibold transition-colors after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors ${active ? "text-blue-700 after:bg-blue-600" : "text-slate-600 after:bg-transparent hover:text-slate-950"}`}>{children}</Link>;
}

function MobileLink({ to, active, onClick, children }) {
  return <Link to={to} onClick={onClick} className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"}`}>{children}</Link>;
}

export default Navbar;
