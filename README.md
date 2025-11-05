# Tickly - Ticket Sistemi

Kısa: BLM4531 dersi için hazırlanacak 'Ticket Sistemi' projesi.

Teknolojiler
- Frontend: React + Vite + TypeScript
- Backend: .NET (Web API)
- Database: PostgreSQL

Hızlı başlatma (geliştirici makinada):

- Docker (önerilen): Tüm servisleri ayağa kaldırmak için proje kökünde:

```
docker compose up -d --build
```

Sonra tarayıcıda frontend için: http://localhost:5173/ ve backend health için: http://localhost:5000/health

- Manuel (lokal geliştirme):
	- Frontend: `cd frontend && npm install && npm run dev`
	- Backend: `cd backend && dotnet restore && dotnet run`
	- DB: PostgreSQL (lokal veya Docker)

Not: Docker compose dosyası PostgreSQL, backend ve frontend servislerini içerir. Geliştirme kolaylığı için backend başlangıcında veritabanı tabloları otomatik oluşturulacak (EnsureCreated). Daha sonra migration'lar tercih edilmelidir.