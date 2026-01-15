# 📱 Tickly Mobile - Sunum Notları

## 1. Mobil Uygulamaya Giriş (30 saniye)

**"Tickly Mobile, iOS platformu için geliştirilmiş native benzeri bir Flutter uygulamasıdır."**

### Temel Bilgiler:
- **Platform:** iOS (Flutter ile cross-platform)
- **Framework:** Flutter 3.16+
- **Programlama Dili:** Dart 3.2+
- **Mimari:** Provider Pattern (State Management)
- **Backend Entegrasyon:** REST API + JWT Authentication

---

## 2. Teknik Altyapı (1 dakika)

### Kullanılan Teknolojiler:

```yaml
Ana Paketler:
├── flutter (SDK)
├── provider (State Management - MVVM pattern)
├── http (REST API istekleri)
├── shared_preferences (Token ve lokal veri saklama)
├── signalr_netcore (Gerçek zamanlı bildirimler)
├── flutter_local_notifications (Push notifications)
├── image_picker (Kameradan/Galeriden fotoğraf seçme)
├── file_picker (Dosya ekleme)
├── fl_chart (Grafikler - Dashboard için)
└── intl (Tarih/saat formatları)
```

### Mimari Yapı:
**MVVM (Model-View-ViewModel) + Provider Pattern**
- **Models:** Veri yapıları (User, Ticket, Comment, Department, Category)
- **Services:** API çağrıları ve iş mantığı
- **Providers:** State management (AuthProvider, TicketProvider, ThemeProvider)
- **Screens:** Kullanıcı arayüzü ekranları
- **Widgets:** Yeniden kullanılabilir UI bileşenleri

---

## 3. Proje Yapısı (45 saniye)

```
mobile/
├── lib/
│   ├── main.dart                    # Uygulama giriş noktası
│   │
│   ├── models/                      # Veri modelleri
│   │   ├── user.dart               # Kullanıcı modeli
│   │   ├── ticket.dart             # Ticket veri yapısı
│   │   ├── comment.dart            # Yorum modeli
│   │   ├── department.dart         # Departman modeli
│   │   └── category.dart           # Kategori modeli
│   │
│   ├── services/                    # Backend servisleri
│   │   ├── api_service.dart        # Base HTTP client
│   │   ├── auth_service.dart       # Login/Logout/Token işlemleri
│   │   ├── ticket_service.dart     # Ticket CRUD operasyonları
│   │   ├── data_service.dart       # Departman/Kategori verileri
│   │   └── notification_service.dart # Push notification yönetimi
│   │
│   ├── providers/                   # State Management
│   │   ├── auth_provider.dart      # Kimlik doğrulama durumu
│   │   ├── ticket_provider.dart    # Ticket state yönetimi
│   │   └── theme_provider.dart     # Dark/Light mode
│   │
│   ├── screens/                     # UI Ekranları
│   │   ├── login_screen.dart       # Giriş ekranı
│   │   ├── dashboard_screen.dart   # Ana panel (grafikler)
│   │   ├── ticket_list_screen.dart # Ticket listesi
│   │   ├── ticket_detail_screen.dart # Detay + Yorumlar
│   │   └── create_ticket_screen.dart # Yeni ticket formu
│   │
│   └── widgets/                     # Reusable components
│       ├── ticket_card.dart        # Ticket kartı UI
│       ├── comment_widget.dart     # Yorum gösterimi
│       └── custom_button.dart      # Özel butonlar
│
├── pubspec.yaml                     # Bağımlılıklar
└── README.md                        # Dokümantasyon
```

---

## 4. Özellikler ve Ekranlar (2 dakika)

### 🔐 1. Login Ekranı (login_screen.dart)
**Özellikler:**
- ✅ Email ve şifre ile giriş
- ✅ Form validasyonu (email formatı, şifre uzunluğu)
- ✅ JWT token otomatik saklama (shared_preferences)
- ✅ "Beni hatırla" özelliği
- ✅ Hata mesajları (yanlış şifre, ağ hatası)
- ✅ Loading animasyonları

**API Endpoint:** `POST /api/auth/login`

---

### 📊 2. Dashboard Ekranı (dashboard_screen.dart)
**İstatistikler:**
- 📈 Açık ticket sayısı
- ⏳ Bekleyen ticket sayısı
- ✅ Kapatılan ticket sayısı
- 📊 Öncelik dağılımı (fl_chart ile pasta grafik)
- 📅 Son 7 günlük ticket trendi (çizgi grafik)

**API Endpoints:**
- `GET /api/tickets/stats` - İstatistikler
- `GET /api/tickets/my` - Kullanıcıya ait ticketlar

---

### 🎫 3. Ticket Listesi Ekranı (ticket_list_screen.dart)
**Özellikler:**
- ✅ Tüm ticketları listeleme (Pull-to-refresh)
- ✅ Durum bazlı filtreleme (Open, Pending, Closed, All)
- ✅ Öncelik göstergesi (High=Kırmızı, Medium=Turuncu, Low=Yeşil)
- ✅ Arama fonksiyonu (başlık ve açıklamada arama)
- ✅ Sıralama (Tarih, Öncelik, Durum)
- ✅ Infinite scroll (sayfalama)
- ✅ FloatingActionButton ile hızlı ticket oluşturma

**API Endpoint:** `GET /api/tickets?status={status}&page={page}`

**UI Bileşenleri:**
```dart
TicketCard Widget:
├── Başlık
├── Açıklama (ilk 100 karakter)
├── Durum badge (Open/Pending/Closed)
├── Öncelik göstergesi (renkli bar)
├── Oluşturulma tarihi
└── Atanan kişi (varsa)
```

---

### ➕ 4. Yeni Ticket Oluşturma (create_ticket_screen.dart)
**Form Alanları:**
- 📝 **Başlık** (Zorunlu, min 5 karakter)
- 📄 **Açıklama** (Zorunlu, min 20 karakter)
- 🏢 **Departman** (Dropdown - API'den çekiliyor)
- 🏷️ **Kategori** (Dropdown - seçilen departmana göre)
- ⚡ **Öncelik** (Low / Medium / High)
- 📎 **Dosya Ekleme** (image_picker / file_picker)
  - Kameradan çekim
  - Galeriden seçim
  - Doküman ekleme (PDF, DOC)

**Validasyonlar:**
- Başlık boş olamaz
- Açıklama minimum 20 karakter
- Departman seçimi zorunlu
- Dosya boyutu max 10MB

**API Endpoint:** `POST /api/tickets`

---

### 🔍 5. Ticket Detay Ekranı (ticket_detail_screen.dart)
**Gösterilen Bilgiler:**
- 📋 Ticket bilgileri (başlık, açıklama, durum, öncelik)
- 👤 Oluşturan kişi ve tarih
- 🏢 Departman ve kategori
- 👨‍💼 Atanan agent (varsa)
- 📊 SLA bilgisi (kalan süre)
- 🕐 Aktivite zaman çizelgesi (Timeline)

**Yorumlar Bölümü:**
- 💬 Tüm yorumları görüntüleme (kronolojik)
- ➕ Yeni yorum ekleme (multiline text input)
- 📎 Yoruma dosya ekleme
- 👁️ Görünürlük seçimi (Public / Internal)
- ⏱️ Real-time güncelleme (SignalR)

**Durum Değiştirme:**
- Agent/Admin ise: Durum değiştirme butonu
- Open → Pending → Resolved → Closed

**API Endpoints:**
- `GET /api/tickets/{id}` - Detay
- `GET /api/tickets/{id}/events` - Aktiviteler
- `POST /api/tickets/{id}/comments` - Yorum ekle
- `PUT /api/tickets/{id}/status` - Durum güncelle

---

## 5. State Management - Provider Pattern (1 dakika)

### AuthProvider (auth_provider.dart)
**Durum Yönetimi:**
```dart
class AuthProvider extends ChangeNotifier {
  String? _token;
  User? _currentUser;
  bool _isAuthenticated = false;

  // Login
  Future<void> login(String email, String password) async {
    final response = await authService.login(email, password);
    _token = response['token'];
    _currentUser = User.fromJson(response['user']);
    _isAuthenticated = true;
    await _saveToken(_token!);
    notifyListeners(); // UI güncelleme
  }

  // Logout
  Future<void> logout() async {
    _token = null;
    _currentUser = null;
    _isAuthenticated = false;
    await _clearToken();
    notifyListeners();
  }

  // Auto-login (app açılışında)
  Future<void> checkAuth() async {
    _token = await _getStoredToken();
    if (_token != null) {
      _currentUser = await authService.getCurrentUser(_token!);
      _isAuthenticated = true;
    }
    notifyListeners();
  }
}
```

### TicketProvider (ticket_provider.dart)
**İşlevler:**
- Ticket listesi yönetimi (cache)
- Filtreleme ve sıralama state'i
- Yeni ticket ekleme sonrası liste güncelleme
- Real-time SignalR güncellemeleri

---

## 6. Backend Entegrasyonu (1 dakika)

### API Service (api_service.dart)
**Base HTTP Client:**
```dart
class ApiService {
  static const String baseUrl = 'http://YOUR_BACKEND_URL/api';
  
  // GET request
  Future<dynamic> get(String endpoint, {String? token}) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('API Error: ${response.statusCode}');
    }
  }

  // POST, PUT, DELETE metodları benzer şekilde...
}
```

### Authentication Flow:
```
1. Kullanıcı login ekranına email/şifre girer
   ↓
2. AuthService.login() → POST /api/auth/login
   ↓
3. Backend JWT token döner
   ↓
4. Token SharedPreferences'a kaydedilir
   ↓
5. AuthProvider state güncellenir (isAuthenticated = true)
   ↓
6. UI otomatik ticket listesine yönlendirir
   ↓
7. Her API isteğinde token Authorization header'ında gönderilir
```

---

## 7. Real-Time Özellikler (45 saniye)

### SignalR Entegrasyonu
**signalr_netcore paketi ile:**

```dart
// SignalR bağlantısı
final connection = HubConnectionBuilder()
  .withUrl('http://YOUR_BACKEND/ticketHub',
    options: HttpConnectionOptions(
      accessTokenFactory: () => Future.value(token),
    ))
  .build();

// Ticket güncellemelerini dinle
connection.on('TicketUpdated', (arguments) {
  final ticket = Ticket.fromJson(arguments[0]);
  ticketProvider.updateTicket(ticket);
});

// Yeni yorum bildirimi
connection.on('NewComment', (arguments) {
  final comment = Comment.fromJson(arguments[0]);
  showNotification('Yeni yorum: ${comment.text}');
});
```

**Gerçek Zamanlı Güncellemeler:**
- ✅ Ticket durumu değiştiğinde anlık bildirim
- ✅ Yeni yorum eklendiğinde detay sayfası otomatik güncellenir
- ✅ Agent atandığında notification
- ✅ SLA süresi dolmak üzereyken uyarı

---

## 8. Bildirimler (Notifications) - 30 saniye

### Local Notifications (flutter_local_notifications)
**Kullanım Senaryoları:**
- 🔔 Ticket'a yeni yorum geldi
- ⚠️ SLA süresi dolmak üzere
- ✅ Ticket çözüme kavuştu
- 👤 Agent atandı
- 📊 Durum değişti (Open → Pending)

**Bildirim Ayarları:**
- Başlık ve içerik özelleştirme
- Bildirime tıklandığında ilgili ticket'a yönlendirme
- Ses ve titreşim ayarları
- Bildirim badge sayısı

---

## 9. UI/UX Özellikleri (45 saniye)

### Tema Desteği (ThemeProvider)
- 🌞 **Light Mode:** Açık renkli temiz arayüz
- 🌙 **Dark Mode:** Gece kullanımı için koyu tema
- ⚙️ Kullanıcı tercihine göre otomatik geçiş

### Material Design Bileşenleri:
- **Cards:** Ticket kartları için elevation ve shadow
- **BottomNavigationBar:** Ekranlar arası hızlı geçiş
- **FloatingActionButton:** Hızlı ticket oluşturma
- **Chips:** Durum ve öncelik göstergeleri
- **SnackBar:** İşlem geri bildirimleri
- **Dialog:** Onay/İptal mesajları
- **Pull-to-Refresh:** Listeyi yenileme

### Animasyonlar:
- Sayfa geçiş animasyonları
- Loading spinners
- Fade-in efektleri
- Swipe to delete/archive (gelecek özellik)

---

## 10. Güvenlik (30 saniye)

### Uygulanan Güvenlik Önlemleri:
- 🔐 **JWT Token:** Tüm API isteklerinde Bearer token
- 💾 **Secure Storage:** Token şifreli saklanıyor (shared_preferences)
- 🔄 **Token Refresh:** Süre dolunca otomatik yenileme
- 🚪 **Auto Logout:** Token geçersizse login'e yönlendirme
- ✅ **Input Validation:** Tüm formlarda client-side validation
- 🌐 **HTTPS:** Production'da SSL/TLS
- 🔒 **Biometric Auth (Gelecek):** Face ID / Touch ID entegrasyonu

---

## 11. Performans Optimizasyonları (30 saniye)

### Cache Mekanizması:
- 📦 **Provider State:** Tekrar API çağrısı yapmadan cache'den veri
- 🖼️ **Image Caching:** Profil fotoğrafları ve dosyalar cache'lenir
- 🔄 **Lazy Loading:** Sadece görünen ticketları yükle
- ⚡ **Pagination:** 20'şer ticket yükleyerek performans artışı

### Network Optimizasyonu:
- ⏱️ **Timeout Ayarları:** 30 saniye connection timeout
- 🔁 **Retry Logic:** Başarısız istekleri 3 kere tekrar dene
- 📶 **Offline Support (Gelecek):** İnternetsiz veri görüntüleme

---

## 12. Test ve Kalite (30 saniye)

### Test Yapısı:
```
test/
├── unit_tests/           # Servis ve model testleri
│   ├── auth_service_test.dart
│   └── ticket_service_test.dart
├── widget_tests/         # UI widget testleri
│   ├── login_screen_test.dart
│   └── ticket_card_test.dart
└── integration_tests/    # End-to-end testler
    └── app_test.dart
```

### Kod Kalitesi:
- ✅ **Flutter Lints:** Dart code style kontrolleri
- 📊 **Code Coverage:** %80+ hedef
- 🐛 **Error Handling:** Try-catch blokları
- 📝 **Logging:** Debug ve production logları

---

## 13. Kurulum ve Çalıştırma (30 saniye)

### Geliştirme Ortamı:
```bash
# 1. Flutter SDK kontrolü
flutter doctor

# 2. Bağımlılıkları yükle
cd mobile
flutter pub get

# 3. iOS Simulator'da çalıştır
flutter run

# 4. Build (Release mode)
flutter build ios --release
```

### Backend URL Yapılandırması:
**lib/services/api_service.dart** dosyasında:
```dart
static const String baseUrl = 'http://localhost:5000/api';  // Development
// static const String baseUrl = 'https://your-domain.com/api';  // Production
```

---

## 14. Gelecek Özellikler (Roadmap) - 30 saniye

### Planlanan Geliştirmeler:
- 📱 **Android Desteği:** Cross-platform tamamen aktif
- 🎙️ **Sesli Mesaj:** Yorumlara ses kaydı ekleme
- 🌍 **Çoklu Dil:** Türkçe/İngilizce dil desteği
- 📸 **OCR:** Ekran görüntüsünden otomatik ticket oluşturma
- 🤖 **AI Önerileri:** Kategori ve departman önerisi
- 💬 **Chat Modu:** Agent ile canlı sohbet
- 📊 **Gelişmiş Dashboard:** Daha fazla analitik
- 🔐 **Biometric Login:** Face ID / Touch ID
- 📴 **Offline Mode:** İnternetsiz çalışma
- 🎨 **Custom Themes:** Kullanıcı teması özelleştirme

---

## 15. Demo Senaryosu (Video için)

### 🎬 Demo Akışı (3-4 dakika):

**1. Uygulama Açılışı (10 saniye)**
- Splash screen göster
- Auto-login ile dashboard'a geç

**2. Dashboard (20 saniye)**
- İstatistikleri göster
- Grafikleri açıkla
- Son ticketları listele

**3. Ticket Listesi (30 saniye)**
- Pull-to-refresh yap
- Filtre uygula (sadece Open ticketlar)
- Arama yap ("sunucu")
- Bir ticket'a tıkla

**4. Ticket Detay (40 saniye)**
- Ticket bilgilerini göster
- Yorumları scroll et
- Yeni yorum ekle
- "Mesajınız gönderildi" snackbar göster
- Real-time yorumun eklendiğini göster

**5. Yeni Ticket Oluşturma (60 saniye)**
- "+" butonuna tıkla
- Başlık yaz: "Yazıcı çalışmıyor"
- Açıklama ekle
- Departman seç: "IT Support"
- Kategori seç: "Hardware"
- Öncelik: "High"
- Fotoğraf ekle (galeriden)
- "Oluştur" butonuna bas
- Başarı mesajı
- Ticket listesinde yeni ticket'ı göster

**6. Tema Değiştirme (10 saniye)**
- Dark mode'a geç
- UI'ın değiştiğini göster

**7. Logout (10 saniye)**
- Profil → Logout
- Login ekranına dönüş

---

## 16. Sunum İpuçları

### Gösterirken Vurgulanacak Noktalar:
✅ **Native-like UX:** Flutter ile iOS benzeri smooth deneyim  
✅ **Real-time:** SignalR ile anlık güncellemeler  
✅ **Offline-ready:** Cache mekanizması  
✅ **Clean Code:** MVVM + Provider pattern  
✅ **Security:** JWT + Secure storage  
✅ **Responsive:** Her ekran boyutuna uyumlu  

### Dikkat Edilecekler:
- 📱 Simulator'ı önceden aç ve hazır tut
- 🔌 Backend'in çalıştığından emin ol
- 📊 Demo verilerini önceden yükle (test kullanıcıları ve ticketlar)
- 🎨 Dark mode da test edilmiş olsun
- 📸 Ekran kayıt yaparken FPS düşüklüğü olmasın

---

## Özet (Son 15 saniye)

**"Tickly Mobile, Flutter ile geliştirilmiş, modern ve kullanıcı dostu bir iOS uygulamasıdır. 
Real-time bildirimler, güvenli authentication, offline cache ve clean architecture ile 
mobil help desk yönetimini kolaylaştırır. Backend ile seamless entegrasyon sayesinde 
kullanıcılar her yerden ticketlarını yönetebilir."**

---

## 📚 Ek Kaynaklar

- [Flutter Documentation](https://docs.flutter.dev/)
- [Provider Package](https://pub.dev/packages/provider)
- [SignalR Client](https://pub.dev/packages/signalr_netcore)
- [Material Design Guidelines](https://m3.material.io/)

---

**Not:** Bu sunum notları 8-10 dakikalık bir sunumda tüm teknik detayları kapsamak için hazırlanmıştır. Video çekiminde sadece önemli ekranları göstererek, kod göstermeden UI/UX odaklı bir demo yapabilirsiniz.
