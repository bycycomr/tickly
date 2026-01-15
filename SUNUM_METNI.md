# Tickly Mobile - Flutter Uygulaması
## Mobil Uygulama Sunumu

---

## Merhaba! 👋

Bugün sizlere **Tickly Mobile** - Flutter ile geliştirilmiş cross-platform mobil uygulamayı tanıtacağım.

---

## Neden Mobil?

Help desk sistemlerinde **mobilite kritik**:
- ✅ Her yerden ticket oluşturma
- ✅ Anlık bildirimler
- ✅ Hızlı ticket takibi
- ✅ Fotoğraf çekerek sorun bildirme

---

## Teknik Altyapı

**Framework:** Flutter 3.16+  
**Dil:** Dart 3.2+  
**Platform:** iOS & Android (Cross-platform)  
**Mimari:** MVVM + Provider Pattern  

### Ana Teknolojiler
```
Flutter SDK
├── provider (State Management)
├── http (REST API)
├── shared_preferences (Token saklama)
├── signalr_netcore (Real-time)
├── flutter_local_notifications (Push)
├── image_picker (Kamera/Galeri)
├── file_picker (Dosya ekleme)
└── fl_chart (Grafikler)
```

---

## Proje Yapısı

```
mobile/lib/
├── main.dart              # Giriş noktası
├── models/                # Veri modelleri
│   ├── user.dart
│   ├── ticket.dart
│   ├── comment.dart
│   ├── department.dart
│   └── category.dart
├── services/              # Backend servisleri
│   ├── api_service.dart
│   ├── auth_service.dart
│   ├── ticket_service.dart
│   └── notification_service.dart
├── providers/             # State Management
│   ├── auth_provider.dart
│   ├── ticket_provider.dart
│   └── theme_provider.dart
├── screens/               # UI Ekranları
│   ├── login_screen.dart
│   ├── dashboard_screen.dart
│   ├── ticket_list_screen.dart
│   ├── ticket_detail_screen.dart
│   └── create_ticket_screen.dart
└── widgets/               # Reusable bileşenler
```

**MVVM Pattern:** Model → ViewModel (Provider) → View

---

## 5 Ana Ekran

### 1️⃣ Login Screen
- Email/şifre girişi
- Form validasyonu
- JWT token alımı
- Otomatik login (remember me)
- Loading animasyonları

### 2️⃣ Dashboard
- 📊 Açık ticket sayısı
- ⏳ Bekleyen ticket sayısı
- ✅ Kapatılan ticket sayısı
- 📈 Öncelik dağılımı (pasta grafik)
- 📅 Son 7 günlük trend (çizgi grafik)

### 3️⃣ Ticket Listesi
- Pull-to-refresh ile yenileme
- Durum filtreleme (Open/Pending/Closed)
- Arama fonksiyonu
- Öncelik göstergesi (renkli)
- Infinite scroll (sayfalama)
- FloatingActionButton ile hızlı ticket oluşturma

### 4️⃣ Ticket Detay
- Ticket bilgileri (başlık, açıklama, durum)
- Atanan kişi ve departman
- SLA kalan süre
- Aktivite timeline
- Yorumlar bölümü
- Yeni yorum ekleme
- Real-time güncelleme

### 5️⃣ Yeni Ticket Oluşturma
- Başlık (min 5 karakter)
- Açıklama (min 20 karakter)
- Departman seçimi (dropdown)
- Kategori seçimi (departmana göre)
- Öncelik (Low/Medium/High)
- Kameradan fotoğraf çekme
- Galeriden resim seçme
- Dosya ekleme (PDF, DOC)

---

## State Management: Provider

```dart
class AuthProvider extends ChangeNotifier {
  String? _token;
  User? _currentUser;
  bool _isAuthenticated = false;

  Future<void> login(String email, String password) {
    // API çağrısı
    // Token kaydetme
    // State güncelleme
    notifyListeners(); // ✨ UI otomatik güncellenir
  }

  Future<void> logout() {
    // Token temizleme
    // State sıfırlama
    notifyListeners();
  }
}
```

**Provider Avantajları:**
- ✅ Merkezi state yönetimi
- ✅ Otomatik UI güncellemesi
- ✅ Kolay test edilebilir
- ✅ Az boilerplate kod

---

## Backend Entegrasyonu

### API Service
```dart
class ApiService {
  static const baseUrl = 'http://YOUR_BACKEND/api';
  
  Future<dynamic> get(String endpoint, {String? token}) {
    // HTTP GET request
    // Authorization header ile token
    // JSON parse
  }
  
  Future<dynamic> post(String endpoint, dynamic body) {
    // HTTP POST request
    // Body serialization
    // Error handling
  }
}
```

### Authentication Flow
```
1. Login ekranında email/şifre
   ↓
2. AuthService.login() → POST /api/auth/login
   ↓
3. Backend JWT token döner
   ↓
4. Token SharedPreferences'a kaydedilir
   ↓
5. AuthProvider state güncellenir
   ↓
6. UI otomatik ticket listesine yönlendirir
```

---

## Real-Time Özellikler

### SignalR Entegrasyonu
```dart
// WebSocket bağlantısı
final connection = HubConnectionBuilder()
  .withUrl('http://backend/ticketHub',
    options: HttpConnectionOptions(
      accessTokenFactory: () => Future.value(token),
    ))
  .build();

// Event dinleme
connection.on('TicketUpdated', (arguments) {
  // Ticket güncellendi
  ticketProvider.updateTicket(ticket);
});

connection.on('NewComment', (arguments) {
  // Yeni yorum geldi
  showNotification('Yeni yorum!');
});
```

**Real-time Senaryolar:**
- 🔔 Ticket'a yeni yorum → Push notification
- ⚠️ SLA süresi doluyor → Uyarı
- ✅ Ticket çözüldü → Bildirim
- 👤 Agent atandı → Notification

---

## Push Notifications

### Local Notifications
```dart
void showNotification(String title, String body) {
  flutterLocalNotificationsPlugin.show(
    0,
    title,
    body,
    NotificationDetails(
      android: AndroidNotificationDetails(...),
      iOS: DarwinNotificationDetails(...),
    ),
  );
}
```

**Bildirim Tipleri:**
- 💬 Yeni yorum
- 🔄 Durum değişikliği
- ⏰ SLA uyarısı
- ✅ Ticket kapatıldı

---

## UI/UX Özellikleri

### Material Design
- **Cards:** Ticket kartları
- **BottomNavigationBar:** Ekran geçişleri
- **FloatingActionButton:** Hızlı aksiyon
- **Chips:** Durum/öncelik göstergeleri
- **SnackBar:** İşlem geri bildirimleri
- **Dialogs:** Onay mesajları

### Dark/Light Mode
```dart
ThemeProvider ile tema değiştirme:
- 🌞 Light mode: Açık temiz arayüz
- 🌙 Dark mode: Gece kullanımı
- ⚙️ Otomatik geçiş
```

### Animasyonlar
- Sayfa geçiş animasyonları
- Loading spinners
- Fade-in efektleri
- Smooth scroll

---

## Güvenlik

🔐 **JWT Token:** Her API isteğinde Bearer token  
💾 **Secure Storage:** Token şifreli saklanıyor  
🔄 **Token Refresh:** Otomatik yenileme  
🚪 **Auto Logout:** Geçersiz token'da login'e yönlendirme  
✅ **Input Validation:** Client-side form kontrolü  
🌐 **HTTPS:** Production'da SSL/TLS  

---

## Performans Optimizasyonları

### Cache Mekanizması
- Provider state ile veri cache
- Image caching
- Lazy loading
- Pagination (20'şer ticket)

### Network
- 30 saniye timeout
- Retry logic (3 deneme)
- Offline support (gelecek)

---

## Demo Senaryosu

### 1. Uygulama Açılışı (10 sn)
- Splash screen
- Auto-login
- Dashboard'a geçiş

### 2. Dashboard (20 sn)
- İstatistikleri göster
- Grafikler
- Son ticketlar

### 3. Ticket Listesi (30 sn)
- Pull-to-refresh
- Filtre (sadece Open)
- Arama ("yazıcı")
- Bir ticket'a tıkla

### 4. Ticket Detay (40 sn)
- Bilgileri göster
- Yorumları oku
- Yeni yorum ekle
- Real-time güncelleme

### 5. Yeni Ticket (60 sn)
- "+" butonuna tıkla
- Form doldur
- Fotoğraf ekle
- Oluştur
- Liste güncellenir

### 6. Dark Mode (10 sn)
- Tema değiştir
- UI göster

---

## Öne Çıkan Özellikler

🚀 **Native-like Performance** - Flutter'ın smooth UI'ı  
📱 **Cross-Platform** - Tek kod iOS + Android  
🔄 **Real-time** - SignalR ile anlık güncellemeler  
💾 **Offline-ready** - Cache ile hızlı yükleme  
🎨 **Modern UI** - Material Design 3  
📸 **Kamera Entegrasyonu** - Fotoğraf çekme  
🔐 **Secure** - JWT + encrypted storage  
📊 **Analytics** - fl_chart ile grafikler  

---

## Zorluklar ve Çözümler

### Zorluk 1: State Yönetimi
**Çözüm:** Provider pattern ile merkezi state

### Zorluk 2: Real-time Sync
**Çözüm:** SignalR WebSocket bağlantısı

### Zorluk 3: Token Yönetimi
**Çözüm:** Shared preferences + auto-refresh

### Zorluk 4: Dosya Yükleme
**Çözüm:** image_picker + multipart/form-data

---

## Gelecek Planları

📱 **App Store/Play Store** yayınlama  
📴 **Offline Mode** - İnternetsiz çalışma  
🔐 **Biometric Auth** - Face ID / Touch ID  
🌍 **Çoklu Dil** - TR/EN desteği  
🤖 **AI Önerileri** - Kategori tahmini  
💬 **Chat Mode** - Canlı sohbet  
🎙️ **Sesli Mesaj** - Yorum kaydı  
📸 **OCR** - Ekran görüntüsünden ticket  

---

## İstatistikler

**Ekran Sayısı:** 5 ana ekran  
**Widget:** 15+ custom widget  
**Model:** 5 veri modeli  
**Service:** 5 API servisi  
**Provider:** 3 state provider  
**Kod Satırı:** ~3,500 satır  

**Desteklenen Platformlar:**
- ✅ iOS 12+
- ✅ Android 6.0+
- ✅ Web (Chrome)

---

## Teşekkürler! 🙏

**Tickly Mobile** - Her yerden ticket yönetimi.

Sorularınızı almaktan mutluluk duyarım! 😊

---

### Çalıştırma

```bash
# Bağımlılıkları yükle
flutter pub get

# Chrome'da çalıştır
flutter run -d chrome

# iOS Simulator
flutter run -d ios

# Android Emulator
flutter run -d android
```

