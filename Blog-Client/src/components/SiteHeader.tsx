import type React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./site.css";

const SiteHeader: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const onLogout = () => {
    logout();
    if (location.pathname !== "/") {
      window.location.href = "/";
    }
  };

  return (
    <header className="siteHeader">
      <div className="siteContainer">
        <div className="siteHeaderInner">
          <Link to="/" className="brand" aria-label="Ana sayfa">
            <span className="brandMark" aria-hidden="true" />
            <span className="brandText">
              <span className="brandName">Modern Blog</span>
              <span className="brandTag">Yaz, paylaş, keşfet</span>
            </span>
          </Link>

          <nav className="navRow" aria-label="Üst menü">
            <Link to="/blog" className="navLink">
              Keşfet
            </Link>
            <Link to="/blog" className="navLink">
              Yazılar
            </Link>

            {isAuthenticated ? (
              <>
                <span className="muted" style={{ fontSize: 13 }}>
                  {user?.fullName || user?.email}
                </span>
                <Link to="/app" className="btn btnPrimary">
                  Panel
                </Link>
                <button type="button" className="btn btnDanger" onClick={onLogout}>
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn">
                  Giriş
                </Link>
                <Link to="/register" className="btn btnPrimary">
                  Kayıt ol
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;

