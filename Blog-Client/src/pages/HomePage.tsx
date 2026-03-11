import type React from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import "../components/site.css";

const HomePage: React.FC = () => {
    const { user } = useAuth();

    return(
        <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e5e7eb" }}>
            <SiteHeader />

            <main style={{ padding: "28px 0 60px" }}>
                <div className="siteContainer">
                    <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em", color: "#f8fafc" }}>
                        Panel
                    </h1>
                    <p style={{ marginTop: 8, color: "rgba(226, 232, 240, 0.75)" }}>
                        Hoş geldin, <b>{user?.fullName ?? user?.email}</b>. Buradan yazılarını yönetebileceksin.
                    </p>

                    <div
                        style={{
                            marginTop: 18,
                            borderRadius: 18,
                            padding: 16,
                            background: "rgba(17, 24, 39, 0.55)",
                            border: "1px solid rgba(148, 163, 184, 0.14)",
                        }}
                    >
                        <div style={{ fontWeight: 850, marginBottom: 6 }}>Sonraki adımlar</div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(226, 232, 240, 0.75)" }}>
                            <li>Yazı listeleme (feed) ve detay sayfası</li>
                            <li>
                              <Link to="/app/create" style={{ color: "inherit", textDecoration: "underline" }}>
                                Yeni yazı oluşturma / düzenleme
                              </Link>
                            </li>
                            <li>Profil ve ayarlar</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
export default HomePage;