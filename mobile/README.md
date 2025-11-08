# Tickly Mobile - Flutter iOS App

## 📱 Proje Tanımı

Tickly Help Desk sisteminin iOS mobil uygulaması. Kullanıcılar ticket açabilir, takip edebilir ve yorumlar ekleyebilir.

## 🚀 Özellikler

- ✅ Kullanıcı girişi (Login)
- ✅ Ticket listesi
- ✅ Yeni ticket oluşturma
- ✅ Ticket detayı görüntüleme
- ✅ Yorum ekleme
- ✅ Dosya ekleme
- ✅ Push notifications (opsiyonel)

## 🛠️ Teknolojiler

- **Flutter** 3.16+
- **Dart** 3.2+
- **HTTP Package** - REST API çağrıları
- **Provider** - State management
- **Shared Preferences** - Local storage (token)

## 📦 Kurulum

### 1. Flutter SDK Kurulumu
```bash
# macOS için Homebrew ile
brew install flutter

# veya https://docs.flutter.dev/get-started/install/macos
```

### 2. Proje Oluşturma
```bash
cd mobile
flutter create tickly_mobile
cd tickly_mobile
```

### 3. Bağımlılıkları Yükleme
```bash
flutter pub get
```

### 4. iOS Simulator'da Çalıştırma
```bash
flutter run
```

## 🔌 Backend Bağlantısı

**API Base URL:** `http://localhost:5000/api` (Development)
**Production:** Backend'in canlı URL'i

### API Endpoints Kullanılacak:

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/auth/login` | POST | Kullanıcı girişi |
| `/auth/me` | GET | Kullanıcı bilgisi |
| `/tickets` | GET | Ticket listesi |
| `/tickets` | POST | Yeni ticket |
| `/tickets/{id}` | GET | Ticket detayı |
| `/tickets/{id}/comments` | POST | Yorum ekle |
| `/tickets/{id}/status` | PUT | Durum güncelle |
| `/departments` | GET | Departman listesi |
| `/categories` | GET | Kategori listesi |

## 📱 Ekranlar

1. **Login Screen** - Kullanıcı girişi
2. **Ticket List Screen** - Tüm ticket'lar
3. **Create Ticket Screen** - Yeni ticket formu
4. **Ticket Detail Screen** - Detay ve yorumlar
5. **Profile Screen** - Kullanıcı profili

## 🔐 Authentication

- JWT token ile authentication
- Token `shared_preferences` ile saklanır
- Her API isteğinde `Authorization: Bearer {token}` header'ı eklenir

## 📂 Proje Yapısı

```
tickly_mobile/
├── lib/
│   ├── main.dart                 # Entry point
│   ├── models/                   # Data models
│   │   ├── user.dart
│   │   ├── ticket.dart
│   │   └── comment.dart
│   ├── services/                 # API services
│   │   ├── api_service.dart     # Base API client
│   │   ├── auth_service.dart    # Authentication
│   │   └── ticket_service.dart  # Ticket operations
│   ├── providers/                # State management
│   │   ├── auth_provider.dart
│   │   └── ticket_provider.dart
│   ├── screens/                  # UI screens
│   │   ├── login_screen.dart
│   │   ├── ticket_list_screen.dart
│   │   ├── create_ticket_screen.dart
│   │   └── ticket_detail_screen.dart
│   └── widgets/                  # Reusable widgets
│       ├── ticket_card.dart
│       └── comment_widget.dart
├── pubspec.yaml                  # Dependencies
└── ios/                          # iOS specific files
```

## 🎨 UI/UX

- **Material Design** - Flutter'ın Material widgets kullanılır
- **Responsive** - Tüm iPhone boyutlarında çalışır
- **Loading States** - API çağrıları sırasında spinner
- **Error Handling** - Hata mesajları için SnackBar

## 📋 TODO

- [ ] Flutter projesi oluştur
- [ ] API service katmanı
- [ ] Model sınıfları
- [ ] Login ekranı
- [ ] Ticket listesi
- [ ] Ticket oluşturma
- [ ] Ticket detayı
- [ ] Push notification entegrasyonu

## 🔧 Development

```bash
# Hot reload ile geliştirme
flutter run

# Release build
flutter build ios --release

# Test
flutter test
```

## 📝 Not

Backend'in iOS simulator'dan erişilebilir olması için:
- Backend'i `http://0.0.0.0:5000` veya `http://localhost:5000` yerine
- IP adresinizle çalıştırın: `http://192.168.1.x:5000`
- Veya ngrok gibi tunnel servis kullanın
