# Tickly - Proje Özeti

## 🎯 Proje Nedir?

**Tickly**, şirketlerin destek taleplerini yönetmesi için geliştirilmiş modern bir **Help Desk Sistemi**dir. Çalışanlar sorun bildirimi yapar, destek ekibi bu talepleri yönetir ve çözüme kavuşturur.

**Temel Amaç:** Destek süreçlerini hızlandırmak, otomatikleştirmek ve takip edilebilir hale getirmek.

---

## 🛠️ Kullanılan Teknolojiler

### Backend (Sunucu Tarafı)

| Teknoloji | Ne İşe Yarar? | Neden Kullanıldı? |
|-----------|---------------|-------------------|
| **ASP.NET Core 8.0** | Web API framework'ü - HTTP isteklerini karşılar | Modern, hızlı, cross-platform. Hem Windows hem Linux'ta çalışır |
| **C#** | Programlama dili | Type-safe, güçlü, Microsoft ekosistemi |
| **Entity Framework Core** | Database ile konuşmak için ORM | SQL yazmadan database işlemleri. Code-first yaklaşım |
| **SQLite** | Geliştirme ortamında veritabanı | Dosya tabanlı, kolay kurulum, test için ideal |
| **PostgreSQL** | Canlı ortamda veritabanı | Güçlü, ölçeklenebilir, ücretsiz enterprise database |
| **JWT (JSON Web Token)** | Kullanıcı kimlik doğrulama | Token bazlı güvenlik, stateless authentication |
| **SignalR** | Gerçek zamanlı iletişim | Ticket güncellendiğinde anında bildirim göndermek için |
| **BCrypt** | Şifre hashleme | Güvenli şifre saklama |
| **MailKit** | Email gönderme/alma | SMTP ile email gönder, IMAP ile email oku ve ticket'a çevir |
| **Swagger** | API dokümantasyonu | Endpoint'leri test etmek ve dokümante etmek için |

### Frontend (Kullanıcı Arayüzü)

| Teknoloji | Ne İşe Yarar? | Neden Kullanıldı? |
|-----------|---------------|-------------------|
| **React 18** | UI kütüphanesi | Component tabanlı, hızlı, popüler |
| **TypeScript** | JavaScript'in tip güvenli versiyonu | Hata yakalamak, kod kalitesi artırmak |
| **Vite** | Build tool ve dev server | Çok hızlı, modern, Hot Module Replacement (HMR) |
| **Tailwind CSS** | Utility-first CSS framework | Hızlı styling, responsive tasarım |
| **React Router** | Sayfa yönlendirme | SPA (Single Page Application) routing |
| **Axios** | HTTP client | Backend API'ye istek atmak için |
| **Lucide React** | İkonlar | Modern, hafif ikon kütüphanesi |
| **React Hot Toast** | Bildirim sistemı | Kullanıcıya toast mesajları göstermek |
| **SignalR Client** | WebSocket bağlantısı | Real-time güncellemeler almak |

### DevOps & Araçlar

| Teknoloji | Ne İşe Yarar? | Neden Kullanıldı? |
|-----------|---------------|-------------------|
| **Docker** | Containerization | Uygulamayı izole ortamda çalıştır, her yerde aynı şekilde çalışsın |
| **Docker Compose** | Multi-container yönetimi | Backend + Frontend + Database'i tek komutla ayağa kaldır |
| **Git** | Versiyon kontrolü | Kod değişikliklerini takip et |

---

## 🏗️ Mimari - Nasıl Çalışıyor?

```
┌─────────────────────────────────────────────┐
│  KULLANICI (Tarayıcı)                       │
│  React ile yapılmış web arayüzü             │
└─────────────────┬───────────────────────────┘
                  │
                  │ HTTP İstekleri (REST API)
                  │ WebSocket (Real-time)
                  ↓
┌─────────────────────────────────────────────┐
│  SUNUCU (Backend)                           │
│  ASP.NET Core Web API                       │
│  - Ticket CRUD işlemleri                    │
│  - Kullanıcı yönetimi                       │
│  - Email işlemleri                          │
│  - Otomasyon kuralları                      │
│  - SLA takibi                               │
└─────────────────┬───────────────────────────┘
                  │
                  │ SQL Sorguları
                  ↓
┌─────────────────────────────────────────────┐
│  VERİTABANI                                 │
│  SQLite (Dev) / PostgreSQL (Prod)          │
│  - Users, Tickets, Departments vs.          │
└─────────────────────────────────────────────┘
```

---

## 📦 Ana Özellikler - Ne Yapabilir?

### 1. 🎫 Ticket Yönetimi
**Ne yapar:** Kullanıcılar sorun bildirir, destek ekibi çözüme kavuşturur
- Ticket oluştur, düzenle, sil
- Durumlar: Açık → Devam Ediyor → Çözüldü → Kapatıldı
- Öncelik seviyeleri: Düşük, Orta, Yüksek, Kritik
- Dosya ekleme (screenshot, log vs.)
- Yorum sistemi (sohbet gibi)

### 2. 👥 Kullanıcı ve Departman Yönetimi
**Ne yapar:** Kullanıcıları organize eder, yetkilendirir
- Departmanlar: IT, HR, Finance vb.
- Roller: Normal Kullanıcı, Agent, Departman Yöneticisi, Süper Admin
- Her kullanıcı farklı departmanlarda farklı roller alabilir

### 3. ⏱️ SLA (Service Level Agreement)
**Ne yapar:** Çözüm sürelerini takip eder
- "Bu ticket 2 saat içinde yanıtlanmalı" gibi kurallar
- Süre dolunca otomatik uyarı
- Öncelik yükseltme

### 4. ⚡ Otomasyon Kuralları
**Ne yapar:** Tekrarlayan işleri otomatikleştirir
- Örnek: "Kritik ticket gelirse otomatik yöneticiye ata"
- Örnek: "Şifre içeren ticket'lar IT departmanına gitsin"
- Condition (koşul) + Action (eylem) mantığı

### 5. 📧 Email Entegrasyonu
**Ne yapar:** Email'leri otomatik ticket'a çevirir
- SMTP: Email gönder (bildirimler için)
- IMAP: Email'leri oku, otomatik ticket oluştur
- "support@firma.com"a gelen her email = Yeni ticket

### 6. 📚 Bilgi Bankası
**Ne yapar:** Sık sorulan sorulara hazır cevaplar
- Self-service: Kullanıcı önce bilgi bankasına bakar
- Makaleler, kategoriler, etiketler
- "Yararlı/Yararlı Değil" feedback sistemi

### 7. 🔔 Gerçek Zamanlı Bildirimler
**Ne yapar:** Anlık güncellemeler
- SignalR ile WebSocket bağlantısı
- Ticket güncellendiğinde sayfayı yenilemeden görürsün
- Yeni yorum geldiğinde anında bildirim

### 8. 📊 Raporlama ve Dashboard
**Ne yapar:** İstatistikler ve grafikler
- Kaç ticket açık, kaç tane çözüldü?
- Ortalama çözüm süresi nedir?
- Hangi departman daha çok ticket alıyor?

---

## 🔐 Güvenlik - Nasıl Korunuyor?

| Özellik | Açıklama |
|---------|----------|
| **JWT Token** | Her istekte token gönderilir, sunucu doğrular |
| **BCrypt Hashing** | Şifreler hash'lenerek saklanır, düz metin yok |
| **Role-Based Access** | Kullanıcı sadece yetkisi olan işlemleri yapabilir |
| **HTTPS** | Tüm iletişim şifreli (SSL/TLS) |
| **SQL Injection Koruması** | EF Core parametrize sorgular kullanır |
| **XSS Koruması** | React otomatik escape eder |

---

## 🚀 Nasıl Çalıştırılır?

### Geliştirme Ortamı (Development)

```bash
# 1. Backend'i başlat
cd backend
dotnet run
# → http://localhost:5000

# 2. Frontend'i başlat (yeni terminal)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Docker ile (Tek Komut)

```bash
docker-compose up -d
# Her şey hazır! Backend + Frontend + Database
```

---

## 📈 Sistemin Avantajları

✅ **Modern Teknolojiler** - Güncel, desteklenen, performanslı
✅ **Cross-Platform** - Windows, Linux, macOS'ta çalışır
✅ **Responsive Design** - Mobil, tablet, desktop uyumlu
✅ **Real-time** - Anlık güncellemeler, bekleme yok
✅ **Ölçeklenebilir** - 10 kullanıcıdan 10,000 kullanıcıya geçebilir
✅ **Güvenli** - Endüstri standartları uygulanmış
✅ **Otomatik** - İnsan müdahalesi minimize
✅ **Açık Kaynak** - Tüm kodlar okunabilir, değiştirilebilir

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Normal Kullanıcı
1. Ahmet bilgisayarı açılmıyor
2. Sisteme giriş yapar
3. "Yeni Ticket" butonuna basar
4. Başlık: "Bilgisayarım açılmıyor"
5. Açıklama: "Sabah geldiğimde ekran siyah"
6. Departman: IT
7. Öncelik: Yüksek
8. **Ticket oluşturuldu!** ✅

### Senaryo 2: Destek Personeli (Agent)
1. Dashboard'da yeni ticket görür
2. Ticket'a tıklar, detayları okur
3. "Kendime Ata" butonuna basar
4. Yorum yazar: "Ram takılı mı kontrol ederseniz?"
5. Ahmet'e **anında bildirim** gider (SignalR)
6. Sorun çözülünce **"Çözüldü"** olarak işaretler

### Senaryo 3: Email ile Ticket
1. Kullanıcı support@firma.com'a email atar
2. IMAP Worker email'i yakalar
3. **Otomatik ticket oluşturulur**
4. Subject → Ticket başlığı
5. Body → Ticket açıklaması
6. From → Ticket sahibi

### Senaryo 4: Otomasyon
1. Kritik öncelikli ticket oluşturuldu
2. Otomasyon kuralı devreye girer:
   - Koşul: Priority = Critical
   - Eylem: Manager'a ata + Email gönder
3. **Otomatik atama** yapıldı!
4. Manager'a email gitti!

---

## 📊 Sistem Gereksinimleri

### Sunucu (Backend)
- **CPU:** 2 Core (4 Core önerilir)
- **RAM:** 2 GB (4 GB önerilir)
- **Disk:** 10 GB
- **OS:** Windows Server 2019+ veya Linux (Ubuntu 20.04+)
- **.NET:** 8.0 SDK

### İstemci (Frontend)
- **Tarayıcı:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript:** Aktif olmalı

### Geliştirme Makinesi
- **Node.js:** 18+
- **.NET SDK:** 8.0
- **Git:** 2.30+
- **RAM:** 8 GB önerilir
- **Disk:** 5 GB boş alan

---

## 🔄 İş Akışı Örnekleri

### Ticket Yaşam Döngüsü
```
Oluşturuldu → Açık → Devam Ediyor → Çözüldü → Kapatıldı
                ↑                         ↓
                └─────── (Kullanıcı reddetti) ──┘
```

### SLA Takibi
```
Ticket Oluşturuldu (10:00)
    ↓
SLA: 2 saat içinde yanıtla
    ↓
11:30 - Uyarı: 30 dakika kaldı!
    ↓
12:00 - SLA İhlali! Bildirim gönder
    ↓
Manager'a escalate et
```

---

## 💡 Öne Çıkan Özellikler

### 1. SignalR ile Real-time
**Problem:** Kullanıcı sayfayı sürekli yenilemek zorunda
**Çözüm:** WebSocket ile otomatik güncelleme
```
Agent yorum yazdı → SignalR → Kullanıcı anında gördü
```

### 2. Email to Ticket
**Problem:** Email'ler takip edilemiyor
**Çözüm:** IMAP Worker otomatik ticket oluşturur
```
Email geldi → Parse edildi → Ticket oluşturuldu → Departmana atandı
```

### 3. Otomasyon
**Problem:** Aynı işler tekrar tekrar yapılıyor
**Çözüm:** Kurallar oluştur, sistem kendisi yapsın
```
IF Priority = Critical THEN Assign to Manager + Send Email
```

### 4. Bilgi Bankası
**Problem:** Aynı sorular tekrar tekrar soruluyor
**Çözüm:** Self-service makaleler
```
Kullanıcı önce arar → Bulamazsa ticket oluşturur
```

---

## 🎨 Kullanıcı Arayüzü

- **Modern Design:** Temiz, minimal, profesyonel
- **Dark Mode Destekli:** Göz yormayan
- **Responsive:** Mobilde de mükemmel çalışır
- **Hızlı:** React + Vite sayesinde anında yükleme
- **Tailwind CSS:** Utility-first, özelleştirilebilir

---

## 📝 Özet

**Tickly = Modern Help Desk Sistemi**

| Bileşen | Teknoloji | Amaç |
|---------|-----------|------|
| **Backend** | ASP.NET Core + C# | API ve iş mantığı |
| **Frontend** | React + TypeScript | Kullanıcı arayüzü |
| **Database** | SQLite / PostgreSQL | Veri saklama |
| **Real-time** | SignalR | Anlık bildirimler |
| **Security** | JWT + BCrypt | Güvenli authentication |
| **Email** | MailKit (SMTP/IMAP) | Email entegrasyonu |
| **Styling** | Tailwind CSS | Hızlı ve modern tasarım |
| **Deployment** | Docker + Docker Compose | Kolay kurulum |

**Sonuç:** Kurumsal destek süreçlerini hızlandıran, otomatikleştiren ve takip edilebilir hale getiren tam teşekküllü bir sistem! 🚀
