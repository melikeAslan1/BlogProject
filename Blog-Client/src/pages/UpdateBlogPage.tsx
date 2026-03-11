import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { isMinLength, isNotEmpty } from "../lib/validators";
import SiteHeader from "../components/SiteHeader";
import "../components/site.css";
import "./auth-pages.css";
import { useAuth } from "../auth/AuthContext";

export type BlogPostDetail = {
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

const UpdateBlogPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<BlogPostDetail>(`/api/blog/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (cancelled) return;
        setPost(res.data);
        setTitle(res.data.title);
        setContent(res.data.content);
        setIsPublished(res.data.isPublished);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setError("Yazı bulunamadı.");
        } else if (err.response?.status === 403) {
          setError("Bu yazıyı düzenleme izniniz yok.");
        } else {
          setError("Yazı yüklenemedi.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    setError(null);

    if (!isNotEmpty(title)) {
      setError("Başlık boş olamaz.");
      return;
    }
    if (!isMinLength(title, 3)) {
      setError("Başlık en az 3 karakter olmalıdır.");
      return;
    }
    if (!isNotEmpty(content)) {
      setError("İçerik boş olamaz.");
      return;
    }
    if (!isMinLength(content, 10)) {
      setError("İçerik en az 10 karakter olmalıdır.");
      return;
    }

    setSaving(true);

    try {
      const res = await api.put(`/api/blog/${post.id}`, { title, content, isPublished });
      const newSlug = res.data?.slug ?? slug;
      navigate(`/blog/${encodeURIComponent(newSlug ?? "")}`);
    } catch (err: any) {
      const data = err.response?.data;
      if (typeof data === "string" && data.trim()) {
        setError(data);
      } else {
        setError(data?.message ?? "Yazı güncellenemedi.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e5e7eb" }}>
        <SiteHeader />
        <main style={{ padding: "32px 0", textAlign: "center", color: "rgba(226,232,240,0.7)" }}>
          Yükleniyor…
        </main>
      </div>
    );
  }

  if (user?.email && post?.autherEmail && user.email !== post.autherEmail) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e5e7eb" }}>
        <SiteHeader />
        <main className="siteContainer" style={{ padding: "32px 0" }}>
          <p style={{ color: "rgba(254,226,226,0.9)", marginBottom: 16 }}>
            Bu yazıyı düzenleme yetkiniz yok.
          </p>
          <button className="btn btnPrimary" onClick={() => navigate(`/blog/${slug}`)}>
            Yazıya dön
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="authPageWrap">
      <SiteHeader />
      <div className="authPageMain">
        <div className="authCard">
          <h1 className="authTitle">Yazıyı Düzenle</h1>
          <p className="authSubtitle">Yazını güncelle ve kaydet.</p>

          <form className="authForm" onSubmit={onSubmit}>
            <label className="authField">
              <span className="authLabel">Başlık</span>
              <input
                className="authInput"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Yazının başlığını gir"
              />
            </label>

            <label className="authField">
              <span className="authLabel">İçerik</span>
              <textarea
                className="authInput"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Yazını buraya yaz..."
                rows={8}
                style={{ resize: "vertical", minHeight: 180 }}
              />
            </label>

            <label className="authField" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span className="authLabel" style={{ margin: 0 }}>
                Anında yayınla
              </span>
            </label>

            {error && <div className="authError">{error}</div>}

            <button type="submit" disabled={saving} className="authPrimaryBtn">
              {saving ? "Güncelleniyor…" : "Güncelle"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateBlogPage;
