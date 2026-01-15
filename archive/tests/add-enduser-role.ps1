# Tüm kullanıcılara EndUser rolü ekle
# Bu script, sistemdeki tüm kullanıcılara global EndUser rolü atar

$baseUrl = "http://localhost:5000/api"

# SuperAdmin olarak login
$loginBody = @{
    username = "superadmin"
    password = "Admin123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n=== ENDUSER ROLE EKLEME ===" -ForegroundColor Cyan

# Tüm kullanıcıları al
$users = Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method GET -Headers $headers

Write-Host "`nToplam $($users.Count) kullanıcı bulundu`n" -ForegroundColor Yellow

foreach ($user in $users) {
    Write-Host "Kullanıcı: $($user.username) ($($user.displayName))" -ForegroundColor White
    
    # Zaten EndUser rolü var mı kontrol et
    $hasEndUser = $user.roles -contains "EndUser"
    
    if ($hasEndUser) {
        Write-Host "  ✓ Zaten EndUser rolü var, atlanıyor..." -ForegroundColor Green
    } else {
        Write-Host "  → EndUser rolü ekleniyor..." -ForegroundColor Yellow
        
        try {
            $roleBody = @{
                userId = $user.id
                role = "EndUser"
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri "$baseUrl/admin/roles/assign-global" -Method POST -Body $roleBody -Headers $headers
            Write-Host "  ✓ EndUser rolü başarıyla eklendi!" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Hata: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "`n=== TAMAMLANDI ===" -ForegroundColor Cyan
Write-Host "Tüm kullanıcılar kontrol edildi ve gerekli olanlar için EndUser rolü eklendi.`n" -ForegroundColor Green
