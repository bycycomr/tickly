# Örnek Veri Oluşturma Script'i
# Bu script örnek departmanları ve çalışanları veritabanına ekler

$baseUrl = "http://localhost:5000"
$adminUsername = "superadmin"
$adminPassword = "password"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Tickly Örnek Veri Seed Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Admin Login
Write-Host "1. SuperAdmin ile giriş yapılıyor..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = $adminUsername
        password = $adminPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"

    $token = $loginResponse.token
    Write-Host "OK Giris basarili! Token alindi." -ForegroundColor Green
} catch {
    Write-Host "HATA Giris basarisiz: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Departmanları Oluştur
Write-Host ""
Write-Host "2. Departmanlar oluşturuluyor..." -ForegroundColor Yellow

$departments = @(
    @{ name = "Bilgi Teknolojileri"; description = "IT ve Yazılım Departmanı" },
    @{ name = "İnsan Kaynakları"; description = "HR Departmanı" },
    @{ name = "Muhasebe"; description = "Finans ve Muhasebe" },
    @{ name = "Pazarlama"; description = "Pazarlama ve Satış" },
    @{ name = "Üretim"; description = "Üretim ve Operasyon" }
)

$createdDepartments = @{}

foreach ($dept in $departments) {
    try {
        $deptBody = $dept | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/departments" `
            -Method Post `
            -Headers $headers `
            -Body $deptBody
        
        $createdDepartments[$dept.name] = $response.id
        Write-Host "  OK $($dept.name) departmani olusturuldu (ID: $($response.id))" -ForegroundColor Green
    } catch {
        Write-Host "  HATA $($dept.name) olusturulamadi: $_" -ForegroundColor Red
    }
}

# 3. Kullanıcıları Oluştur
Write-Host ""
Write-Host "3. Kullanıcılar oluşturuluyor..." -ForegroundColor Yellow

$users = @(
    @{ username = "ahmet.yilmaz"; email = "ahmet.yilmaz@sirket.com"; displayName = "Ahmet Yılmaz"; department = "Bilgi Teknolojileri" },
    @{ username = "ayse.demir"; email = "ayse.demir@sirket.com"; displayName = "Ayşe Demir"; department = "İnsan Kaynakları" },
    @{ username = "mehmet.kaya"; email = "mehmet.kaya@sirket.com"; displayName = "Mehmet Kaya"; department = "Muhasebe" },
    @{ username = "fatma.celik"; email = "fatma.celik@sirket.com"; displayName = "Fatma Çelik"; department = "Pazarlama" },
    @{ username = "ali.ozturk"; email = "ali.ozturk@sirket.com"; displayName = "Ali Öztürk"; department = "Üretim" },
    @{ username = "zeynep.arslan"; email = "zeynep.arslan@sirket.com"; displayName = "Zeynep Arslan"; department = "Bilgi Teknolojileri" },
    @{ username = "mustafa.dogan"; email = "mustafa.dogan@sirket.com"; displayName = "Mustafa Doğan"; department = "İnsan Kaynakları" },
    @{ username = "elif.kurt"; email = "elif.kurt@sirket.com"; displayName = "Elif Kurt"; department = "Muhasebe" },
    @{ username = "emre.sahin"; email = "emre.sahin@sirket.com"; displayName = "Emre Şahin"; department = "Pazarlama" },
    @{ username = "seda.yildiz"; email = "seda.yildiz@sirket.com"; displayName = "Seda Yıldız"; department = "Üretim" }
)

$createdUsers = @()

foreach ($user in $users) {
    try {
        $registerBody = @{
            username = $user.username
            email = $user.email
            displayName = $user.displayName
            password = "Password123"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
            -Method Post `
            -Body $registerBody `
            -ContentType "application/json"

        $userId = $response.user.id
        $createdUsers += @{ user = $user; id = $userId }
        Write-Host "  OK $($user.displayName) olusturuldu (ID: $userId)" -ForegroundColor Green

        # Kullaniciyi departmana ata
        if ($createdDepartments.ContainsKey($user.department)) {
            $deptId = $createdDepartments[$user.department]
            
            try {
                $assignBody = @{
                    userId = $userId
                    role = "EndUser"
                } | ConvertTo-Json

                Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$deptId/assign" `
                    -Method Post `
                    -Headers $headers `
                    -Body $assignBody | Out-Null

                Write-Host "    -> $($user.department) departmanina atandi" -ForegroundColor Gray
            } catch {
                Write-Host "    x Departman atamasi basarisiz: $_" -ForegroundColor Red
            }
        }

    } catch {
        Write-Host "  HATA $($user.displayName) olusturulamadi: $_" -ForegroundColor Red
    }

    Start-Sleep -Milliseconds 200
}

# 4. Özet
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "OZET" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "OK $($createdDepartments.Count) departman olusturuldu" -ForegroundColor Green
Write-Host "OK $($createdUsers.Count) kullanici olusturuldu" -ForegroundColor Green
Write-Host ""
Write-Host "Test icin giris yapabilirsiniz:" -ForegroundColor Yellow
Write-Host "  Kullanici: ahmet.yilmaz" -ForegroundColor White
Write-Host "  Sifre: Password123" -ForegroundColor White
Write-Host ""
Write-Host "Tum kullanicilarin sifresi: Password123" -ForegroundColor Cyan
Write-Host ""
