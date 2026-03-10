import type React from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../auth/AuthContext";
import "./landing.css";
import "../components/site.css";

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: "100vh" }}>
      <SiteHeader />

      <main className="landing">
        <div className="siteContainer">
          <section className="hero">
            <div>
              <h1 className="heroTitle">Fikirlerini yaz. Hikâyeni paylaş. Okurlarını bul.</h1>
              <p className="heroLead">
                Modern Blog; sade, hızlı ve odaklı bir yazma deneyimi sunar. Yazılarını yayınla, içerikleri keşfet ve
                topluluğa katıl.
              </p>

              <div className="heroCtas">
                <Link to="/blog" className="btn">
                  Yazıları keşfet
                </Link>
                {isAuthenticated ? (
                  <Link to="/app" className="btn btnPrimary">
                    Panele git
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btnPrimary">
                      Ücretsiz kayıt ol
                    </Link>
                    <Link to="/login" className="btn">
                      Giriş yap
                    </Link>
                  </>
                )}
              </div>
            </div>

            <aside className="heroCard" aria-label="Örnek içerik kartı">
              <h2 className="heroCardTitle">Bugün öne çıkanlar</h2>
              <div className="heroCardBody">
                <div className="miniPost">
                  <p className="miniPostTitle">Minimal tasarımla daha okunabilir yazılar</p>
                  <div className="miniPostMeta">Okuma: 4 dk • Tasarım</div>
                </div>
                <div className="miniPost">
                  <p className="miniPostTitle">React’te modern auth akışı (Vite + API)</p>
                  <div className="miniPostMeta">Okuma: 6 dk • Yazılım</div>
                </div>
                <div className="miniPost">
                  <p className="miniPostTitle">Blog yazarken üretkenlik: Notlardan yayına</p>
                  <div className="miniPostMeta">Okuma: 5 dk • Üretkenlik</div>
                </div>
              </div>
            </aside>
          </section>

          <section className="features" aria-label="Özellikler">
            <div className="feature">
              <h3 className="featureTitle">Hızlı ve modern</h3>
              <p className="featureBody">Vite tabanlı arayüz ile akıcı bir deneyim ve temiz bir okuma alanı.</p>
            </div>
            <div className="feature">
              <h3 className="featureTitle">Kullanıcı dostu</h3>
              <p className="featureBody">Sade formlar, anlaşılır geri bildirimler ve mobil uyumlu tasarım.</p>
            </div>
            <div className="feature">
              <h3 className="featureTitle">Yayınla ve keşfet</h3>
              <p className="featureBody">Yazılarını paylaş, etiketle, okurlarla buluş. (Sonraki adım: keşfet akışı)</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;

