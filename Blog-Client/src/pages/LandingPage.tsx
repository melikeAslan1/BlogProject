import type React from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../auth/AuthContext";
import api from "../lib/api";
import "./landing.css";
import "../components/site.css";

type FeaturedPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  isPublished: boolean;
  authorId: string;
  autherFullName: string | null;
  autherEmail: string | null;
};

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState<FeaturedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<FeaturedPost[]>("/api/blog", { params: { page: 1, pageSize: 3, isPublished: true } })
      .then((res) => {
        if (cancelled) return;
        setFeatured(res.data ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Öne çıkanlar yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

            <aside className="heroCard" aria-label="Öne çıkan yazılar">
              <h2 className="heroCardTitle">Bugün öne çıkanlar</h2>
              <div className="heroCardBody">
                {loading ? (
                  <div className="miniPost">
                    <p className="miniPostTitle">Yükleniyor…</p>
                  </div>
                ) : error ? (
                  <div className="miniPost">
                    <p className="miniPostTitle">{error}</p>
                  </div>
                ) : featured.length === 0 ? (
                  <div className="miniPost">
                    <p className="miniPostTitle">Henüz öne çıkan yazı yok.</p>
                  </div>
                ) : (
                  featured.map((post) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="miniPost">
                      <p className="miniPostTitle">{post.title}</p>
                      <div className="miniPostMeta">
                        {new Date(post.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })} • {post.autherFullName || post.autherEmail || "Anonim"}
                      </div>
                    </Link>
                  ))
                )}
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

