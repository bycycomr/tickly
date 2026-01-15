# Tickly Proje Dokümantasyonu

Bu klasör, Tickly Help Desk Sistemi ve Mobil Uygulaması için profesyonel proje dökümanlarını içerir.

## 📄 Dosyalar

### Backend & Frontend Dökümanları

#### 1. LaTeX Dökümanı (.tex)
- **Dosya:** `Tickly_Proje_Dokumani.tex`
- **Format:** LaTeX kaynak dosyası
- **Kullanım:** Backend ve Frontend için akademik/profesyonel PDF dökümanı

#### 2. Word Dökümanı (.docx)
- **Dosya:** `Tickly_Proje_Dokumani.docx`
- **Format:** Microsoft Word 2016+
- **Kullanım:** Backend ve Frontend için düzenlenebilir Word formatı

### Mobil Uygulama Dökümanları

#### 3. Mobile LaTeX Dökümanı (.tex)
- **Dosya:** `Tickly_Mobile_Dokumani.tex`
- **Format:** LaTeX kaynak dosyası
- **Kullanım:** Flutter iOS uygulaması için akademik/profesyonel PDF

#### 4. Mobile Word Dökümanı (.docx)
- **Dosya:** `Tickly_Mobile_Dokumani.docx`
- **Format:** Microsoft Word 2016+
- **Kullanım:** Flutter iOS uygulaması için düzenlenebilir döküman

### Yardımcı Dosyalar

#### 5. Python Scripts
- **create_word_doc.py:** Backend/Frontend Word dökümanı oluşturur
- **create_mobile_word_doc.py:** Mobil Word dökümanı oluşturur

#### 6. PowerShell Script
- **compile-latex.ps1:** LaTeX dosyalarını PDF'e dönüştürür

**11 Ana Bölüm (Backend & Frontend):**
1. Proje Genel Bakış
2. Teknoloji Stack (ASP.NET Core, React, TypeScript)
3. Sistem Mimarisi
4. Veritabanı Şeması
5. Ana Özellikler (Ticket, SLA, Otomasyon)
6. Güvenlik ve Yetkilendirme
7. Kurulum ve Deployment
8. API Dokümantasyonu
9. Performans ve Ölçeklenebilirlik
10. Test ve Kalite Güvencesi
11. Sonuç ve Gelecek Planları

### Mobil Uygulama Dokümanı

**14 Ana Bölüm (Flutter iOS App):**
1. Proje Genel Bakış
2. Teknoloji Stack (Flutter, Dart, Packages)
3. Uygulama Mimarisi
4. Ekran Tasarımları ve Akışı
5. State Management (Provider Pattern)
6. API Entegrasyonu
7. Data Models
8. Gerçek Zamanlı İletişim (SignalR)
9. Push Notifications
10. Kurulum ve Çalıştırma
11. Tema ve UI Customization
12. Test Stratejisi
13. Performans Optimizasyonu
14. Sonuç ve Gelecek Planları

---

## 🚀 Hızlı Kullanım

### LaTeX'ten PDF Oluşturma

**Yöntem 1: Online (Overleaf)**
1. [Overleaf](https://www.overleaf.com/) sitesine gidin
2. "New Project" > "Upload Project" seçin
3. `Tickly_Proje_Dokumani.tex` dosyasını yükleyin
4. "Recompile" butonuna basın
5. PDF otomatik oluşturulacaktır

**Yöntem 2: Lokal (TeX Live / MiKTeX)**

Windows için:
```powershell
# MiKTeX kurulu ise
pdflatex Tickly_Proje_Dokumani.tex
pdflatex Tickly_Proje_Dokumani.tex  # İçindekiler için ikinci kez
```

Linux için:
```bash
# TeX Live kurulu ise
pdflatex Tickly_Proje_Dokumani.tex
pdflatex Tickly_Proje_Dokumani.tex  # İçindekiler için ikinci kez
```

**Yöntem 3: Docker ile**
```bash
docker run --rm -v ${PWD}:/workspace texlive/texlive pdflatex Tickly_Proje_Dokumani.tex
```

### 2. Word Dökümanı (.docx)
- **Dosya:** `Tickly_Proje_Dokumani.docx`
- **Format:** Microsoft Word 2016+
- **Kullanım:** Düzenlenebilir Word formatında döküman

#### Word Dökümanını Açma
- Microsoft Word ile doğrudan açın
- Google Docs'a yükleyin (Dosya > Aç > Yükle)
- LibreOffice Writer ile açın
- Online: [Office 365](https://www.office.com/) üzerinden açın

### 3. Python Script
- **Dosya:** `create_word_doc.py`
- **Amaç:** Word dökümanını programatik olarak oluşturur
- **Kullanım:**
  ```bash
  pip install python-docx
  python create_word_doc.py
  ```

## 📋 Doküman İçeriği

Her iki format da aşağıdaki bölümleri içerir:

1. **Proje Genel Bakış**
   - Proje tanımı
   - Proje kapsamı
   - Hedef kullanıcılar

2. **Teknoloji Stack**
   - Backend teknolojileri (ASP.NET Core, C#, EF Core)
   - Frontend teknolojileri (React, TypeScript, Vite)
   - DevOps araçları (Docker, Git)

3. **Sistem Mimarisi**
   - Katmanlı mimari diyagramı
   - Her katmanın detaylı açıklaması

4. **Veritabanı Şeması**
   - Ana tablolar
   - İlişkiler (ERD)
   - Detaylı tablo şemaları

5. **Ana Özellikler**
   - Ticket yönetimi
   - SLA (Service Level Agreement)
   - Otomasyon kuralları
   - Email entegrasyonu
   - Bilgi bankası
   - Gerçek zamanlı bildirimler

6. **Güvenlik ve Yetkilendirme**
   - JWT authentication
   - RBAC (Role-Based Access Control)
   - Güvenlik önlemleri

7. **Kurulum ve Deployment**
   - Geliştirme ortamı kurulumu
   - Docker ile deployment
   - Production deployment

8. **API Dokümantasyonu**
   - RESTful endpoints
   - SignalR hubs
   - Swagger/OpenAPI

9. **Performans ve Ölçeklenebilirlik**
   - Performans metrikleri
   - Scaling stratejileri

10. **Test ve Kalite Güvencesi**
    - Test stratejisi
    - Code quality tools

11. **Sonuç ve Gelecek Planları**
    - Proje sonuçları
    - Gelecek geliştirmeler

## 🎨 Doküman Özellikleri

### LaTeX Dökümanı
- ✅ Profesyonel akademik görünüm
- ✅ Otomatik içindekiler (Table of Contents)
- ✅ Renkli başlıklar ve vurgular
- ✅ TikZ diyagramları
- ✅ Syntax-highlighted kod blokları
- ✅ Tablo ve liste formatları
- ✅ Hyperlink desteği
- ✅ Header/Footer ile sayfa numaraları

### Word Dökümanı
- ✅ Profesyonel ofis görünümü
- ✅ Renkli kapak sayfası
- ✅ Otomatik içindekiler
- ✅ Tablo stilleri (Light Grid Accent 1)
- ✅ Başlık hiyerarşisi (Heading 1-4)
- ✅ Liste formatları (bullet, numbered)
- ✅ Düzenlenebilir format
- ✅ Microsoft Office uyumlu

## 🔧 Gereksinimler

### LaTeX için
- **Online:** Sadece internet tarayıcısı (Overleaf)
- **Lokal:**
  - Windows: MiKTeX veya TeX Live
  - macOS: MacTeX
  - Linux: TeX Live
  
### Word için
- Microsoft Word 2016 veya üzeri
- LibreOffice Writer 6.0+
- Google Docs (online)
- Office 365 (online)

### Python Script için
- Python 3.7+
- `python-docx` kütüphanesi

## 📊 Dosya Boyutları (Yaklaşık)

- `Tickly_Proje_Dokumani.tex`: ~70 KB
- `Tickly_Proje_Dokumani.docx`: ~150 KB
- `Tickly_Proje_Dokumani.pdf` (LaTeX'ten): ~500 KB

## 🌐 Ek Kaynaklar

- **Overleaf (LaTeX Online):** https://www.overleaf.com/
- **LaTeX Dokümantasyon:** https://www.latex-project.org/
- **python-docx Docs:** https://python-docx.readthedocs.io/
- **Tickly Projesi:** `../README.md`

## 📝 Notlar

1. **LaTeX PDF Çıktısı:** İlk derlemede bazı referanslar eksik olabilir. En iyi sonuç için **2 kez** derleyin.

2. **Word Düzenleme:** Word dökümanı düzenlenebilir formatdadır. İstediğiniz gibi özelleştirebilirsiniz.

3. **Versiyon Kontrolü:** Dokümanları güncellerken git ile versiyon kontrolü yapmanız önerilir.

4. **Lisans:** Bu dokümanlar proje ile aynı lisans altındadır.

## 🚀 Hızlı Başlangıç

```bash
# 1. Word dökümanını oluştur (eğer yoksa)
python create_word_doc.py

# 2. LaTeX'i PDF'e çevir (MiKTeX/TeX Live kurulu ise)
pdflatex Tickly_Proje_Dokumani.tex
pdflatex Tickly_Proje_Dokumani.tex

# 3. Veya Overleaf'te aç (önerilir)
# https://www.overleaf.com/ > Upload Project
```

## 📧 İletişim

Sorularınız için projenin ana README.md dosyasına bakın.

---

*Son güncelleme: Ocak 2026*
