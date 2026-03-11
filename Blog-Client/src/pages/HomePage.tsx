import type React from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import "../components/site.css";

const HomePage: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="dashboardPage">
            <SiteHeader />

            <main className="dashboardMain">
                <div className="siteContainer">
                    <header className="dashboardHeader">
                        <div>
                            <h1 className="dashboardTitle">Panel</h1>
                            <p className="dashboardSubtitle">
                                Hoş geldin, <b>{user?.fullName ?? user?.email}</b>. Buradan yazılarını yönetebileceksin.
                            </p>
                        </div>
                        <Link to="/app/create" className="btn btnPrimary">
                            Yeni Yazı Oluştur
                        </Link>
                    </header>

                    <div className="dashboardGrid">
                        <Link to="/app/posts" className="dashboardCard">
                            <div className="dashboardCardHeader">Yazılarımı Görüntüle</div>
                            <p className="dashboardCardDesc">Sadece kendi yazılarını listele ve yönet.</p>
                            <span className="dashboardCardAction">Yazıları Gör →</span>
                        </Link>

                        <Link to="/app/create" className="dashboardCard">
                            <div className="dashboardCardHeader">Yeni Yazı Yaz</div>
                            <p className="dashboardCardDesc">Hemen yeni bir yazı oluşturup paylaş.</p>
                            <span className="dashboardCardAction">Yazı Oluştur →</span>
                        </Link>

                        <Link to="/app" className="dashboardCard">
                            <div className="dashboardCardHeader">Hesap Ayarları</div>
                            <p className="dashboardCardDesc">Profilini ve hesap bilgilerini güncelle.</p>
                            <span className="dashboardCardAction">Ayarları Gör →</span>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
export default HomePage;