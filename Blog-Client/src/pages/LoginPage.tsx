import type React from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import "./auth-pages.css";
import "../components/site.css";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });

      const { token, email: outEmail, fullName } = res.data;
      login(token, { email: outEmail, fullName });
      navigate("/");
    } catch (err: any) {
      const data = err.response?.data;
      if (typeof data === "string" && data.trim()) {
        setError(data);
      } else {
        setError(data?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPageWrap">
      <SiteHeader />
      <div className="authPageMain">
        <div className="authCard">
        <div className="authBrand" aria-hidden="true">
          <div className="authLogo" />
          <div style={{ display: "grid", gap: 2 }}>
            <div style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Modern Blog</div>
            <div style={{ fontSize: 12, color: "rgba(226, 232, 240, 0.65)" }}>Yaz, paylaş, keşfet</div>
          </div>
        </div>

        <h1 className="authTitle">Giriş yap</h1>
        <p className="authSubtitle">Hesabına giriş yap ve blog akışına devam et.</p>

        <form className="authForm" onSubmit={onSubmit}>
          <label className="authField">
            <span className="authLabel">E-posta</span>
            <input
              className="authInput"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ornek@email.com"
              autoComplete="email"
            />
          </label>

          <label className="authField">
            <span className="authLabel">Şifre</span>
            <div className="authInputRow">
              <input
                className="authInput"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Şifreni gir"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="authGhostBtn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPassword ? "Gizle" : "Göster"}
              </button>
            </div>
          </label>

          {error && <div className="authError">{error}</div>}

          <button type="submit" disabled={loading} className="authPrimaryBtn">
            {loading ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>

        <p className="authFooter">
          Hesabın yok mu?{" "}
          <Link to="/register" className="authLink">
            Kayıt ol
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;