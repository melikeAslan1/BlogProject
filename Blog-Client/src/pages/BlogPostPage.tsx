import type React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import "../components/site.css";

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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
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
        setPost(res.data ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.status === 404 ? "Yazı bulunamadı." : "Yazı yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

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

  if (error || !post) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e5e7eb" }}>
        <SiteHeader />
        <main className="siteContainer" style={{ padding: "32px 0" }}>
          <p style={{ color: "rgba(254,226,226,0.9)", marginBottom: 16 }}>{error ?? "Yazı bulunamadı."}</p>
          <Link to="/blog" className="btn btnPrimary">Yazılar listesine dön</Link>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e5e7eb" }}>
      <SiteHeader />
      <main className="siteContainer" style={{ padding: "32px 0 60px", maxWidth: "720px" }}>
        <Link
          to="/blog"
          style={{
            display: "inline-block",
            marginBottom: 20,
            color: "rgba(226,232,240,0.8)",
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          ← Yazılar
        </Link>
        <article>
          <h1 style={{ margin: "0 0 12px", fontSize: 28, letterSpacing: "-0.02em", color: "#f8fafc" }}>
            {post.title}
          </h1>
          <div style={{ fontSize: 14, color: "rgba(226,232,240,0.65)", marginBottom: 28 }}>
            {post.autherFullName || post.autherEmail || "Anonim"} · {formatDate(post.createdAt)}
          </div>
          <div
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(226,232,240,0.9)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {post.content}
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogPostPage;
