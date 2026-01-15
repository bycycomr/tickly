"""
Tickly Mobile uygulaması için profesyonel Word dokümantasyonu oluşturur
"""

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def add_page_break(doc):
    """Sayfa sonu ekler"""
    doc.add_page_break()

def set_table_borders(table):
    """Tablo kenarlıklarını ayarlar"""
    tbl = table._element
    tblPr = tbl.tblPr
    if tblPr is None:
        tblPr = OxmlElement('w:tblPr')
        tbl.insert(0, tblPr)
    
    tblBorders = OxmlElement('w:tblBorders')
    for border_name in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), '4')
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), '000000')
        tblBorders.append(border)
    
    tblPr.append(tblBorders)

def create_mobile_document():
    """Mobil uygulama dokümanı oluşturma fonksiyonu"""
    
    doc = Document()
    
    # Sayfa ayarları
    section = doc.sections[0]
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.top_margin = Inches(1.2)
    section.bottom_margin = Inches(1)
    
    # ===== KAPAK SAYFASI =====
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run('TICKLY MOBILE')
    run.font.size = Pt(48)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0, 102, 204)
    
    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle.add_run('Flutter iOS Uygulaması')
    run.font.size = Pt(24)
    run.font.color.rgb = RGBColor(0, 51, 102)
    
    doc.add_paragraph('\n' * 3)
    
    info_para = doc.add_paragraph()
    info_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = info_para.add_run('Mobil Uygulama Dokümantasyonu\n\n')
    run.font.size = Pt(20)
    run.font.bold = True
    
    # Bilgi tablosu
    table = doc.add_table(rows=7, cols=2)
    table.style = 'Light Grid Accent 1'
    
    info_data = [
        ('Proje Adı:', 'Tickly Mobile - iOS App'),
        ('Platform:', 'iOS (iPhone/iPad)'),
        ('Framework:', 'Flutter 3.16+'),
        ('Dil:', 'Dart 3.2+'),
        ('Versiyon:', '1.0.0'),
        ('Minimum iOS:', '12.0'),
        ('Tarih:', 'Ocak 2026')
    ]
    
    for i, (label, value) in enumerate(info_data):
        table.rows[i].cells[0].text = label
        table.rows[i].cells[1].text = value
        table.rows[i].cells[0].paragraphs[0].runs[0].font.bold = True
    
    add_page_break(doc)
    
    # ===== İÇİNDEKİLER =====
    heading = doc.add_heading('İçindekiler', level=1)
    
    toc_items = [
        '1. Proje Genel Bakış',
        '2. Teknoloji Stack',
        '3. Uygulama Mimarisi',
        '4. Ekran Tasarımları ve Akışı',
        '5. State Management (Provider)',
        '6. API Entegrasyonu',
        '7. Data Models',
        '8. Gerçek Zamanlı İletişim (SignalR)',
        '9. Push Notifications',
        '10. Kurulum ve Çalıştırma',
        '11. Tema ve UI Customization',
        '12. Test Stratejisi',
        '13. Performans Optimizasyonu',
        '14. Sonuç ve Gelecek Planları'
    ]
    
    for item in toc_items:
        doc.add_paragraph(item, style='List Number')
    
    add_page_break(doc)
    
    # ===== 1. PROJE GENEL BAKIŞ =====
    doc.add_heading('1. Proje Genel Bakış', level=1)
    
    doc.add_heading('1.1 Uygulama Tanımı', level=2)
    
    p = doc.add_paragraph(
        'Tickly Mobile, Tickly Help Desk sisteminin iOS mobil uygulamasıdır. '
        'Flutter framework\'ü kullanılarak geliştirilmiştir ve kullanıcıların mobil '
        'cihazlarından ticket oluşturmasına, takip etmesine ve yönetmesine olanak sağlar.'
    )
    
    box = doc.add_paragraph()
    box.paragraph_format.left_indent = Inches(0.5)
    box.paragraph_format.right_indent = Inches(0.5)
    run = box.add_run(
        '📱 Ana Hedef: Kullanıcıların her yerden, her zaman ticket sistemine erişim '
        'sağlaması, anında bildirim alması ve mobil-friendly bir deneyim yaşaması.'
    )
    run.font.italic = True
    
    doc.add_heading('1.2 Ana Özellikler', level=2)
    
    features = [
        'Kullanıcı Kimlik Doğrulama: JWT token tabanlı güvenli giriş',
        'Ticket Listeleme: Tüm ticket\'ları görüntüleme ve filtreleme',
        'Ticket Oluşturma: Yeni ticket açma, dosya ekleme',
        'Ticket Detayı: Ticket bilgileri, yorumlar, geçmiş',
        'Yorum Sistemi: Ticket\'lara yorum ekleme',
        'Dosya Ekleme: Fotoğraf ve doküman yükleme',
        'Push Notifications: Anlık bildirimler',
        'Dashboard: İstatistikler ve grafikler',
        'Dark Mode: Koyu tema desteği',
        'Offline Support: Temel veri önbelleği'
    ]
    
    for feature in features:
        doc.add_paragraph(feature, style='List Bullet')
    
    doc.add_heading('1.3 Desteklenen Platformlar', level=2)
    
    table = doc.add_table(rows=3, cols=2)
    table.style = 'Light Grid Accent 1'
    
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Platform'
    hdr_cells[1].text = 'Minimum Versiyon'
    for cell in hdr_cells:
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    table.rows[1].cells[0].text = 'iOS'
    table.rows[1].cells[1].text = '12.0+'
    table.rows[2].cells[0].text = 'iPadOS'
    table.rows[2].cells[1].text = '12.0+'
    
    for i in range(1, 3):
        table.rows[i].cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    p = doc.add_paragraph()
    run = p.add_run('Not: ')
    run.font.bold = True
    p.add_run(
        'Uygulama öncelikli olarak iOS için geliştirilmiştir, ancak Flutter\'ın '
        'cross-platform doğası sayesinde Android\'e de kolayca port edilebilir.'
    )
    
    add_page_break(doc)
    
    # ===== 2. TEKNOLOJİ STACK =====
    doc.add_heading('2. Teknoloji Stack', level=1)
    
    doc.add_heading('2.1 Core Technologies', level=2)
    
    table = doc.add_table(rows=5, cols=3)
    table.style = 'Light Grid Accent 1'
    
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Teknoloji'
    hdr_cells[1].text = 'Versiyon'
    hdr_cells[2].text = 'Kullanım Amacı'
    for cell in hdr_cells:
        cell.paragraphs[0].runs[0].font.bold = True
    
    core_tech = [
        ('Flutter', '3.16+', 'UI framework, cross-platform development'),
        ('Dart', '3.2+', 'Programlama dili, null-safety'),
        ('Material Design', '3.0', 'UI component library'),
        ('Cupertino Widgets', '-', 'iOS-native görünüm')
    ]
    
    for i, (tech, version, purpose) in enumerate(core_tech, 1):
        table.rows[i].cells[0].text = tech
        table.rows[i].cells[1].text = version
        table.rows[i].cells[2].text = purpose
    
    doc.add_heading('2.2 Flutter Packages', level=2)
    
    table = doc.add_table(rows=10, cols=3)
    table.style = 'Light Grid Accent 1'
    
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Package'
    hdr_cells[1].text = 'Versiyon'
    hdr_cells[2].text = 'Kullanım Amacı'
    for cell in hdr_cells:
        cell.paragraphs[0].runs[0].font.bold = True
    
    packages = [
        ('provider', '6.1.1', 'State management, dependency injection'),
        ('http', '1.1.0', 'HTTP client, REST API çağrıları'),
        ('shared_preferences', '2.2.2', 'Local storage, token saklama'),
        ('image_picker', '1.0.7', 'Kamera ve galeri erişimi'),
        ('file_picker', '6.1.1', 'Dosya seçme, doküman yükleme'),
        ('signalr_netcore', '1.3.7', 'Real-time WebSocket bağlantısı'),
        ('fl_chart', '0.66.0', 'Grafikler ve chart\'lar'),
        ('flutter_local_notifications', '16.3.0', 'Push notification desteği'),
        ('intl', '0.18.1', 'Internationalization, tarih formatı')
    ]
    
    for i, (pkg, ver, purpose) in enumerate(packages, 1):
        table.rows[i].cells[0].text = pkg
        table.rows[i].cells[1].text = ver
        table.rows[i].cells[2].text = purpose
    
    doc.add_heading('2.3 Backend Integration', level=2)
    
    p = doc.add_paragraph()
    run = p.add_run('API Base URL:')
    run.font.bold = True
    
    api_urls = [
        'Development: http://localhost:5000/api',
        'Production: https://api.tickly.yourcompany.com/api'
    ]
    
    for url in api_urls:
        doc.add_paragraph(url, style='List Bullet')
    
    p = doc.add_paragraph()
    run = p.add_run('Kullanılan Endpoint\'ler:')
    run.font.bold = True
    
    endpoints = [
        'POST /api/auth/login - Kullanıcı girişi',
        'GET /api/auth/me - Kullanıcı bilgisi',
        'GET /api/tickets - Ticket listesi',
        'POST /api/tickets - Yeni ticket oluştur',
        'GET /api/tickets/{id} - Ticket detayı',
        'POST /api/tickets/{id}/comments - Yorum ekle',
        'PUT /api/tickets/{id}/status - Durum güncelle',
        'GET /api/departments - Departman listesi',
        'GET /api/categories - Kategori listesi'
    ]
    
    for endpoint in endpoints:
        doc.add_paragraph(endpoint, style='List Bullet')
    
    add_page_break(doc)
    
    # ===== 3. UYGULAMA MİMARİSİ =====
    doc.add_heading('3. Uygulama Mimarisi', level=1)
    
    doc.add_heading('3.1 Genel Mimari', level=2)
    
    p = doc.add_paragraph(
        'Tickly Mobile, Provider pattern kullanarak state management sağlar ve '
        'katmanlı mimari prensiplerine uygun geliştirilmiştir.'
    )
    
    p = doc.add_paragraph()
    run = p.add_run('Mimari Katmanlar:')
    run.font.bold = True
    
    layers = [
        ('UI Layer', 'Screens & Widgets - Kullanıcı arayüzü bileşenleri'),
        ('Provider Layer', 'State Management - Uygulama durumu yönetimi'),
        ('Service Layer', 'API & Business Logic - İş mantığı ve API çağrıları'),
        ('Model Layer', 'Data Models - Veri modelleri'),
        ('Backend API', 'REST + SignalR - Backend entegrasyonu')
    ]
    
    for layer, desc in layers:
        p = doc.add_paragraph()
        run = p.add_run(f'{layer}: ')
        run.font.bold = True
        p.add_run(desc)
    
    doc.add_heading('3.2 Proje Klasör Yapısı', level=2)
    
    p = doc.add_paragraph('tickly_mobile/', style='Heading 4')
    structure_items = [
        'lib/ - Ana kaynak klasörü',
        '  main.dart - Entry point',
        '  models/ - Data Models (user.dart, ticket.dart, comment.dart)',
        '  services/ - API Services (api_service.dart, auth_service.dart)',
        '  providers/ - State Management (auth_provider.dart, ticket_provider.dart)',
        '  screens/ - UI Screens (login, ticket_list, create_ticket, detail)',
        '  widgets/ - Reusable Widgets (ticket_card.dart, comment_item.dart)',
        '  utils/ - Utilities (constants.dart, theme.dart, validators.dart)',
        'pubspec.yaml - Dependencies',
        'ios/ - iOS-specific files',
        'test/ - Unit tests'
    ]
    
    for item in structure_items:
        doc.add_paragraph(item, style='List Bullet')
    
    add_page_break(doc)
    
    # ===== 4. EKRAN TASARIMLARI =====
    doc.add_heading('4. Ekran Tasarımları ve Akışı', level=1)
    
    doc.add_heading('4.1 Uygulama Ekranları', level=2)
    
    screens = [
        ('Splash Screen', [
            'Uygulama açılış ekranı',
            'Token kontrolü yapar',
            'Authenticated ise Ticket List\'e, değilse Login\'e yönlendirir'
        ]),
        ('Login Screen', [
            'Email ve şifre ile giriş',
            '"Beni Hatırla" seçeneği',
            'JWT token alır ve shared_preferences\'a kaydeder'
        ]),
        ('Ticket List Screen', [
            'Tüm ticket\'ları listeler',
            'Filtreleme: Durum, öncelik, departman',
            'Arama fonksiyonu',
            'Pull-to-refresh',
            'FAB ile yeni ticket'
        ]),
        ('Create Ticket Screen', [
            'Başlık, açıklama, departman, kategori seçimi',
            'Öncelik seçimi (Low, Medium, High, Critical)',
            'Dosya ve fotoğraf ekleme',
            'Form validation'
        ]),
        ('Ticket Detail Screen', [
            'Ticket bilgileri (başlık, durum, öncelik)',
            'Yorumlar listesi',
            'Yeni yorum ekleme',
            'Durum güncelleme (Agent/Admin için)',
            'Ekleri görüntüleme'
        ]),
        ('Dashboard Screen', [
            'Özet istatistikler',
            'Grafikler (fl_chart ile)',
            'Son aktiviteler'
        ]),
        ('Profile Screen', [
            'Kullanıcı bilgileri',
            'Tema değiştirme (Light/Dark)',
            'Bildirim ayarları',
            'Çıkış yapma'
        ])
    ]
    
    for screen_name, features in screens:
        doc.add_heading(screen_name, level=3)
        for feature in features:
            doc.add_paragraph(feature, style='List Bullet')
    
    add_page_break(doc)
    
    # ===== 5. STATE MANAGEMENT =====
    doc.add_heading('5. State Management (Provider)', level=1)
    
    doc.add_heading('5.1 Provider Mimarisi', level=2)
    
    p = doc.add_paragraph(
        'Tickly Mobile, state management için Provider package\'ını kullanır. '
        'Her major özellik için ayrı provider\'lar oluşturulmuştur.'
    )
    
    doc.add_heading('5.2 AuthProvider', level=2)
    
    p = doc.add_paragraph()
    run = p.add_run('Sorumluluklar:')
    run.font.bold = True
    
    auth_features = [
        'Kullanıcı girişi ve çıkışı',
        'JWT token yönetimi',
        'Authentication durumu takibi',
        'Token persistence (SharedPreferences)',
        'Auto-login kontrolü'
    ]
    
    for feature in auth_features:
        doc.add_paragraph(feature, style='List Bullet')
    
    doc.add_heading('5.3 TicketProvider', level=2)
    
    p = doc.add_paragraph()
    run = p.add_run('Sorumluluklar:')
    run.font.bold = True
    
    ticket_features = [
        'Ticket listesi yönetimi',
        'Ticket detay verisi',
        'Yeni ticket oluşturma',
        'Ticket güncelleme',
        'Loading ve error state yönetimi'
    ]
    
    for feature in ticket_features:
        doc.add_paragraph(feature, style='List Bullet')
    
    add_page_break(doc)
    
    # ===== 6. API ENTEGRASYONU =====
    doc.add_heading('6. API Entegrasyonu', level=1)
    
    doc.add_heading('6.1 Base API Service', level=2)
    
    p = doc.add_paragraph(
        'ApiService sınıfı, tüm HTTP istekleri için base class görevi görür.'
    )
    
    p = doc.add_paragraph()
    run = p.add_run('Temel Özellikler:')
    run.font.bold = True
    
    api_features = [
        'Base URL yönetimi',
        'JWT token ekleme (Authorization header)',
        'HTTP methods: GET, POST, PUT, DELETE',
        'Error handling',
        'JSON serialization/deserialization'
    ]
    
    for feature in api_features:
        doc.add_paragraph(feature, style='List Bullet')
    
    doc.add_heading('6.2 Specialized Services', level=2)
    
    services = [
        ('AuthService', 'Kullanıcı girişi, token yenileme, profil bilgisi'),
        ('TicketService', 'Ticket CRUD işlemleri, yorum ekleme'),
        ('DepartmentService', 'Departman listesi'),
        ('CategoryService', 'Kategori listesi')
    ]
    
    for service, desc in services:
        p = doc.add_paragraph()
        run = p.add_run(f'{service}: ')
        run.font.bold = True
        p.add_run(desc)
    
    add_page_break(doc)
    
    # ===== 7. DATA MODELS =====
    doc.add_heading('7. Data Models', level=1)
    
    doc.add_heading('7.1 Ticket Model', level=2)
    
    p = doc.add_paragraph()
    run = p.add_run('Ana Alanlar:')
    run.font.bold = True
    
    ticket_fields = [
        'id: Ticket ID',
        'title: Başlık',
        'description: Açıklama',
        'status: Durum (open, inProgress, pending, resolved, closed)',
        'priority: Öncelik (low, medium, high, critical)',
        'departmentId/departmentName: Departman',
        'categoryId/categoryName: Kategori',
        'creatorId/creatorName: Oluşturan',
        'assignedToId/assignedToName: Atanan',
        'createdAt/updatedAt: Tarihler'
    ]
    
    for field in ticket_fields:
        doc.add_paragraph(field, style='List Bullet')
    
    doc.add_heading('7.2 User Model', level=2)
    
    user_fields = [
        'id: Kullanıcı ID',
        'username: Kullanıcı adı',
        'email: Email adresi',
        'displayName: Görünen ad',
        'roles: Roller listesi'
    ]
    
    for field in user_fields:
        doc.add_paragraph(field, style='List Bullet')
    
    doc.add_heading('7.3 Comment Model', level=2)
    
    comment_fields = [
        'id: Yorum ID',
        'ticketId: İlgili ticket',
        'userId/userName: Yorumu yazan',
        'content: Yorum içeriği',
        'createdAt: Oluşturulma tarihi',
        'isInternal: Dahili mi? (sadece agent\'lar görsün)'
    ]
    
    for field in comment_fields:
        doc.add_paragraph(field, style='List Bullet')
    
    add_page_break(doc)
    
    # ===== 8. SIGNALR =====
    doc.add_heading('8. Gerçek Zamanlı İletişim (SignalR)', level=1)
    
    doc.add_heading('8.1 SignalR Entegrasyonu', level=2)
    
    p = doc.add_paragraph(
        'SignalR, backend ile real-time iletişim sağlar. Ticket güncellemeleri, '
        'yeni yorumlar ve bildirimler anında kullanıcıya iletilir.'
    )
    
    p = doc.add_paragraph()
    run = p.add_run('SignalR Events:')
    run.font.bold = True
    
    signalr_events = [
        'TicketUpdated: Ticket bilgileri güncellendiğinde',
        'CommentAdded: Yeni yorum eklendiğinde',
        'TicketAssigned: Ticket atandığında',
        'TicketStatusChanged: Durum değiştiğinde'
    ]
    
    for event in signalr_events:
        doc.add_paragraph(event, style='List Bullet')
    
    doc.add_heading('8.2 SignalR Methods', level=2)
    
    methods = [
        ('JoinTicket(ticketId)', 'Ticket\'ın real-time güncellemelerini almaya başla'),
        ('LeaveTicket(ticketId)', 'Ticket\'tan ayrıl'),
        ('SendComment(ticketId, comment)', 'Real-time yorum gönder')
    ]
    
    for method, desc in methods:
        p = doc.add_paragraph()
        run = p.add_run(f'{method}: ')
        run.font.bold = True
        p.add_run(desc)
    
    add_page_break(doc)
    
    # ===== 9. PUSH NOTIFICATIONS =====
    doc.add_heading('9. Push Notifications', level=1)
    
    doc.add_heading('9.1 Local Notifications', level=2)
    
    p = doc.add_paragraph(
        'flutter_local_notifications package\'ı kullanılarak iOS için yerel '
        'bildirimler desteklenir.'
    )
    
    p = doc.add_paragraph()
    run = p.add_run('Bildirim Senaryoları:')
    run.font.bold = True
    
    notification_scenarios = [
        'Yeni ticket atandığında',
        'Ticket durumu değiştiğinde',
        'Yeni yorum eklendiğinde',
        'SLA süresi dolmak üzereyken',
        'Ticket çözüldüğünde'
    ]
    
    for scenario in notification_scenarios:
        doc.add_paragraph(scenario, style='List Bullet')
    
    doc.add_heading('9.2 Notification Actions', level=2)
    
    p = doc.add_paragraph(
        'Kullanıcı bildirime tıkladığında ilgili ticket detay ekranına yönlendirilir.'
    )
    
    add_page_break(doc)
    
    # ===== 10. KURULUM =====
    doc.add_heading('10. Kurulum ve Çalıştırma', level=1)
    
    doc.add_heading('10.1 Geliştirme Ortamı Kurulumu', level=2)
    
    p = doc.add_paragraph()
    run = p.add_run('Gereksinimler:')
    run.font.bold = True
    
    requirements = [
        'Flutter SDK 3.16+',
        'Dart SDK 3.2+',
        'Xcode 14+ (macOS için)',
        'CocoaPods (iOS dependencies için)',
        'iOS Simulator veya fiziksel iPhone'
    ]
    
    for req in requirements:
        doc.add_paragraph(req, style='List Bullet')
    
    doc.add_heading('10.2 Proje Kurulumu', level=2)
    
    setup_steps = [
        'cd mobile - Proje klasörüne git',
        'flutter pub get - Dependencies yükle',
        'cd ios && pod install && cd .. - iOS dependencies',
        'flutter devices - Cihazları listele',
        'flutter run - iOS Simulator\'da çalıştır'
    ]
    
    for step in setup_steps:
        p = doc.add_paragraph(step)
        p.runs[0].font.name = 'Courier New'
    
    doc.add_heading('10.3 Build ve Release', level=2)
    
    p = doc.add_paragraph()
    run = p.add_run('Development Build:')
    run.font.bold = True
    
    dev_builds = [
        'flutter run - Debug mode',
        'flutter run --profile - Profile mode',
        'flutter run --release - Release mode'
    ]
    
    for build in dev_builds:
        p = doc.add_paragraph(build)
        p.runs[0].font.name = 'Courier New'
    
    p = doc.add_paragraph()
    run = p.add_run('iOS App Store Build:')
    run.font.bold = True
    
    store_steps = [
        'flutter build ipa - IPA oluştur',
        'open ios/Runner.xcworkspace - Xcode ile aç',
        'Xcode\'da Archive > Distribute App',
        'App Store Connect\'e yükle'
    ]
    
    for step in store_steps:
        doc.add_paragraph(step, style='List Number')
    
    add_page_break(doc)
    
    # ===== 11. TEMA =====
    doc.add_heading('11. Tema ve UI Customization', level=1)
    
    doc.add_heading('11.1 Theme Provider', level=2)
    
    p = doc.add_paragraph(
        'ThemeProvider, uygulamanın Light ve Dark mode arasında geçişini yönetir.'
    )
    
    p = doc.add_paragraph()
    run = p.add_run('Özellikler:')
    run.font.bold = True
    
    theme_features = [
        'Light Theme: Açık renkli, günlük kullanım için',
        'Dark Theme: Koyu renkli, gece kullanımı için',
        'System Default: Cihaz ayarına göre otomatik',
        'Material Design 3 kullanımı',
        'Custom color schemes'
    ]
    
    for feature in theme_features:
        doc.add_paragraph(feature, style='List Bullet')
    
    add_page_break(doc)
    
    # ===== 12. TEST =====
    doc.add_heading('12. Test Stratejisi', level=1)
    
    doc.add_heading('12.1 Unit Tests', level=2)
    
    p = doc.add_paragraph(
        'Provider\'lar, service\'ler ve model\'ler için unit testler yazılmıştır.'
    )
    
    unit_test_areas = [
        'AuthProvider: Login, logout, token yönetimi',
        'TicketProvider: Fetch, create, update operasyonları',
        'ApiService: HTTP request/response handling',
        'Data Models: JSON serialization/deserialization'
    ]
    
    for area in unit_test_areas:
        doc.add_paragraph(area, style='List Bullet')
    
    doc.add_heading('12.2 Widget Tests', level=2)
    
    widget_test_areas = [
        'Login Screen: Form validation, submit işlemi',
        'Ticket Card: Doğru verilerin gösterilmesi',
        'Create Ticket Form: Input validation',
        'Comment List: Yorumların listelenmesi'
    ]
    
    for area in widget_test_areas:
        doc.add_paragraph(area, style='List Bullet')
    
    doc.add_heading('12.3 Integration Tests', level=2)
    
    p = doc.add_paragraph(
        'End-to-end testler, gerçek kullanıcı senaryolarını simüle eder.'
    )
    
    integration_scenarios = [
        'Login → Ticket List → Create Ticket → Success',
        'Login → Ticket Detail → Add Comment',
        'Login → Dashboard → View Statistics'
    ]
    
    for scenario in integration_scenarios:
        doc.add_paragraph(scenario, style='List Bullet')
    
    add_page_break(doc)
    
    # ===== 13. PERFORMANS =====
    doc.add_heading('13. Performans Optimizasyonu', level=1)
    
    doc.add_heading('13.1 Best Practices', level=2)
    
    practices = [
        ('Lazy Loading', [
            'ListView.builder kullanımı',
            'Infinite scroll pagination',
            'Image lazy loading'
        ]),
        ('State Management', [
            'Provider ile efficient state updates',
            'notifyListeners() minimal kullanımı',
            'Selector widget ile specific rebuilds'
        ]),
        ('API Optimization', [
            'Request caching',
            'Debouncing search queries',
            'Parallel requests where possible'
        ]),
        ('Image Optimization', [
            'CachedNetworkImage kullanımı',
            'Image compression',
            'Thumbnail preview'
        ]),
        ('Build Optimization', [
            'const constructors',
            'Widget extraction',
            'RepaintBoundary kullanımı'
        ])
    ]
    
    for practice, items in practices:
        doc.add_heading(practice, level=3)
        for item in items:
            doc.add_paragraph(item, style='List Bullet')
    
    add_page_break(doc)
    
    # ===== 14. SONUÇ =====
    doc.add_heading('14. Sonuç ve Gelecek Planları', level=1)
    
    doc.add_heading('14.1 Mevcut Durum', level=2)
    
    p = doc.add_paragraph(
        'Tickly Mobile uygulaması, iOS platformu için Flutter kullanılarak başarıyla '
        'geliştirilmiştir. Uygulama aşağıdaki temel özellikleri sunar:'
    )
    
    achievements = [
        '✓ JWT tabanlı güvenli kimlik doğrulama',
        '✓ Ticket oluşturma, listeleme, detay görüntüleme',
        '✓ Yorum sistemi',
        '✓ Dosya ve fotoğraf yükleme',
        '✓ Real-time SignalR entegrasyonu',
        '✓ Push notification desteği',
        '✓ Dark mode',
        '✓ Dashboard ve istatistikler'
    ]
    
    for achievement in achievements:
        doc.add_paragraph(achievement, style='List Bullet')
    
    doc.add_heading('14.2 Gelecek Geliştirmeler', level=2)
    
    p = doc.add_paragraph()
    run = p.add_run('Kısa Vadeli (1-2 ay):')
    run.font.bold = True
    
    short_term = [
        'Android platform desteği',
        'Offline-first architecture (local database)',
        'Biometric authentication (Face ID / Touch ID)',
        'Rich text editor (yorumlar için)',
        'File preview in-app'
    ]
    
    for item in short_term:
        doc.add_paragraph(item, style='List Bullet')
    
    p = doc.add_paragraph()
    run = p.add_run('Orta Vadeli (2-4 ay):')
    run.font.bold = True
    
    mid_term = [
        'Voice-to-text ticket oluşturma',
        'QR code ile ticket açma',
        'Advanced filtering ve sorting',
        'Ticket templates',
        'Export functionality (PDF)'
    ]
    
    for item in mid_term:
        doc.add_paragraph(item, style='List Bullet')
    
    p = doc.add_paragraph()
    run = p.add_run('Uzun Vadeli (4-6 ay):')
    run.font.bold = True
    
    long_term = [
        'iPad optimization (tablet layout)',
        'Apple Watch companion app',
        'Siri Shortcuts integration',
        'AR features (problem visualization)',
        'ML-based smart suggestions'
    ]
    
    for item in long_term:
        doc.add_paragraph(item, style='List Bullet')
    
    doc.add_heading('14.3 Teknik İyileştirmeler', level=2)
    
    improvements = [
        'Comprehensive test coverage (%80+)',
        'CI/CD pipeline (GitHub Actions + Fastlane)',
        'Performance monitoring (Firebase Performance)',
        'Crash reporting (Firebase Crashlytics)',
        'Analytics integration (Firebase Analytics)',
        'Code generation (freezed, json_serializable)'
    ]
    
    for improvement in improvements:
        doc.add_paragraph(improvement, style='List Bullet')
    
    # Son sayfa
    add_page_break(doc)
    
    final = doc.add_paragraph()
    final.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = final.add_run('\n\n\n--- Doküman Sonu ---\n\n')
    run.font.size = Pt(14)
    run.font.italic = True
    
    final2 = doc.add_paragraph()
    final2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = final2.add_run('Tickly Mobile - Flutter iOS Uygulaması')
    run.font.size = Pt(12)
    run.font.color.rgb = RGBColor(100, 100, 100)
    
    # Dosyayı kaydet
    doc.save('Tickly_Mobile_Dokumani.docx')
    print("✅ Mobil uygulama Word dokümantasyonu başarıyla oluşturuldu: Tickly_Mobile_Dokumani.docx")

if __name__ == '__main__':
    create_mobile_document()
