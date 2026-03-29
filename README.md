# Modern Blog

Bu proje, **React + Vite** tabanlı bir blog ön yüzü ile **ASP.NET Core Web API** tabanlı bir blog backend'inden oluşan tam yığın (full-stack) bir blog uygulamasıdır.

## 🧩 Özellikler

- Kullanıcı kaydı / giriş (JWT tabanlı oturum)
- Blog yazısı oluşturma / düzenleme / silme
- Yayınlanmış yazılar için listeleme / arama / sayfalama
- Kullanıcıya özel “Benim Yazılarım” sayfası
- Başlık/slug yönetimi (otomatik slug üretimi)
- Unit test altyapısı (xUnit)

## 🧱 Proje Yapısı

```
BlogProject.sln
├── Blog-Client/       # React + Vite frontend
└── BlogApi/            # ASP.NET Core Web API backend
└── BlogApi.Tests/      # Backend için unit test projesi
```

## 🚀 Nasıl Çalıştırılır

### 1) Backend (BlogApi)

1. `BlogApi` klasörüne girin:
   ```bash
   cd BlogApi
   ```
2. Gerekli NuGet paketlerini yükleyip projeyi çalıştırın:
   ```bash
   dotnet restore
   dotnet run
   ```

Varsayılan olarak API `http://localhost:5107` adresinde çalışır.

---

### 2) Frontend (Blog-Client)

1. `Blog-Client` klasörüne girin:
   ```bash
   cd Blog-Client
   ```
2. Bağımlılıkları yükleyin ve geliştirme sunucusunu başlatın:
   ```bash
   npm install
   npm run dev
   ```

Frontend, genellikle `http://localhost:5173` üzerinde hizmet verir.

---

## 🧪 Testler

Backend için birim testleri çalıştırmak için:

```bash
cd BlogApi.Tests
dotnet test
```

## 📌 Notlar

- JWT oturumu `localStorage` üzerinde saklanır.
- Blog yazısı `slug`’ları otomatik üretilir ve tekrar eden başlıklarda `-2`, `-3` gibi suffix eklenir.
- `BlogApi` içinde **AuthController** ve **BlogController** temel CRUD işlemlerini sağlar.

---
Veritabanı (PostgreSQL)

Bu projede veritabanı olarak PostgreSQL kullanılmaktadır.

⚙️ Kurulum

Bilgisayarında PostgreSQL yoksa indirip kurabilirsin:
👉 https://www.postgresql.org/download/

Kurulum sonrası bir veritabanı oluştur:

CREATE DATABASE BlogDb;
