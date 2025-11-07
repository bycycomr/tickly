# Tickly - Teknik Dokümantasyon ve Proje Sunumu

## 📋 Proje Genel Bakış

**Tickly**, modern web teknolojileri kullanılarak geliştirilmiş, kurumsal düzeyde bir Help Desk ve Ticket Yönetim Sistemidir. Sistem, şirket içi destek süreçlerini otomatikleştirmek ve yönetmek için tasarlanmıştır.

### Temel Özellikler
- 🎫 Gelişmiş Ticket Yönetimi
- 👥 Departman ve Kullanıcı Yönetimi
- 📊 Raporlama ve Dashboard
- 📚 Bilgi Bankası (Knowledge Base)
- ⚡ Otomasyon Kuralları
- ⏱️ SLA (Service Level Agreement) Yönetimi
- 🔔 Gerçek Zamanlı Bildirimler (SignalR)
- 📧 Email Entegrasyonu (IMAP)

---

## 🏗️ Sistem Mimarisi

### Genel Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  React 18 + TypeScript + Vite + Tailwind CSS                │
│  (SPA - Single Page Application)                             │
└─────────────────────────────────────────────────────────────┘
                            ↕️ HTTP/HTTPS + WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  ASP.NET Core 8.0 Web API + SignalR Hubs                    │
│  RESTful API + Real-time Communication                       │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  Services, Workers, Automation Engine                        │
│  (TicketWorkflow, SLA Monitor, Email Service)               │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
│  Entity Framework Core 8.0 + Repository Pattern             │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│         SQLite (Dev/Test) / PostgreSQL (Production)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Teknoloji Stack

### Backend (.NET)

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| ASP.NET Core | 8.0 | Web API Framework |
| Entity Framework Core | 8.0 | ORM (Object-Relational Mapping) |
| SQLite | - | Development Database |
| PostgreSQL | - | Production Database (Optional) |
| SignalR | 8.0 | Real-time Communication |
| JWT Bearer | - | Authentication & Authorization |
| BCrypt.Net | - | Password Hashing |
| MailKit | - | Email Operations (SMTP/IMAP) |
| Swashbuckle | - | API Documentation (Swagger) |

### Frontend (React)

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 5.4 | Build Tool & Dev Server |
| React Router | 6.x | Client-side Routing |
| Axios | 1.x | HTTP Client |
| Tailwind CSS | 3.x | Utility-first CSS Framework |
| Lucide React | - | Icon Library |
| React Hot Toast | - | Notification System |
| @microsoft/signalr | - | SignalR Client |

### DevOps & Deployment

| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| Docker | Container'ization |
| Docker Compose | Multi-container Orchestration |
| Git | Version Control |

---

## 📁 Proje Yapısı

```
tickly/
├── backend/                          # .NET Backend
│   ├── src/
│   │   ├── Controllers/              # API Endpoints
│   │   │   ├── AdminController.cs    # Admin yönetim endpoint'leri
│   │   │   ├── AuthController.cs     # Authentication
│   │   │   ├── TicketsController.cs  # Ticket CRUD işlemleri
│   │   │   ├── CategoriesController.cs
│   │   │   ├── DepartmentsController.cs
│   │   │   ├── KnowledgeBaseController.cs
│   │   │   └── ReportsController.cs
│   │   ├── Models/                   # Entity Models
│   │   │   ├── User.cs
│   │   │   ├── Ticket.cs
│   │   │   ├── Department.cs
│   │   │   ├── Category.cs
│   │   │   ├── Article.cs
│   │   │   ├── SLAPlan.cs
│   │   │   └── AutomationRule.cs
│   │   ├── Services/                 # Business Logic
│   │   │   ├── EmailService.cs       # Email gönderimi
│   │   │   ├── EmailInboundService.cs # IMAP email okuma
│   │   │   ├── TicketWorkflowService.cs
│   │   │   ├── SLAMonitoringService.cs
│   │   │   ├── AutomationService.cs
│   │   │   └── AuditService.cs
│   │   ├── Hubs/                     # SignalR Hubs
│   │   │   ├── TicketHub.cs          # Real-time ticket updates
│   │   │   └── NotificationHub.cs
│   │   ├── Data/
│   │   │   └── AppDbContext.cs       # EF Core DbContext
│   │   ├── Migrations/               # Database Migrations
│   │   └── Configuration/
│   ├── Tickly.Api.csproj
│   ├── Program.cs                    # Entry Point & DI Setup
│   ├── appsettings.json              # Configuration
│   └── Dockerfile
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/               # Reusable Components
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/                    # Page Components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Admin.tsx             # Admin paneli
│   │   │   ├── TicketDetail.tsx
│   │   │   ├── KnowledgeBase.tsx
│   │   │   ├── ArticleDetail.tsx
│   │   │   └── Reports.tsx
│   │   ├── context/                  # React Context
│   │   │   └── AuthContext.tsx       # Authentication state
│   │   ├── lib/                      # Utilities
│   │   │   ├── api.ts                # API client (Axios)
│   │   │   ├── signalr.ts            # SignalR client
│   │   │   └── types.ts              # TypeScript types
│   │   ├── App.tsx                   # Main App Component
│   │   ├── main.tsx                  # Entry Point
│   │   └── styles.css                # Global Styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml                # Multi-container setup
├── README.md
└── PROJECT_SUMMARY.md
```

---

## 🔐 Güvenlik ve Authentication

### JWT (JSON Web Token) Tabanlı Authentication

```csharp
// Token generation
var token = new JwtSecurityToken(
    issuer: jwtIssuer,
    audience: jwtAudience,
    claims: claims,
    expires: DateTime.UtcNow.AddHours(24),
    signingCredentials: creds
);
```

### Kullanıcı Rolleri ve Yetkilendirme

1. **SuperAdmin** - Sistem genelinde tam yetki
2. **DepartmentManager** - Departman yöneticisi
3. **Agent** - Destek personeli
4. **EndUser** - Normal kullanıcı

### Role-Based Access Control (RBAC)

```csharp
[Authorize(Policy = "SuperAdminOnly")]
[Authorize(Roles = "SuperAdmin,DepartmentManager")]
```

### Password Security
- BCrypt hashing algoritması
- Salt ile güvenli depolama
- Minimum şifre gereksinimleri

---

## 📊 Veritabanı Yapısı ve Şeması

### Veritabanı Genel Bilgiler

**Desteklenen Veritabanları:**
- **Development:** SQLite 3.x
- **Production:** PostgreSQL 14+, SQL Server 2019+, MySQL 8+

**ORM:** Entity Framework Core 8.0
- Code-First Migrations
- LINQ Query Support
- Automatic Relationship Mapping

### Entity Relationship Diagram (ERD)

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Users     │────1:N──│RoleAssignment│──N:1────│ Departments  │
│              │         │              │         │              │
│ Id (PK)      │         │ Id (PK)      │         │ Id (PK)      │
│ Username     │         │ UserId (FK)  │         │ Name         │
│ Email        │         │ DepartmentId │         │ Description  │
│ PasswordHash │         │ Role (enum)  │         │              │
└──────┬───────┘         └──────────────┘         └──────┬───────┘
       │                                                  │
       │ 1:N (Creator)                                    │
       │                                                  │
       ↓                                                  │ 1:N
┌──────────────┐         ┌──────────────┐                │
│   Tickets    │──N:1────│  Categories  │←───────────────┘
│              │         │              │
│ Id (PK)      │         │ Id (PK)      │         ┌──────────────┐
│ Title        │         │ Name         │──N:1────│  SLAPlans    │
│ Description  │         │ ParentId(FK) │         │              │
│ Status       │         │ DepartmentId │         │ Id (PK)      │
│ Priority     │         └──────────────┘         │ Name         │
│ CreatorId    │                                  │ ResponseTime │
│ AssignedToId │──────────────────┐               │ ResolutionTm │
│ DepartmentId │                  │               └──────────────┘
│ CategoryId   │                  │
│ SLAPlanId    │                  │
│ CreatedAt    │                  │
└──────┬───────┘                  │
       │ 1:N                      │ 1:N (Assigned)
       ↓                          ↓
┌──────────────┐         ┌──────────────┐
│TicketEvents │         │ Attachments  │
│              │         │              │
│ Id (PK)      │         │ Id (PK)      │
│ TicketId(FK) │         │ TicketId(FK) │
│ UserId (FK)  │         │ FileName     │
│ EventType    │         │ FilePath     │
│ OldValue     │         │ FileSize     │
│ NewValue     │         │ ContentType  │
│ Comment      │         │ UploadedBy   │
│ CreatedAt    │         │ UploadedAt   │
└──────────────┘         └──────────────┘


┌──────────────┐         ┌──────────────┐
│   Articles   │──N:1────│  Categories  │
│ (KnowledgeDB)│         │              │
│              │         └──────────────┘
│ Id (PK)      │
│ Title        │         ┌──────────────┐
│ Slug (unique)│──N:1────│ Departments  │
│ Content      │         │              │
│ Summary      │         └──────────────┘
│ Status       │
│ AuthorId(FK) │         ┌──────────────┐
│ DepartmentId │────────→│    Users     │
│ CategoryId   │         │ (Author)     │
│ ViewCount    │         └──────────────┘
│ HelpfulCount │
│ IsFeatured   │
│ PublishedAt  │
└──────────────┘


┌──────────────┐         ┌──────────────┐
│ AutomationRu │         │  AuditLogs   │
│              │         │              │
│ Id (PK)      │         │ Id (PK)      │
│ Name         │         │ UserId (FK)  │
│ Description  │         │ Action       │
│ Trigger      │         │ EntityType   │
│ ConditionJson│         │ EntityId     │
│ ActionJson   │         │ Changes(JSON)│
│ Priority     │         │ IpAddress    │
│ Enabled      │         │ Timestamp    │
│ LastRunAt    │         └──────────────┘
└──────────────┘

┌──────────────┐
│EmailInbounds │
│              │
│ Id (PK)      │
│ MessageId    │
│ FromAddress  │
│ Subject      │
│ Body         │
│ ReceivedAt   │
│ ProcessedAt  │
│ TicketId(FK) │
│ Status       │
└──────────────┘
```

---

### Detaylı Tablo Şemaları

#### 1. Users (Kullanıcılar)

```sql
CREATE TABLE Users (
    Id                      NVARCHAR(450) PRIMARY KEY,
    Username                NVARCHAR(50) NOT NULL UNIQUE,
    Email                   NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash            NVARCHAR(256) NOT NULL,
    DisplayName             NVARCHAR(100),
    JobTitle                NVARCHAR(100),
    OrganizationalDepartment NVARCHAR(100),
    IsActive                BIT NOT NULL DEFAULT 1,
    CreatedAt               DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt               DATETIME2
);

CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_IsActive ON Users(IsActive);
```

**Açıklama:**
- `Id`: GUID formatında unique identifier
- `Username`: Kullanıcı adı (login için)
- `Email`: Email adresi (unique, login alternatifi)
- `PasswordHash`: BCrypt ile hash'lenmiş şifre
- `DisplayName`: Görünen ad (UI'da gösterilir)
- `JobTitle`: İş unvanı (opsiyonel)
- `OrganizationalDepartment`: Organizasyonel departman (şirket departmanı)
- `IsActive`: Kullanıcı aktif mi? (soft delete için)

---

#### 2. Departments (Departmanlar)

```sql
CREATE TABLE Departments (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Name        NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500)
);

CREATE INDEX IX_Departments_Name ON Departments(Name);
```

**Açıklama:**
- Ticket yönetimi için departmanlar (IT, HR, Finance, vb.)
- Her ticket bir departmana atanır

---

#### 3. RoleAssignments (Rol Atamaları)

```sql
CREATE TABLE RoleAssignments (
    Id           INT PRIMARY KEY IDENTITY(1,1),
    UserId       NVARCHAR(450) NOT NULL,
    DepartmentId INT NOT NULL,
    Role         INT NOT NULL, -- 0=EndUser, 1=Agent, 2=DepartmentManager, 3=SuperAdmin
    AssignedAt   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_RoleAssignments_Users FOREIGN KEY (UserId) 
        REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_RoleAssignments_Departments FOREIGN KEY (DepartmentId) 
        REFERENCES Departments(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_RoleAssignments_User_Dept UNIQUE (UserId, DepartmentId)
);

CREATE INDEX IX_RoleAssignments_UserId ON RoleAssignments(UserId);
CREATE INDEX IX_RoleAssignments_DepartmentId ON RoleAssignments(DepartmentId);
```

**Açıklama:**
- Bir kullanıcı birden fazla departmanda farklı roller alabilir
- Örnek: Ahmet IT'de Agent, HR'da EndUser olabilir

**Role Enum:**
```csharp
public enum RoleName {
    EndUser = 0,           // Normal kullanıcı
    Agent = 1,             // Destek personeli
    DepartmentManager = 2, // Departman yöneticisi
    SuperAdmin = 3         // Sistem yöneticisi
}
```

---

#### 4. Categories (Kategoriler)

```sql
CREATE TABLE Categories (
    Id               INT PRIMARY KEY IDENTITY(1,1),
    Name             NVARCHAR(100) NOT NULL,
    ParentCategoryId INT NULL,
    DepartmentId     INT NULL,
    
    CONSTRAINT FK_Categories_Parent FOREIGN KEY (ParentCategoryId) 
        REFERENCES Categories(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Categories_Department FOREIGN KEY (DepartmentId) 
        REFERENCES Departments(Id) ON DELETE SET NULL
);

CREATE INDEX IX_Categories_ParentId ON Categories(ParentCategoryId);
CREATE INDEX IX_Categories_DepartmentId ON Categories(DepartmentId);
```

**Açıklama:**
- Hiyerarşik kategori yapısı (Self-referencing)
- Örnek: Hardware > Desktop > Monitor
- Departmana özgü veya genel kategoriler olabilir

---

#### 5. SLAPlans (SLA Planları)

```sql
CREATE TABLE SLAPlans (
    Id                    INT PRIMARY KEY IDENTITY(1,1),
    Name                  NVARCHAR(100) NOT NULL,
    Description           NVARCHAR(500),
    ResponseTimeMinutes   INT NOT NULL,  -- İlk yanıt süresi
    ResolutionTimeMinutes INT NOT NULL   -- Çözüm süresi
);
```

**Açıklama:**
- Ticket'lar için SLA (Service Level Agreement) tanımları
- Örnek: "Critical SLA" -> 15 dk yanıt, 4 saat çözüm

---

#### 6. Tickets (Ticket'lar)

```sql
CREATE TABLE Tickets (
    Id                INT PRIMARY KEY IDENTITY(1,1),
    Title             NVARCHAR(200) NOT NULL,
    Description       NVARCHAR(MAX) NOT NULL,
    Status            INT NOT NULL DEFAULT 0,  -- 0=Open, 1=InProgress, 2=Resolved, 3=Closed, 4=Cancelled
    Priority          INT NOT NULL DEFAULT 1,  -- 0=Low, 1=Medium, 2=High, 3=Critical
    CreatorId         NVARCHAR(450) NOT NULL,
    AssignedToId      NVARCHAR(450) NULL,
    DepartmentId      INT NOT NULL,
    CategoryId        INT NULL,
    SLAPlanId         INT NULL,
    CreatedAt         DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt         DATETIME2,
    ResolvedAt        DATETIME2 NULL,
    ClosedAt          DATETIME2 NULL,
    DueDate           DATETIME2 NULL,
    
    CONSTRAINT FK_Tickets_Creator FOREIGN KEY (CreatorId) 
        REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Tickets_AssignedTo FOREIGN KEY (AssignedToId) 
        REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Tickets_Department FOREIGN KEY (DepartmentId) 
        REFERENCES Departments(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Tickets_Category FOREIGN KEY (CategoryId) 
        REFERENCES Categories(Id) ON DELETE SET NULL,
    CONSTRAINT FK_Tickets_SLAPlan FOREIGN KEY (SLAPlanId) 
        REFERENCES SLAPlans(Id) ON DELETE SET NULL
);

CREATE INDEX IX_Tickets_Status ON Tickets(Status);
CREATE INDEX IX_Tickets_Priority ON Tickets(Priority);
CREATE INDEX IX_Tickets_CreatorId ON Tickets(CreatorId);
CREATE INDEX IX_Tickets_AssignedToId ON Tickets(AssignedToId);
CREATE INDEX IX_Tickets_DepartmentId ON Tickets(DepartmentId);
CREATE INDEX IX_Tickets_CreatedAt ON Tickets(CreatedAt DESC);
CREATE INDEX IX_Tickets_DueDate ON Tickets(DueDate) WHERE DueDate IS NOT NULL;
```

**Status Enum:**
```csharp
public enum TicketStatus {
    Open = 0,       // Açık (yeni oluşturuldu)
    InProgress = 1, // Üzerinde çalışılıyor
    Resolved = 2,   // Çözüldü (onay bekliyor)
    Closed = 3,     // Kapatıldı
    Cancelled = 4   // İptal edildi
}
```

**Priority Enum:**
```csharp
public enum TicketPriority {
    Low = 0,        // Düşük
    Medium = 1,     // Orta
    High = 2,       // Yüksek
    Critical = 3    // Kritik
}
```

---

#### 7. TicketEvents (Ticket Olayları/Yorumlar)

```sql
CREATE TABLE TicketEvents (
    Id         INT PRIMARY KEY IDENTITY(1,1),
    TicketId   INT NOT NULL,
    UserId     NVARCHAR(450) NOT NULL,
    EventType  INT NOT NULL,  -- 0=Comment, 1=StatusChange, 2=Assignment, 3=PriorityChange
    OldValue   NVARCHAR(500) NULL,
    NewValue   NVARCHAR(500) NULL,
    Comment    NVARCHAR(MAX) NULL,
    IsInternal BIT NOT NULL DEFAULT 0,
    CreatedAt  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_TicketEvents_Ticket FOREIGN KEY (TicketId) 
        REFERENCES Tickets(Id) ON DELETE CASCADE,
    CONSTRAINT FK_TicketEvents_User FOREIGN KEY (UserId) 
        REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE INDEX IX_TicketEvents_TicketId ON TicketEvents(TicketId);
CREATE INDEX IX_TicketEvents_CreatedAt ON TicketEvents(CreatedAt DESC);
```

**EventType Enum:**
```csharp
public enum TicketEventType {
    Comment = 0,         // Yorum eklendi
    StatusChange = 1,    // Durum değişti
    Assignment = 2,      // Atama yapıldı
    PriorityChange = 3,  // Öncelik değişti
    CategoryChange = 4,  // Kategori değişti
    SLABreach = 5       // SLA ihlali
}
```

---

#### 8. Attachments (Dosya Ekleri)

```sql
CREATE TABLE Attachments (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    TicketId    INT NOT NULL,
    FileName    NVARCHAR(255) NOT NULL,
    FilePath    NVARCHAR(500) NOT NULL,
    FileSize    BIGINT NOT NULL,
    ContentType NVARCHAR(100) NOT NULL,
    UploadedBy  NVARCHAR(450) NOT NULL,
    UploadedAt  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Attachments_Ticket FOREIGN KEY (TicketId) 
        REFERENCES Tickets(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Attachments_User FOREIGN KEY (UploadedBy) 
        REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE INDEX IX_Attachments_TicketId ON Attachments(TicketId);
```

**Açıklama:**
- Ticket'lara dosya ekleme
- FilePath: Sunucudaki fiziksel dosya yolu
- ContentType: MIME type (image/png, application/pdf, vb.)

---

#### 9. Articles (Bilgi Bankası Makaleleri)

```sql
CREATE TABLE Articles (
    Id           INT PRIMARY KEY IDENTITY(1,1),
    Title        NVARCHAR(200) NOT NULL,
    Slug         NVARCHAR(250) NOT NULL UNIQUE,
    Content      NVARCHAR(MAX) NOT NULL,
    Summary      NVARCHAR(500),
    Status       INT NOT NULL DEFAULT 0,  -- 0=Draft, 1=Published, 2=Archived
    AuthorId     NVARCHAR(450) NOT NULL,
    DepartmentId INT NULL,
    CategoryId   INT NULL,
    ViewCount    INT NOT NULL DEFAULT 0,
    HelpfulCount INT NOT NULL DEFAULT 0,
    IsFeatured   BIT NOT NULL DEFAULT 0,
    Tags         NVARCHAR(500),
    PublishedAt  DATETIME2 NULL,
    CreatedAt    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt    DATETIME2,
    
    CONSTRAINT FK_Articles_Author FOREIGN KEY (AuthorId) 
        REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Articles_Department FOREIGN KEY (DepartmentId) 
        REFERENCES Departments(Id) ON DELETE SET NULL,
    CONSTRAINT FK_Articles_Category FOREIGN KEY (CategoryId) 
        REFERENCES Categories(Id) ON DELETE SET NULL
);

CREATE INDEX IX_Articles_Slug ON Articles(Slug);
CREATE INDEX IX_Articles_Status ON Articles(Status);
CREATE INDEX IX_Articles_IsFeatured ON Articles(IsFeatured);
CREATE INDEX IX_Articles_PublishedAt ON Articles(PublishedAt DESC);
```

**Status Enum:**
```csharp
public enum ArticleStatus {
    Draft = 0,      // Taslak
    Published = 1,  // Yayınlandı
    Archived = 2    // Arşivlendi
}
```

---

#### 10. AutomationRules (Otomasyon Kuralları)

```sql
CREATE TABLE AutomationRules (
    Id            INT PRIMARY KEY IDENTITY(1,1),
    Name          NVARCHAR(100) NOT NULL,
    Description   NVARCHAR(500),
    Trigger       INT NOT NULL,  -- 0=TicketCreated, 1=TicketUpdated, 2=StatusChanged, etc.
    ConditionJson NVARCHAR(MAX) NOT NULL,  -- JSON: {"priority": 3, "status": 0}
    ActionJson    NVARCHAR(MAX) NOT NULL,  -- JSON: {"assignTo": "user-id", "notify": true}
    Priority      INT NOT NULL DEFAULT 100,
    Enabled       BIT NOT NULL DEFAULT 1,
    LastRunAt     DATETIME2 NULL,
    CreatedAt     DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AutomationRules_Enabled ON AutomationRules(Enabled);
CREATE INDEX IX_AutomationRules_Trigger ON AutomationRules(Trigger);
```

**Trigger Enum:**
```csharp
public enum AutomationTrigger {
    TicketCreated = 0,     // Ticket oluşturuldu
    TicketUpdated = 1,     // Ticket güncellendi
    StatusChanged = 2,     // Durum değişti
    CommentAdded = 3,      // Yorum eklendi
    SLAWarning = 4,        // SLA uyarısı
    Schedule = 5,          // Zamanlanmış (cron)
    InboundEmail = 6,      // Email geldi
    CustomWebhook = 7      // Webhook tetiklendi
}
```

**ConditionJson Örneği:**
```json
{
  "priority": 3,
  "status": 0,
  "department": "IT",
  "keywords": ["urgent", "critical"]
}
```

**ActionJson Örneği:**
```json
{
  "assignTo": "user-guid-here",
  "notify": true,
  "addComment": "Automatically assigned due to high priority",
  "changePriority": 3,
  "sendEmail": true
}
```

---

#### 11. AuditLogs (Denetim Kayıtları)

```sql
CREATE TABLE AuditLogs (
    Id         BIGINT PRIMARY KEY IDENTITY(1,1),
    UserId     NVARCHAR(450) NULL,
    Action     NVARCHAR(100) NOT NULL,  -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT
    EntityType NVARCHAR(100) NOT NULL,  -- Ticket, User, Department, etc.
    EntityId   NVARCHAR(100) NULL,
    Changes    NVARCHAR(MAX) NULL,      -- JSON: {"field": "status", "from": "0", "to": "1"}
    IpAddress  NVARCHAR(45) NULL,
    UserAgent  NVARCHAR(500) NULL,
    Timestamp  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_AuditLogs_User FOREIGN KEY (UserId) 
        REFERENCES Users(Id) ON DELETE SET NULL
);

CREATE INDEX IX_AuditLogs_UserId ON AuditLogs(UserId);
CREATE INDEX IX_AuditLogs_Timestamp ON AuditLogs(Timestamp DESC);
CREATE INDEX IX_AuditLogs_EntityType_EntityId ON AuditLogs(EntityType, EntityId);
```

**Açıklama:**
- Tüm kritik işlemler loglanır
- Güvenlik denetimleri için kullanılır
- Kim, ne zaman, neyi değiştirdi?

---

#### 12. EmailInbounds (Gelen Email'ler)

```sql
CREATE TABLE EmailInbounds (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    MessageId   NVARCHAR(255) NOT NULL UNIQUE,
    FromAddress NVARCHAR(255) NOT NULL,
    ToAddress   NVARCHAR(255) NOT NULL,
    Subject     NVARCHAR(500) NOT NULL,
    Body        NVARCHAR(MAX) NOT NULL,
    IsHtml      BIT NOT NULL DEFAULT 0,
    ReceivedAt  DATETIME2 NOT NULL,
    ProcessedAt DATETIME2 NULL,
    TicketId    INT NULL,
    Status      INT NOT NULL DEFAULT 0,  -- 0=Pending, 1=Processed, 2=Failed
    ErrorMessage NVARCHAR(1000) NULL,
    
    CONSTRAINT FK_EmailInbounds_Ticket FOREIGN KEY (TicketId) 
        REFERENCES Tickets(Id) ON DELETE SET NULL
);

CREATE INDEX IX_EmailInbounds_Status ON EmailInbounds(Status);
CREATE INDEX IX_EmailInbounds_ReceivedAt ON EmailInbounds(ReceivedAt DESC);
```

**Açıklama:**
- IMAP ile okunan email'ler
- Otomatik ticket oluşturma için kullanılır

---

#### 13. Tenant (Multi-tenancy için - Gelecek)

```sql
CREATE TABLE Tenants (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Name        NVARCHAR(100) NOT NULL UNIQUE,
    Subdomain   NVARCHAR(50) NOT NULL UNIQUE,
    IsActive    BIT NOT NULL DEFAULT 1,
    MaxUsers    INT NOT NULL DEFAULT 100,
    CreatedAt   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ExpiresAt   DATETIME2 NULL
);
```

**Açıklama:**
- Çoklu organizasyon desteği için hazır altyapı
- Her tenant izole veri

---

### Veritabanı İstatistikleri ve Boyutlar

**Tahmini Veri Büyüklükleri:**

| Tablo | Ortalama Satır Boyutu | 10K Kayıt | 100K Kayıt | 1M Kayıt |
|-------|----------------------|-----------|------------|----------|
| Users | ~500 bytes | 5 MB | 50 MB | 500 MB |
| Tickets | ~1 KB | 10 MB | 100 MB | 1 GB |
| TicketEvents | ~500 bytes | 5 MB | 50 MB | 500 MB |
| Attachments | ~300 bytes + files | - | - | - |
| Articles | ~2 KB | 20 MB | 200 MB | 2 GB |
| AuditLogs | ~400 bytes | 4 MB | 40 MB | 400 MB |

**Toplam (1M ticket için):** ~3-4 GB (dosyalar hariç)

---

### Performans İyileştirmeleri

#### 1. İndeksler
```sql
-- Sık kullanılan sorgular için composite index'ler
CREATE INDEX IX_Tickets_Status_Priority 
    ON Tickets(Status, Priority) INCLUDE (CreatedAt);

CREATE INDEX IX_Tickets_AssignedTo_Status 
    ON Tickets(AssignedToId, Status) WHERE AssignedToId IS NOT NULL;

-- Full-text search (PostgreSQL)
CREATE INDEX IX_Tickets_Title_Description_FTS 
    ON Tickets USING gin(to_tsvector('english', Title || ' ' || Description));
```

#### 2. Partition (Büyük tablolar için)
```sql
-- Aylık partition (PostgreSQL örneği)
CREATE TABLE TicketEvents_2025_01 PARTITION OF TicketEvents
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

#### 3. Archiving Strategy
```sql
-- Eski ticket'ları arşiv tablosuna taşı
INSERT INTO Tickets_Archive 
SELECT * FROM Tickets 
WHERE Status = 3 AND ClosedAt < DATEADD(YEAR, -1, GETUTCDATE());
```

---

### Backup ve Disaster Recovery

#### Yedekleme Stratejisi
1. **Full Backup:** Haftalık (Pazar geceleri)
2. **Differential Backup:** Günlük
3. **Transaction Log Backup:** Her 15 dakikada (Production)

#### Örnek Backup Script (SQL Server)
```sql
BACKUP DATABASE Tickly 
TO DISK = 'C:\Backups\Tickly_Full_20251107.bak'
WITH COMPRESSION, INIT;

-- Transaction log
BACKUP LOG Tickly
TO DISK = 'C:\Backups\Tickly_Log.trn'
WITH COMPRESSION, NOINIT;
```

---

### Migration Stratejisi

**Entity Framework Core Migrations:**

```bash
# Yeni migration oluştur
dotnet ef migrations add AddNewFeature

# Database'e uygula
dotnet ef database update

# Geri al (rollback)
dotnet ef database update PreviousMigration

# SQL script oluştur (manuel uygulama için)
dotnet ef migrations script > migration.sql
```

---

## 🔄 İş Akışları (Workflows)

### 1. Ticket Yaşam Döngüsü

```
┌─────────────┐
│   Created   │
└─────┬───────┘
      │
      ↓
┌─────────────┐
│    Open     │ ← Başlangıç durumu
└─────┬───────┘
      │
      ↓
┌─────────────┐
│ In Progress │ ← Agent ticket'ı aldı
└─────┬───────┘
      │
      ↓
┌─────────────┐
│  Resolved   │ ← Çözüm önerildi
└─────┬───────┘
      │
      ├──→ ┌─────────────┐
      │    │   Closed    │ ← Kullanıcı onayladı
      │    └─────────────┘
      │
      └──→ ┌─────────────┐
           │ In Progress │ ← Kullanıcı reddetti
           └─────────────┘
```

### 2. Email to Ticket Workflow

```
IMAP Listener Worker (Background Service)
    ↓
Email geldiğinde tespit et
    ↓
Parse email (subject, body, attachments)
    ↓
Yeni ticket oluştur
    ↓
Departman ata (subject/body'den çıkarım)
    ↓
SignalR ile ilgili kullanıcılara bildir
```

### 3. SLA Monitoring Workflow

```
SLA Monitor Worker (Background Service - Her 1 dakikada)
    ↓
Açık ticket'ları kontrol et
    ↓
SLA süresi dolmuş mu?
    ↓
[EVET] → Warning notification gönder
         → Ticket priority artır (opsiyonel)
         → Manager'a escalate et
    ↓
[HAYIR] → Continue monitoring
```

### 4. Automation Rules Workflow

```
Trigger Event (örn: Ticket Created)
    ↓
Matching automation rules bul
    ↓
Priority sırasına göre sırala
    ↓
Her rule için:
    ↓
    Condition kontrolü (JSON)
    ↓
    [MATCH] → Action uygula (JSON)
              - Auto-assign
              - Send notification
              - Update status
              - Add comment
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          # Yeni kullanıcı kaydı
POST   /api/auth/login             # Login
GET    /api/auth/me                # Mevcut kullanıcı bilgisi
```

### Tickets
```
GET    /api/tickets                # Ticket listesi (filtreleme ile)
POST   /api/tickets                # Yeni ticket
GET    /api/tickets/{id}           # Ticket detayı
PUT    /api/tickets/{id}           # Ticket güncelle
DELETE /api/tickets/{id}           # Ticket sil
POST   /api/tickets/{id}/comments  # Yorum ekle
POST   /api/tickets/{id}/assign    # Ticket ata
PUT    /api/tickets/{id}/status    # Durum güncelle
POST   /api/tickets/{id}/close     # Ticket kapat
```

### Admin
```
GET    /api/admin/departments                    # Departmanlar
POST   /api/admin/departments                    # Departman oluştur
GET    /api/admin/departments/{id}/members       # Departman üyeleri
POST   /api/admin/departments/{id}/assign        # Kullanıcı departmana ata
GET    /api/admin/users                          # Kullanıcılar
PUT    /api/admin/users/{id}                     # Kullanıcı güncelle
DELETE /api/admin/users/{id}                     # Kullanıcı sil
GET    /api/admin/sla-plans                      # SLA planları
POST   /api/admin/sla-plans                      # SLA oluştur
GET    /api/admin/automation-rules               # Otomasyon kuralları
POST   /api/admin/automation-rules               # Kural oluştur
```

### Knowledge Base
```
GET    /api/kb                     # Makale listesi
GET    /api/kb/{slug}              # Makale detayı
POST   /api/kb                     # Makale oluştur (admin)
PUT    /api/kb/{id}                # Makale güncelle (admin)
POST   /api/kb/{id}/helpful        # Makaleyi yararlı işaretle
```

### Reports
```
GET    /api/reports/dashboard      # Dashboard istatistikleri
GET    /api/reports/tickets        # Ticket raporları
GET    /api/reports/performance    # Performans raporları
```

---

## 🌐 SignalR Real-time Communication

### Hub'lar

#### TicketHub
```typescript
// Client -> Server
connection.invoke("JoinTicketRoom", ticketId);
connection.invoke("SendComment", ticketId, comment);

// Server -> Client
connection.on("TicketUpdated", (ticket) => { ... });
connection.on("NewComment", (comment) => { ... });
connection.on("StatusChanged", (status) => { ... });
```

#### NotificationHub
```typescript
// Server -> Client
connection.on("ReceiveNotification", (notification) => {
  // Bildirim göster
});
```

### Kullanım Senaryoları
1. Ticket güncellendiğinde tüm ilgili kullanıcılara anında bildirim
2. Yeni yorum eklendiğinde real-time güncelleme
3. Durum değişikliklerinde anlık bilgilendirme
4. Agent ataması yapıldığında anında bildirim

---

## ⚙️ Background Services (Workers)

### 1. SLAMonitorWorker
**Görev:** SLA sürelerini kontrol eder
**Çalışma Periyodu:** Her 1 dakika
**İşlevler:**
- Açık ticket'ların SLA sürelerini kontrol
- Süre aşımı durumunda bildirim
- Escalation işlemleri

### 2. VirusScanWorker
**Görev:** Yüklenen dosyaları tarar
**Çalışma Periyodu:** Background
**İşlevler:**
- Attachment'ları güvenlik açısından kontrol
- Zararlı dosyaları karantinaya al

### 3. ImapListenerWorker
**Görev:** Email'leri ticket'a çevirir
**Çalışma Periyodu:** Sürekli dinleme
**İşlevler:**
- IMAP sunucusunu dinle
- Gelen email'leri parse et
- Otomatik ticket oluştur

---

## 🎨 Frontend Özellikleri

### Component Yapısı
- **Context API:** Global state management (Auth)
- **Protected Routes:** Yetki kontrolü
- **Responsive Design:** Mobil uyumlu (Tailwind CSS)
- **Loading States:** Kullanıcı deneyimi için spinner'lar
- **Error Handling:** Toast notifications ile hata yönetimi

### Sayfa Yapısı

#### Dashboard
- Ticket istatistikleri
- Grafik ve chartlar
- Hızlı eylem butonları
- Son güncellemeler

#### Ticket Management
- Filtreleme (status, priority, department)
- Arama
- Sayfalama
- Detaylı görünüm
- Yorum ekleme
- Durum değiştirme

#### Admin Panel
- Kullanıcı yönetimi
- Departman yönetimi
- SLA planları
- Kategori hiyerarşisi
- Otomasyon kuralları
- Bilgi bankası yönetimi

#### Knowledge Base
- Makale arama ve filtreleme
- Kategori bazlı listeleme
- Öne çıkan makaleler
- Makale detay görünümü
- Yararlı/yararlı değil feedback

---

## 🚀 Kurulum ve Deployment

### Development Environment

#### Backend
```bash
cd backend
dotnet restore
dotnet ef database update  # Database migration
dotnet run                 # http://localhost:5000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### Docker Deployment

```bash
docker-compose up -d
```

**Servisler:**
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Database: PostgreSQL (internal)

### Production Deployment

#### Backend (Linux/Windows Server)
```bash
dotnet publish -c Release -o ./publish
cd publish
dotnet Tickly.Api.dll
```

#### Frontend (Static Hosting)
```bash
npm run build
# dist/ klasörünü web sunucusuna deploy et
```

---

## 📈 Performans Optimizasyonları

### Backend
1. **Entity Framework Query Optimization**
   - Include/ThenInclude ile eager loading
   - AsNoTracking() read-only query'ler için
   - Pagination ile büyük data setlerinde performans

2. **Caching**
   - In-memory cache kritik veriler için
   - Response caching GET endpoint'leri için

3. **Background Jobs**
   - Hosted Services ile async işlemler
   - SLA monitoring, email processing

### Frontend
1. **Code Splitting**
   - React.lazy() ve Suspense ile lazy loading
   - Route-based splitting

2. **Memoization**
   - React.memo() gereksiz re-render'ları önler
   - useMemo() ve useCallback() hooks

3. **Optimistic Updates**
   - UI anında güncellenir, arka planda API call

---

## 🔧 Yapılandırma

### Backend Configuration (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=tickly.db"
  },
  "Jwt": {
    "Key": "your-secret-key-min-32-characters",
    "Issuer": "TicklyAPI",
    "Audience": "TicklyClients"
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "ImapHost": "imap.gmail.com",
    "ImapPort": 993,
    "ImapEnabled": false
  }
}
```

### Frontend Configuration

```typescript
// src/lib/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

---

## 📊 Metrikler ve Monitoring

### Önerilen Monitoring Araçları
- **Application Insights** (Azure)
- **Sentry** (Error tracking)
- **Prometheus + Grafana** (Metrics)
- **ELK Stack** (Logging)

### Takip Edilecek Metrikler
- API response time
- Ticket resolution time
- SLA compliance rate
- User activity
- Error rates
- Database query performance

---

## 🧪 Test Stratejisi

### Backend Testing
```csharp
// Unit Tests
- Service layer tests
- Business logic validation

// Integration Tests
- API endpoint tests
- Database operations
```

### Frontend Testing
```typescript
// Unit Tests (Jest + React Testing Library)
- Component rendering
- User interactions

// E2E Tests (Playwright/Cypress)
- User workflows
- Critical paths
```

---

## 🔮 Gelecek Geliştirmeler

### Planlanan Özellikler
1. **Mobile App** - React Native ile mobil uygulama
2. **Advanced Analytics** - ML tabanlı ticket önceliklendirme
3. **Multi-tenancy** - Çoklu organizasyon desteği
4. **Chatbot Integration** - AI destekli otomatik yanıtlar
5. **File Versioning** - Attachment'larda versiyon kontrolü
6. **Advanced Reporting** - Özelleştirilebilir rapor builder
7. **API Rate Limiting** - DDoS koruması
8. **Two-Factor Authentication** - Ek güvenlik katmanı

---

## 📞 Destek ve İletişim

### Proje Bilgileri
- **Proje Adı:** Tickly
- **Versiyon:** 1.0.0
- **Geliştirme Süresi:** 2025
- **Lisans:** Özel/Kurumsal

### Teknik Gereksinimler
- **.NET SDK:** 8.0+
- **Node.js:** 18+
- **RAM:** Minimum 4GB (8GB önerilir)
- **Disk:** 1GB+ serbest alan
- **Tarayıcı:** Chrome 90+, Firefox 88+, Safari 14+

---

## 📝 Sonuç

Tickly, modern web teknolojileri kullanılarak geliştirilmiş, ölçeklenebilir ve güvenli bir Help Desk çözümüdür. Mikroservis mimarisine geçiş için hazır altyapı, real-time communication özellikleri ve kapsamlı otomasyon yetenekleri ile kurumsal ihtiyaçları karşılayacak şekilde tasarlanmıştır.

### Ana Avantajlar
✅ Modern ve temiz kullanıcı arayüzü
✅ Real-time güncellemeler
✅ Kapsamlı otomasyon
✅ Detaylı raporlama
✅ Esnek ve genişletilebilir mimari
✅ Yüksek güvenlik standartları
✅ Kolay deployment ve bakım

---

**Son Güncelleme:** 7 Kasım 2025
