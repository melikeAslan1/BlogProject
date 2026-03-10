import type React from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import "./auth-pages.css";
import "../components/site.css";

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", {
        email,
        password,
        fullName: fullName.trim() || undefined,
      });

      const { token, email: outEmail, fullName: outFullName } = res.data;
      login(token, { email: outEmail, fullName: outFullName });
      navigate("/");
    } catch (err: any) {
      const data = err.response?.data;
      const msg = data?.message;
      const errors = data?.errors ?? data?.Errors;
      if (Array.isArray(errors) && errors.length) {
        setError(errors.join(" "));
      } else {
        if (typeof data === "string" && data.trim()) {
          setError(data);
        } else {
          setError(msg || "Kayıt başarısız. Lütfen tekrar deneyin.");
        }
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

        <h1 className="authTitle">Kayıt ol</h1>
        <p className="authSubtitle">Dakikalar içinde hesabını oluştur, blog dünyasına katıl.</p>

        <form className="authForm" onSubmit={onSubmit}>
          <label className="authField">
            <span className="authLabel">Ad Soyad</span>
            <input
              className="authInput"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="İsteğe bağlı"
              autoComplete="name"
            />
          </label>

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
                minLength={6}
                placeholder="En az 6 karakter"
                autoComplete="new-password"
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

          <label className="authField">
            <span className="authLabel">Şifre tekrar</span>
            <input
              className="authInput"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Şifreni tekrar gir"
              autoComplete="new-password"
            />
          </label>

          {error && <div className="authError">{error}</div>}

          <button type="submit" disabled={loading} className="authPrimaryBtn">
            {loading ? "Hesap oluşturuluyor…" : "Hesap oluştur"}
          </button>
        </form>

        <p className="authFooter">
          Zaten hesabın var mı?{" "}
          <Link to="/login" className="authLink">
            Giriş yap
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
