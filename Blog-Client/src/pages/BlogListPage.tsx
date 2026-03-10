import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import "./blog-list.css";
import "../components/site.css";

export type BlogPostItem = {
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

const PAGE_SIZE = 10;
const EXCERPT_LENGTH = 160;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function excerpt(text: string, maxLen: number): string {
  const plain = text.replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen).trim() + "…";
}

const BlogListPage: React.FC = () => {
  const [items, setItems] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalFetched, setTotalFetched] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<BlogPostItem[]>("/api/blog", {
        params: { page, pageSize: PAGE_SIZE, isPublished: true },
      })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data ?? []);
        setTotalFetched((res.data ?? []).length);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message ?? "Yazılar yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <SiteHeader />
      <main className="blogListPage">
        <div className="siteContainer">
          <h1>Yazılar</h1>
          <p className="blogListIntro">
            Yayınlanmış blog yazılarını burada listeleyebilirsin. Bir yazıya tıklayarak okuyabilirsin.
          </p>

          {error && <div className="blogListError">{error}</div>}

          {loading ? (
            <div className="blogListLoading">Yazılar yükleniyor…</div>
          ) : items.length === 0 ? (
            <div className="blogListEmpty">
              Henüz yayınlanmış yazı yok. İlk yazıyı sen ekleyebilirsin.
            </div>
          ) : (
            <>
              <ul className="blogList">
                {items.map((post) => (
                  <li key={post.id}>
                    <Link to={`/blog/${post.slug}`} className="blogCard">
                      <h2 className="blogCardTitle">{post.title}</h2>
                      <p className="blogCardExcerpt">{excerpt(post.content, EXCERPT_LENGTH)}</p>
                      <div className="blogCardMeta">
                        <span className="blogCardAuthor">
                          {post.autherFullName || post.autherEmail || "Anonim"}
                        </span>
                        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="blogListPagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Önceki
                </button>
                <span className="pageInfo">
                  Sayfa {page}
                </span>
                <button
                  type="button"
                  disabled={totalFetched < PAGE_SIZE}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sonraki
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BlogListPage;
