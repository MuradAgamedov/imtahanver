# İmtahanVer — Rəqəmsal İmtahan Platforması (Dockerized)

Bu layihə **İmtahanVer** platformasının mikroservis arxitekturasını (Backend, Frontend, Admin və Landing Page) Docker vasitəsilə asanlıqla işə salmaq üçün konfiqurasiya olunmuşdur.

## 🚀 Texnologiya Steki

* **Backend:** Laravel 13 (PHP 8.4) + **FrankenPHP** (Go əsaslı, ultra-sürətli tətbiq serveri)
* **Frontend:** React Router v7 (SSR) + TailwindCSS
* **Admin:** React Router v7 (SSR) + TailwindCSS
* **Landing Page (Main):** Statik HTML + Nginx
* **Verilənlər Bazası:** PostgreSQL 17 (Ən müasir və etibarlı relational database)
* **Keş və Növbə (Cache & Queue):** Redis 7 (Ultra-sürətli in-memory data store)

---

## 🛠️ Port Xəritəsi (Port Mapping)

Sistem işə düşdükdən sonra aşağıdakı ünvanlardan xidmətlərə daxil ola bilərsiniz:

| Servis | Xarici Ünvan (Host Port) | Daxili Port (Container Port) | Təsvir |
| :--- | :--- | :--- | :--- |
| **Landing Page (Main)** | [http://localhost:8085](http://localhost:8085) | 80 | Əsas təqdimat və məlumat səhifəsi |
| **Frontend App** | [http://localhost:3000](http://localhost:3000) | 3000 | Tələbələr üçün imtahan portalı (SSR) |
| **Admin Panel** | [http://localhost:3001](http://localhost:3001) | 3000 | İdarəetmə paneli (SSR) |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | 80 | Laravel + FrankenPHP API |
| **PostgreSQL** | `localhost:5432` | 5432 | Verilənlər bazası |
| **Redis** | `localhost:6379` | 6379 | Keş serveri |

---

## ⚡ Tez Başlanğıc (Quick Start)

Bütün platformanı vahid komanda ilə ayağa qaldırmaq üçün terminalda layihənin kök qovluğunda bu komandanı icra edin:

```bash
docker compose up --build -d
```

### Bu komanda işə düşərkən avtomatik olaraq:
1. **PostgreSQL 17** və **Redis 7** konteynerlərini yaradır və işə salır.
2. **Laravel Backend** üçün lazım olan bütün PHP kitabxanalarını və PHP-PGSQL / Redis genişlənmələrini (extensions) qurur.
3. Verilənlər bazası əlaqəsinin tam hazır olmasını gözləyir.
4. **Artisan Migrations** komandasını işə salaraq bazanı miqrasiya edir (cədvəlləri qurur).
5. **App Key** yoxdursa avtomatik generasiya edir.
6. **Frontend** və **Admin** tətbiqlərinin React Router SSR build-lərini hazırlayır və Node.js serverlərini başladır.
7. **Landing Page** statik resurslarını Nginx vasitəsilə təqdim edir.

---

## 🧹 Konteynerləri dayandırmaq

Platformanı dayandırmaq üçün:

```bash
docker compose down
```

Həmçinin bütün verilənlər bazası və keş datalarını (volumes) tamamilə təmizləyərək dayandırmaq üçün:

```bash
docker compose down -v
```


<!-- Security scan triggered at 2026-08-31 16:42:00 -->

<!-- Security scan triggered at 2026-08-31 18:19:28 -->

<!-- Security scan triggered at 2026-09-02 06:31:26 -->

<!-- Security scan triggered at 2026-09-04 12:55:48 -->

<!-- Security scan triggered at 2026-09-05 07:27:18 -->