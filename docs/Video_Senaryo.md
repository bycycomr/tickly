# TICKLY PROJE TANITIM VİDEO SENARYOSU

**Video Süresi:** Minimum 5 dakika (önerilen: 7-10 dakika)  
**Tarih:** Ocak 2026  
**Proje:** Tickly - Help Desk & Ticket Yönetim Sistemi

---

## 📋 VİDEO İÇERİK PLANI

### BÖLÜM 1: GİRİŞ VE PROJE TANITIMI (45 saniye)

**Ekranda Gösterilecekler:**
- Projenin ana sayfası / login ekranı
- Proje logosu

**Anlatım Metni:**
> "Merhaba, ben [Adınız]. Sizlere Tickly Help Desk ve Ticket Yönetim Sistemi projesini tanıtacağım. Tickly, şirketlerin destek taleplerini organize bir şekilde yönetmesi için geliştirilmiş modern bir web uygulamasıdır. Proje ASP.NET Core 8.0, React 18 ve TypeScript kullanılarak geliştirilmiştir. Şimdi sizlere önce kod yapısını, ardından veritabanını ve son olarak da çalışan uygulamayı detaylı bir şekilde anlatacağım."

---

### BÖLÜM 2: PROJE YAPISINA GENEL BAKIŞ (1 dakika)

**Ekranda Gösterilecekler:**
- VS Code'da proje klasör yapısı
- tickly/ root klasörü açık
- backend/, frontend/, mobile/ klasörleri görünür

**Anlatım Metni:**
> "Projenin genel yapısına bakacak olursak, üç ana klasörümüz var. Backend klasörü ASP.NET Core Web API'mizi içeriyor. Frontend klasöründe React ve TypeScript ile yazılmış kullanıcı arayüzümüz bulunuyor. Mobile klasöründe ise Flutter ile geliştirilmiş mobil uygulamamız var.  Şimdi backend yapısını detaylı inceleyelim."

---

### BÖLÜM 3: BACKEND YAPISINI ANLATMA (2.5 dakika)

#### 3.1 Backend Klasör Yapısı (30 saniye)

**Ekranda Gösterilecekler:**
- backend/src/ klasörü açık
- Controllers, Models, Services, Data klasörleri görünür

**Anlatım Metni:**
> "Backend projemiz katmanlı mimari prensiplerine göre organize edilmiş durumda. Controllers klasörümüz API endpoint'lerimizi içeriyor. Models klasöründe veritabanı entity'lerimiz var. Services klasöründe iş mantığımızı barındırıyoruz. Data klasöründe ise Entity Framework DbContext'imiz bulunuyor."

#### 3.2 Veritabanı Modelleri (45 saniye)

**Ekranda Gösterilecekler:**
- backend/src/Data/AppDbContext.cs dosyası açık
- DbSet tanımlamaları görünür (Users, Tickets, Departments, vb.)

**Anlatım Metni:**
> "AppDbContext dosyamıza bakacak olursak, şu entity'leri görüyoruz: Users - kullanıcılar için, Tickets - destek talepleri için, Departments - departmanlar için, RoleAssignments - kullanıcı-departman-rol ilişkileri için, Categories - ticket kategorileri, SLAPlans - hizmet seviyesi anlaşmaları, AutomationRules - otomasyon kuralları, Articles - bilgi bankası makaleleri. Her biri arasında ilişkiler tanımlanmış durumda."

**Ekranda Gösterilecekler:**
- backend/src/Models/Ticket.cs dosyası açık
- Ticket sınıfının property'leri görünür

**Anlatım Metni:**
> "Örneğin Ticket modelimize bakarsak, Id, Title, Description, Status, Priority gibi temel alanları görüyoruz. Ayrıca CreatorId ile ticket'ı oluşturan kullanıcıya, AssignedToId ile atanan agent'a, DepartmentId ile departmana, CategoryId ile kategoriye referanslar var. DueAt ile SLA bitiş tarihi, ResolutionNote ile çözüm notu gibi alanlarımız da mevcut."

#### 3.3 API Controllers (45 saniye)

**Ekranda Gösterilecekler:**
- backend/src/Controllers/TicketsController.cs dosyası açık
- GetTickets, CreateTicket, UpdateTicket metodları görünür

**Anlatım Metni:**
> "TicketsController'ımıza bakalım. Burada RESTful API endpoint'lerimiz tanımlı. GetTickets metodu tüm ticket'ları listeler, pagination ve filtreleme desteği sunar. CreateTicket metodu yeni ticket oluşturur, doğrulama yapar. UpdateTicket metodu ticket güncellemelerini yapar ve TicketEvent kaydı oluşturur. AssignTicket ile atama, AddComment ile yorum ekleme, ChangeStatus ile durum değiştirme metodlarımız var."

**Ekranda Gösterilecekler:**
- AuthController.cs dosyası açık
- Login, Register metodları

**Anlatım Metni:**
> "AuthController'da ise kimlik doğrulama işlemlerimiz var. Login metodunda kullanıcı adı ve şifre kontrol ediliyor, BCrypt ile şifre doğrulanıyor ve JWT token üretiliyor. Register metodunda yeni kullanıcı kaydı yapılıyor, şifre hash'leniyor ve veritabanına kaydediliyor."

#### 3.4 Servisler ve İş Mantığı (30 saniye)

**Ekranda Gösterilecekler:**
- backend/src/Services/ klasörü
- EmailService.cs, AutomationService.cs dosyaları

**Anlatım Metni:**
> "Services klasörümüzde iş mantığımız bulunuyor. EmailService SMTP ile email gönderimi yapıyor. AutomationService otomasyon kurallarını işliyor - örneğin kritik ticket oluştuğunda otomatik atama yapabiliyor. SLAMonitoringService arka planda çalışıyor ve süre aşımlarını kontrol ediyor. ImapListenerWorker gelen emailleri dinliyor ve otomatik ticket oluşturuyor."

---

### BÖLÜM 4: VERİTABANI YAPISINI ANLATMA (1 dakika)

**Ekranda Gösterilecekler:**
- Database management tool (DB Browser for SQLite veya pgAdmin)
- Tablolar listesi görünür

**Anlatım Metni:**
> "Şimdi veritabanı yapımıza bakalım. Projede development için SQLite, production için PostgreSQL kullanıyoruz. Şu an SQLite veritabanımızı görüyorsunuz."

**Ekranda Gösterilecekler:**
- Tickets tablosu açık, kolonlar görünür
- Örnek veri satırları

**Anlatım Metni:**
> "Tickets tablomuza baktığımızda, Id, Title, Description, Status, Priority kolonlarını görüyoruz. CreatorId, AssignedToId, DepartmentId foreign key kolonlarımız ilişkili tablolara bağlanıyor. CreatedAt, UpdatedAt, DueAt gibi tarih alanlarımız var. Status kolonu Open, InProgress, Resolved, Closed değerlerini alıyor. Priority kolonu Low, Medium, High, Critical değerlerini alıyor."

**Ekranda Gösterilecekler:**
- Users tablosu, örnek kullanıcı kayıtları
- PasswordHash kolonunu göster

**Anlatım Metni:**
> "Users tablosunda kullanıcı bilgileri tutuluyor. PasswordHash kolonu BCrypt ile hashlenmiş şifreyi içeriyor, asla düz metin şifre saklanmıyor. Email, Username, FullName gibi bilgiler var. IsActive ile kullanıcı aktif/pasif durumu kontrol ediliyor."

**Ekranda Gösterilecekler:**
- RoleAssignments tablosu
- User-Department-Role ilişkileri

**Anlatım Metni:**
> "RoleAssignments tablosu kullanıcı-departman-rol ilişkilerini tutuyor. Bir kullanıcı farklı departmanlarda farklı rollere sahip olabilir. Örneğin IT departmanında Agent, HR departmanında DepartmentManager olabilir. Bu esnek rol sistemi RBAC (Role-Based Access Control) prensibine dayanıyor."

---

### BÖLÜM 5: FRONTEND YAPISINI ANLATMA (1 dakika)

**Ekranda Gösterilecekler:**
- frontend/src/ klasörü açık
- pages, components, context klasörleri

**Anlatım Metni:**
> "Frontend projemiz React ve TypeScript ile yazılmış. Pages klasöründe sayfa bileşenlerimiz var: Login, Dashboard, TicketList, TicketDetail, Admin vb. Components klasöründe yeniden kullanılabilir bileşenler var: Navbar, Sidebar, TicketCard gibi. Context klasöründe AuthContext ile global authentication state'i yönetiyoruz."

**Ekranda Gösterilecekler:**
- frontend/src/pages/TicketList.tsx dosyası açık
- useEffect, useState hook'ları

**Anlatım Metni:**
> "TicketList componentine bakalım. useState ile tickets state'ini yönetiyoruz. useEffect içinde sayfa yüklendiğinde API'ye istek atıyoruz: axios.get('/api/tickets') ile backend'den ticket listesini çekiyoruz. Gelen veriler state'e set ediliyor ve ekranda map ile render ediliyor. Her ticket için TicketCard componenti kullanılıyor."

**Ekranda Gösterilecekler:**
- Axios service dosyası
- API base URL ve interceptor tanımlamaları

**Anlatım Metni:**
> "Axios konfigürasyonumuzda base URL backend adresini işaret ediyor. Request interceptor'da JWT token otomatik olarak her isteğe ekleniyor. Response interceptor'da 401 hatalarını yakalayıp login sayfasına yönlendiriyoruz."

---

### BÖLÜM 6: ÇALIŞAN UYGULAMAYI ADIM ADIM ANLATMA (3 dakika)

#### 6.1 Login ve Authentication (30 saniye)

**Ekranda Gösterilecekler:**
- Login sayfası
- Kullanıcı adı ve şifre gir
- Network tab açık (DevTools)

**Anlatım Metni:**
> "Şimdi çalışan uygulamayı görelim. Login sayfasındayız. admin kullanıcısı ile giriş yapacağım. Kullanıcı adı: admin, şifre: admin123. Login butonuna tıklıyorum."

**Ekranda Gösterilecekler:**
- Network tab'da POST /api/auth/login isteği
- Request payload (username, password)
- Response body (token)

**Anlatım Metni:**
> "Network tab'a bakarsak, POST isteği /api/auth/login endpoint'ine gönderildi. Request body'de username ve password var. Response'da JWT token döndü. Bu token localStorage'a kaydedildi ve bundan sonraki tüm isteklerde Authorization header'ında gönderilecek."

**Ekranda Gösterilecekler:**
- AuthController.cs dosyası, Login metodu
- JWT token üretim kodu

**Anlatım Metni:**
> "Şimdi koda dönelim. AuthController'da Login metoduna bakarsak, kullanıcı veritabanından sorgulanıyor, BCrypt.Verify ile şifre kontrol ediliyor, doğruysa JWT token üretiliyor ve client'a dönülüyor."

**Ekranda Gösterilecekler:**
- Database'de Users tablosu
- admin kullanıcısının kaydı

**Anlatım Metni:**
> "Veritabanına bakarsak, admin kullanıcısını görüyoruz. PasswordHash kolonu BCrypt ile hashlenmiş şifreyi içeriyor. Login işlemi bu hash ile girilen şifreyi karşılaştırarak çalışıyor."

#### 6.2 Dashboard ve Ticket Listesi (45 saniye)

**Ekranda Gösterilecekler:**
- Dashboard sayfası
- İstatistikler (toplam ticket, açık, çözülmüş, vb.)
- Grafikler

**Anlatım Metni:**
> "Başarılı girişten sonra Dashboard'a yönlendirildik. Burada genel istatistikleri görüyoruz: Toplam ticket sayısı, açık ticket sayısı, bu ay oluşturulan, çözülen ticket sayıları. Grafiklerle departmanlara göre dağılım ve zaman içindeki trend görüntüleniyor."

**Ekranda Gösterilecekler:**
- Network tab'da GET /api/reports/dashboard isteği
- Response body (istatistik verileri)

**Anlatım Metni:**
> "Bu veriler /api/reports/dashboard endpoint'inden geliyor. Backend'de SQL aggregate sorguları çalıştırılıyor ve istatistikler hesaplanıyor."

**Ekranda Gösterilecekler:**
- ReportsController.cs dosyası
- GetDashboardStats metodu

**Anlatım Metni:**
> "ReportsController'da GetDashboardStats metoduna bakarsak, LINQ sorguları ile Tickets tablosundan Count, Where, GroupBy kullanarak istatistikler hesaplanıyor."

#### 6.3 Ticket Oluşturma İşlemi (1 dakika)

**Ekranda Gösterilecekler:**
- Tickets sayfası, "Yeni Ticket" butonu
- Ticket oluşturma formu

**Anlatım Metni:**
> "Şimdi yeni bir ticket oluşturalım. Tickets sayfasından 'Yeni Ticket' butonuna tıklıyorum. Form açıldı. Başlık: 'Yazıcı çalışmıyor'. Açıklama: 'Ofisteki yazıcı kağıt sıkışması veriyor'. Departman: IT. Kategori: Hardware. Öncelik: Medium. Dosya ekleyebiliyoruz, bir screenshot ekliyorum. 'Oluştur' butonuna tıklıyorum."

**Ekranda Gösterilecekler:**
- Network tab'da POST /api/tickets isteği
- Request payload (form verileri)
- Response (yeni ticket objesi)

**Anlatım Metni:**
> "Network tab'a bakarsak, POST isteği /api/tickets endpoint'ine gitti. Request body'de Title, Description, DepartmentId, CategoryId, Priority verileri var. Response'da yeni oluşturulan ticket dönüldü, otomatik Id atandı, CreatedAt zamanı eklendi, Status 'Open' olarak set edildi."

**Ekranda Gösterilecekler:**
- TicketsController.cs, CreateTicket metodu
- Model validation, entity oluşturma, DbContext.Add

**Anlatım Metni:**
> "Koda bakalım. TicketsController'da CreateTicket metodunda önce model validasyonu yapılıyor. IsValid kontrolü geçerse yeni Ticket entity'si oluşturuluyor, CreatorId mevcut kullanıcıdan alınıyor, CreatedAt DateTime.UtcNow set ediliyor. DbContext.Tickets.Add ile entity ekleniyor, SaveChangesAsync ile veritabanına kaydediliyor. Ardından EmailService ile kullanıcıya onay emaili gönderiliyor."

**Ekranda Gösterilecekler:**
- Database'de Tickets tablosu
- Yeni eklenen ticket kaydı

**Anlatım Metni:**
> "Veritabanına bakarsak, yeni ticket'ı görüyoruz. Id otomatik arttı, Title ve Description alanları dolu, Status 'Open', Priority 'Medium', DepartmentId ve CategoryId set edilmiş, CreatedAt timestamp'i eklenmiş."

**Ekranda Gösterilecekler:**
- Ticket listesi sayfası
- Yeni ticket'ın listede görünmesi

**Anlatım Metni:**
> "Ticket listesi sayfasına dönersek, yeni oluşturduğumuz ticket'ı listenin en üstünde görüyoruz. Real-time SignalR sayesinde sayfa yenilenmeden listeye eklendi."

#### 6.4 Ticket Detay ve Yorum Ekleme (45 saniye)

**Ekranda Gösterilecekler:**
- Ticket detay sayfası
- Ticket bilgileri, timeline, yorum alanı

**Anlatım Metni:**
> "Ticket'a tıklayıp detay sayfasını açalım. Burada ticket'ın tüm bilgilerini görüyoruz: Başlık, açıklama, durum, öncelik, oluşturan kişi, atanan kişi. Timeline bölümünde ticket'ın geçmişi var: Ne zaman oluşturuldu, kim ne yorum yaptı, durum değişiklikleri."

**Ekranda Gösterilecekler:**
- Yorum ekleme alanı
- "Sorunu incelemeye başladım" yorum yaz

**Anlatım Metni:**
> "Yorum ekleyelim: 'Sorunu incelemeye başladım, kısa sürede çözüme kavuşturacağım.' Gönder butonuna tıklıyorum."

**Ekranda Gösterilecekler:**
- Network tab, POST /api/tickets/{id}/comment
- Request body (comment text)

**Anlatım Metni:**
> "Network tab'da POST /api/tickets/5/comment endpoint'ine istek gitti. Request body'de comment text'i var. Response'da yeni TicketEvent döndü."

**Ekranda Gösterilecekler:**
- TicketsController.cs, AddComment metodu
- TicketEvent entity oluşturma

**Anlatım Metni:**
> "Koda bakalım. AddComment metodunda yeni TicketEvent entity'si oluşturuluyor, EventType 'Comment', Note alanına yorum metni yazılıyor, UserId mevcut kullanıcı, TicketId parametre. SaveChangesAsync ile kaydediliyor. SignalR Hub ile tüm bağlı client'lara yeni yorum broadcast ediliyor."

**Ekranda Gösterilecekler:**
- Database'de TicketEvents tablosu
- Yeni comment eventi

**Anlatım Metni:**
> "Veritabanında TicketEvents tablosuna baktığımızda, yeni event kaydını görüyoruz. EventType 'Comment', Note alanında yorum, TicketId ile ilişkilendirilmiş."

#### 6.5 Otomasyon ve SLA (30 saniye)

**Ekranda Gösterilecekler:**
- Admin paneli
- Otomasyon kuralları listesi

**Anlatım Metni:**
> "Admin paneline geçelim. Otomasyon kuralları bölümünde tanımlı kuralları görüyoruz. Örneğin: 'Priority = Critical ise otomatik olarak IT müdürüne ata' kuralı var. Bu kural arka planda AutomationService tarafından işleniyor."

**Ekranda Gösterilecekler:**
- AutomationService.cs dosyası
- ProcessRules metodu

**Anlatım Metni:**
> "AutomationService'de ProcessRules metodu her ticket oluşturulduğunda veya güncellendiğinde çalışıyor. Tüm aktif kuralları alıyor, koşulları kontrol ediyor, eşleşen kuralların eylemlerini gerçekleştiriyor: Atama yapma, email gönderme, durum değiştirme gibi."

**Ekranda Gösterilecekler:**
- SLA Plans listesi
- Ticket detayda SLA countdown

**Anlatım Metni:**
> "SLA planları bölümünde hizmet seviyesi anlaşmaları tanımlı. 'Standard' planı 4 saat yanıt, 24 saat çözüm süresi veriyor. Ticket'larda SLA countdown sayacı çalışıyor. SLAMonitorWorker arka planda her dakika kontrol yapıyor, süre dolmadan uyarı gönderiyor."

---

### BÖLÜM 7: SONUÇ VE ÖZETLEME (30 saniye)

**Ekranda Gösterilecekler:**
- Proje mimarisi diyagramı veya genel görünüm

**Anlatım Metni:**
> "Özetlemek gerekirse, Tickly projesi modern web teknolojileri ile geliştirilmiş, tam özellikli bir Help Desk sistemidir. Backend'de ASP.NET Core ile RESTful API, Entity Framework ile veritabanı erişimi, SignalR ile real-time iletişim sağladık. Frontend'de React ve TypeScript ile responsive, kullanıcı dostu arayüz geliştirdik. Otomasyon, SLA takibi, email entegrasyonu gibi gelişmiş özellikler ekledik. Veritabanı modellerimiz normalize edilmiş, ilişkiler doğru tanımlanmış. Güvenlik için JWT authentication ve BCrypt şifre hashleme kullandık. Proje Docker ile containerize edilmiş, kolayca deploy edilebilir. İzlediğiniz için teşekkür ederim."

---

## 🎬 VİDEO ÇEKİM NOTLARI

### Teknik Gereksinimler:
- **Ekran Kaydı:** 1920x1080 çözünürlük, 30 FPS
- **Ses Kaydı:** Net mikrofon, gürültüsüz ortam
- **Yazılım:** OBS Studio, Camtasia veya benzeri

### Önemli Hatırlatmalar:

1. **Yavaş ve Net Konuş:** Acele etme, her kavramı anlaşılır şekilde anlat
2. **Kod-Ekran Geçişleri:** Yumuş geçişler yap, izleyiciyi şaşırtma
3. **Zoom Kullan:** Kodu gösterirken zoom yap, okunabilir olsun
4. **Mouse ile İşaretle:** Önemli satırları mouse ile işaretle
5. **Highlight Yap:** VS Code'da önemli kod bloklarını seç
6. **Network Tab:** Browser DevTools'u kullan, istekleri göster
7. **Database:** Gerçek verileri göster, örnek senaryolar oluştur
8. **Pause Noktaları:** Her bölüm arası 2-3 saniye duraklama bırak
9. **Proof of Work:** Her özelliğin çalıştığını göster, sadece kod gösterme yeterli değil
10. **Canlı Göster:** Statik ekran görüntüleri yerine canlı çalışan sistemi göster

### Bölüm Süre Dağılımı Tavsiyesi:
- Giriş: 45 saniye
- Proje Yapısı: 1 dakika
- Backend Detay: 2.5 dakika
- Database Detay: 1 dakika
- Frontend Detay: 1 dakika
- Canlı Demo: 3 dakika
- Sonuç: 30 saniye
- **TOPLAM:** ~9.5 dakika

### Hazırlık:
- [ ] Veritabanında örnek veriler oluştur
- [ ] Test senaryoları hazırla (ticket oluştur, yorum ekle, vb.)
- [ ] Kod dosyalarını temizle, gereksiz yorumları sil
- [ ] Browser history temizle, professional görünsün
- [ ] VS Code temalarını ayarla, okunabilir font size
- [ ] Docker container'ları başlat, tüm servisler çalışır durumda olsun
- [ ] Network yavaşsa, istekleri cache'le veya local çalıştır

---

## 📝 ALTERNATİF SENARYO (Daha Kısa - 5-6 Dakika)

Eğer süreyi kısaltmak isterseniz:

**Çıkarılabilecek Kısımlar:**
- Frontend detayını azalt (30 saniye yeterli)
- Otomasyon ve SLA kısmını atla veya çok kısa geç
- Sadece 1-2 ana akış göster (login + ticket oluşturma)

**Odaklanılacak Noktalar:**
1. Backend API yapısı (Controller → Service → Database)
2. Bir işlemin baştan sona akışı (Örnek: Ticket Create)
3. Kod-Database-UI üçgenini net göster

---

## ✅ KALİTE KONTROL LİSTESİ

Video çekmeden önce kontrol et:

- [ ] Ses kalitesi test edildi mi?
- [ ] Ekran çözünürlüğü uygun mu?
- [ ] Tüm servisler çalışıyor mu?
- [ ] Database'de yeterli örnek veri var mı?
- [ ] Kod okunabilir mi? (Font size yeterli mi?)
- [ ] Browser console'da hata var mı?
- [ ] Senaryo metni hazır mı?
- [ ] Timer ile süre kontrolü yapıldı mı?
- [ ] Yedek plan var mı? (Bağlantı koparsa, hata olursa)

---

**SON NOT:** Bu senaryo bir rehberdir. Kendi anlatım tarzınıza göre uyarlayabilirsiniz. Önemli olan: Kod → Database → UI bağlantısını net göstermek ve her özelliğin nasıl çalıştığını detaylı anlatmaktır. Başarılar!
