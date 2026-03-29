import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { isMinLength, isNotEmpty } from "../lib/validators";
import SiteHeader from "../components/SiteHeader";
import "../components/site.css";
import "./auth-pages.css";

const CreateBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    setLoading(true);
    try {
      const res = await api.post("/api/blog", { title, content, isPublished });
      const slug = res.data?.slug;
      navigate(slug ? `/blog/${slug}` : "/blog");
    } catch (err: any) {
      const data = err.response?.data;
      if (typeof data === "string" && data.trim()) {
        setError(data);
      } else {
        setError(data?.message ?? "Yazı oluşturulamadı.");
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
          <h1 className="authTitle">Yeni Yazı Oluştur</h1>
          <p className="authSubtitle">Yazını yaz ve paylaş.</p>

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

            <button type="submit" disabled={loading} className="authPrimaryBtn">
          
              {loading ? "Oluşturuluyor…" : "Yazıyı Paylaş"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPage;
