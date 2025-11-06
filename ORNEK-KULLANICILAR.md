# Örnek Kullanıcılar Listesi

## Departmanlar (Önce bunları oluşturun)

Admin Panel → Departmanlar sekmesinde aşağıdaki departmanları oluşturun:

1. **Bilgi Teknolojileri**
   - Açıklama: IT ve Yazılım Departmanı

2. **İnsan Kaynakları**
   - Açıklama: HR Departmanı

3. **Muhasebe**
   - Açıklama: Finans ve Muhasebe

4. **Pazarlama**
   - Açıklama: Pazarlama ve Satış

5. **Üretim**
   - Açıklama: Üretim ve Operasyon

---

## 10 Örnek Çalışan

Admin Panel → Kullanıcılar sekmesinde aşağıdaki kullanıcıları oluşturun:

### 1. Ahmet Yılmaz
- **Kullanıcı Adı:** ahmet.yilmaz
- **Email:** ahmet.yilmaz@sirket.com
- **Ad Soyad:** Ahmet Yılmaz
- **Ünvan:** Yazılım Geliştirici
- **Şifre:** Password123
- **Departman:** Bilgi Teknolojileri

### 2. Ayşe Demir
- **Kullanıcı Adı:** ayse.demir
- **Email:** ayse.demir@sirket.com
- **Ad Soyad:** Ayşe Demir
- **Ünvan:** HR Uzmanı
- **Şifre:** Password123
- **Departman:** İnsan Kaynakları

### 3. Mehmet Kaya
- **Kullanıcı Adı:** mehmet.kaya
- **Email:** mehmet.kaya@sirket.com
- **Ad Soyad:** Mehmet Kaya
- **Ünvan:** Muhasebe Müdürü
- **Şifre:** Password123
- **Departman:** Muhasebe

### 4. Fatma Çelik
- **Kullanıcı Adı:** fatma.celik
- **Email:** fatma.celik@sirket.com
- **Ad Soyad:** Fatma Çelik
- **Ünvan:** Pazarlama Uzmanı
- **Şifre:** Password123
- **Departman:** Pazarlama

### 5. Ali Öztürk
- **Kullanıcı Adı:** ali.ozturk
- **Email:** ali.ozturk@sirket.com
- **Ad Soyad:** Ali Öztürk
- **Ünvan:** Üretim Sorumlusu
- **Şifre:** Password123
- **Departman:** Üretim

### 6. Zeynep Arslan
- **Kullanıcı Adı:** zeynep.arslan
- **Email:** zeynep.arslan@sirket.com
- **Ad Soyad:** Zeynep Arslan
- **Ünvan:** Sistem Yöneticisi
- **Şifre:** Password123
- **Departman:** Bilgi Teknolojileri

### 7. Mustafa Doğan
- **Kullanıcı Adı:** mustafa.dogan
- **Email:** mustafa.dogan@sirket.com
- **Ad Soyad:** Mustafa Doğan
- **Ünvan:** İK Müdürü
- **Şifre:** Password123
- **Departman:** İnsan Kaynakları

### 8. Elif Kurt
- **Kullanıcı Adı:** elif.kurt
- **Email:** elif.kurt@sirket.com
- **Ad Soyad:** Elif Kurt
- **Ünvan:** Muhasebe Uzmanı
- **Şifre:** Password123
- **Departman:** Muhasebe

### 9. Emre Şahin
- **Kullanıcı Adı:** emre.sahin
- **Email:** emre.sahin@sirket.com
- **Ad Soyad:** Emre Şahin
- **Ünvan:** Satış Temsilcisi
- **Şifre:** Password123
- **Departman:** Pazarlama

### 10. Seda Yıldız
- **Kullanıcı Adı:** seda.yildiz
- **Email:** seda.yildiz@sirket.com
- **Ad Soyad:** Seda Yıldız
- **Ünvan:** Kalite Kontrol
- **Şifre:** Password123
- **Departman:** Üretim

---

## Kullanıcı Oluşturma Adımları

1. **Departmanları Oluştur:**
   - Admin Panel'e giriş yap (superadmin/password)
   - **Departmanlar** sekmesine git
   - Her departman için:
     - "Departman Adı" ve "Açıklama" alanlarını doldur
     - "Departman Oluştur" butonuna tıkla

2. **Kullanıcıları Oluştur:**
   - **Kullanıcılar** sekmesine git
   - Her kullanıcı için yukarıdaki bilgileri gir
   - Departman dropdown'ından ilgili departmanı seç
   - "Kullanıcı Oluştur" butonuna tıkla
   - Kullanıcı otomatik olarak seçilen departmana "Son Kullanıcı" rolü ile atanacak

3. **Test Et:**
   - Çıkış yap
   - Herhangi bir kullanıcı ile giriş yap (örn: ahmet.yilmaz / Password123)
   - Talep oluşturabildiğini kontrol et

---

## Notlar

- Tüm kullanıcıların şifresi: **Password123**
- Kullanıcılar "EndUser" (Son Kullanıcı) rolü ile atanacak
- Bu kullanıcılar talep oluşturabilir ve kendi taleplerini görüntüleyebilir
- SuperAdmin tüm talepleri görebilir ve yönetebilir
