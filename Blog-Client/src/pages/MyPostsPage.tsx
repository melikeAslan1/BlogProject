import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../auth/AuthContext";
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

const PAGE_SIZE = 4;
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

const MyPostsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalFetched, setTotalFetched] = useState(0);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id) {
      setError("Kullanıcı bilgisi alınamadı.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<BlogPostItem[]>("/api/blog", {
        params: {
          page,
          pageSize: PAGE_SIZE,
          authorId: user.id,
          q: search || undefined,
        },
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
  }, [page, search, user?.id]);

  const deletePost = async (id: number) => {
    if (!window.confirm("Bu yazıyı silmek istediğinden emin misin?")) return;

    setDeletingIds((prev) => [...prev, id]);
    try {
      await api.delete(`/api/blog/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotalFetched((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      window.alert(err.response?.data ?? "Yazı silinirken bir hata oluştu.");
    } finally {
      setDeletingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <SiteHeader />
      <main className="blogListPage">
        <div className="siteContainer">
          <h1>Yazılarım</h1>
          <p className="blogListIntro">
            Buradan yalnızca hesabına ait yazıları görebilir, düzenleyebilir veya silebilirsin.
          </p>

          <form
            className="blogListSearch"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(query.trim());
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="blogSearchInput"
              placeholder="Yazılarda ara..."
              aria-label="Yazılarda ara"
            />
            <button type="submit" className="btn">
              Ara
            </button>
          </form>

          {error && <div className="blogListError">{error}</div>}

          {loading ? (
            <div className="blogListLoading">Yazılar yükleniyor…</div>
          ) : items.length === 0 ? (
            <div className="blogListEmpty">
              Henüz yazı yok. <Link to="/app/create">Yeni yazı oluştur</Link>.
            </div>
          ) : (
            <>
              <ul className="blogList">
                {items.map((post) => (
                  <li key={post.id}>
                    <div className="blogCard">
                      <Link to={`/blog/${post.slug}`} className="blogCardLink">
                        <h2 className="blogCardTitle">{post.title}</h2>
                        <p className="blogCardExcerpt">{excerpt(post.content, EXCERPT_LENGTH)}</p>
                      </Link>

                      <div className="blogCardMeta">
                        <span className="blogCardAuthor">
                          {post.autherFullName || post.autherEmail || "Anonim"}
                        </span>
                        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                      </div>

                      <div className="blogCardActions">
                        <Link to={`/app/edit/${post.slug}`} className="btn btnPrimary btnSmall">
                          Düzenle
                        </Link>
                        <button
                          type="button"
                          className="btn btnDanger btnSmall"
                          onClick={() => deletePost(post.id)}
                          disabled={deletingIds.includes(post.id)}
                        >
                          {deletingIds.includes(post.id) ? "Siliniyor…" : "Sil"}
                        </button>
                      </div>
                    </div>
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
                <span className="pageInfo">Sayfa {page}</span>
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

export default MyPostsPage;
