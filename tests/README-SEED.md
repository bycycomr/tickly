# Seed Script Kullanım Talimatları

## Adımlar:

### 1. Backend'i Başlat
Bir PowerShell penceresinde:
```powershell
cd backend
dotnet run
```
Backend `http://localhost:5000` adresinde çalışacak.

### 2. Seed Script'ini Çalıştır
Başka bir PowerShell penceresinde:
```powershell
cd tests
.\seed-sample-data.ps1
```

### 3. Script Ne Yapar?

✅ SuperAdmin ile giriş yapar (superadmin/password)
✅ 5 departman oluşturur:
   - Bilgi Teknolojileri
   - İnsan Kaynakları
   - Muhasebe
   - Pazarlama
   - Üretim

✅ 10 çalışan oluşturur ve departmanlarına atar:
   1. Ahmet Yılmaz (IT)
   2. Ayşe Demir (HR)
   3. Mehmet Kaya (Muhasebe)
   4. Fatma Çelik (Pazarlama)
   5. Ali Öztürk (Üretim)
   6. Zeynep Arslan (IT)
   7. Mustafa Doğan (HR)
   8. Elif Kurt (Muhasebe)
   9. Emre Şahin (Pazarlama)
   10. Seda Yıldız (Üretim)

### 4. Test Et

Frontend'i başlat:
```powershell
cd frontend
npm run dev
```

Tarayıcıda `http://localhost:5173` adresine git.

Herhangi bir kullanıcı ile giriş yap:
- Kullanıcı: `ahmet.yilmaz`
- Şifre: `Password123`

## Not:
Eğer script hata verirse, muhtemelen backend çalışmıyordur veya SuperAdmin kullanıcısı mevcut değildir.
