# Tickly Setup Script# Tickly - Departman ve Kullanıcı Kurulum Script'i

$baseUrl = "http://localhost:5000"# Bu script departmanları ve kullanıcıları otomatik olarak oluşturur



Write-Host "Tickly Departman Kurulum" -ForegroundColor Cyan$baseUrl = "http://localhost:5000"

Write-Host ""$ErrorActionPreference = "Stop"



# LoginWrite-Host "==================================" -ForegroundColor Cyan

Write-Host "Login..." -ForegroundColor YellowWrite-Host "Tickly Departman Kurulum Script'i" -ForegroundColor Cyan

$loginBody = @{ username = "superadmin"; password = "Admin@123" } | ConvertTo-JsonWrite-Host "==================================" -ForegroundColor Cyan

$loginResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"Write-Host ""

$token = $loginResp.token

$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }# 1. SuperAdmin ile Login

Write-Host "OK" -ForegroundColor GreenWrite-Host "1. SuperAdmin ile giriş yapılıyor..." -ForegroundColor Yellow

Write-Host ""$loginBody = @{

    username = "superadmin"

# Departments    password = "Admin@123"

Write-Host "Departmanlar olusturuluyor..." -ForegroundColor Yellow} | ConvertTo-Json

$itDept = Invoke-RestMethod -Uri "$baseUrl/api/admin/departments" -Method Post -Body (@{ name = "Bilgi Islem"; description = "IT Department" } | ConvertTo-Json) -Headers $headers

$hrDept = Invoke-RestMethod -Uri "$baseUrl/api/admin/departments" -Method Post -Body (@{ name = "Insan Kaynaklari"; description = "HR Department" } | ConvertTo-Json) -Headers $headerstry {

Write-Host "IT Dept ID: $($itDept.id)" -ForegroundColor Green    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

Write-Host "HR Dept ID: $($hrDept.id)" -ForegroundColor Green    $token = $loginResponse.token

Write-Host ""    Write-Host "✓ Login başarılı! Token alındı." -ForegroundColor Green

    Write-Host ""

# Users} catch {

Write-Host "Kullanicilar olusturuluyor..." -ForegroundColor Yellow    Write-Host "✗ Login başarısız! Backend çalışıyor mu?" -ForegroundColor Red

    Write-Host $_.Exception.Message -ForegroundColor Red

# IT Manager    exit 1

$itMgr = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body (@{ username = "it.manager"; email = "it.manager@company.com"; password = "IT@Manager123"; displayName = "IT Manager" } | ConvertTo-Json) -ContentType "application/json"}

Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$($itDept.id)/assign" -Method Post -Body (@{ userId = $itMgr.user.id; role = "DepartmentManager" } | ConvertTo-Json) -Headers $headers | Out-Null

Write-Host "it.manager created" -ForegroundColor Green$headers = @{

    "Authorization" = "Bearer $token"

# IT Staff 1    "Content-Type" = "application/json"

$itStf1 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body (@{ username = "it.staff1"; email = "it.staff1@company.com"; password = "IT@Staff123"; displayName = "IT Staff 1" } | ConvertTo-Json) -ContentType "application/json"}

Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$($itDept.id)/assign" -Method Post -Body (@{ userId = $itStf1.user.id; role = "DepartmentStaff" } | ConvertTo-Json) -Headers $headers | Out-Null

Write-Host "it.staff1 created" -ForegroundColor Green# 2. Departmanları Oluştur

Write-Host "2. Departmanlar oluşturuluyor..." -ForegroundColor Yellow

# IT Staff 2

$itStf2 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body (@{ username = "it.staff2"; email = "it.staff2@company.com"; password = "IT@Staff123"; displayName = "IT Staff 2" } | ConvertTo-Json) -ContentType "application/json"# IT Department

Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$($itDept.id)/assign" -Method Post -Body (@{ userId = $itStf2.user.id; role = "DepartmentStaff" } | ConvertTo-Json) -Headers $headers | Out-Null$itDeptBody = @{

Write-Host "it.staff2 created" -ForegroundColor Green    name = "Bilgi İşlem"

    description = "Bilgi teknolojileri destek ve altyapı departmanı"

# HR Manager} | ConvertTo-Json

$hrMgr = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body (@{ username = "hr.manager"; email = "hr.manager@company.com"; password = "HR@Manager123"; displayName = "HR Manager" } | ConvertTo-Json) -ContentType "application/json"

Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$($hrDept.id)/assign" -Method Post -Body (@{ userId = $hrMgr.user.id; role = "DepartmentManager" } | ConvertTo-Json) -Headers $headers | Out-Nulltry {

Write-Host "hr.manager created" -ForegroundColor Green    $itDept = Invoke-RestMethod -Uri "$baseUrl/api/admin/departments" -Method Post -Body $itDeptBody -Headers $headers

    $itDeptId = $itDept.id

# HR Staff 1    Write-Host "✓ Bilgi İşlem departmanı oluşturuldu (ID: $itDeptId)" -ForegroundColor Green

$hrStf1 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body (@{ username = "hr.staff1"; email = "hr.staff1@company.com"; password = "HR@Staff123"; displayName = "HR Staff 1" } | ConvertTo-Json) -ContentType "application/json"} catch {

Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$($hrDept.id)/assign" -Method Post -Body (@{ userId = $hrStf1.user.id; role = "DepartmentStaff" } | ConvertTo-Json) -Headers $headers | Out-Null    Write-Host "✗ Bilgi İşlem departmanı oluşturulamadı" -ForegroundColor Red

Write-Host "hr.staff1 created" -ForegroundColor Green    Write-Host $_.Exception.Message -ForegroundColor Red

}

# HR Staff 2

$hrStf2 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body (@{ username = "hr.staff2"; email = "hr.staff2@company.com"; password = "HR@Staff123"; displayName = "HR Staff 2" } | ConvertTo-Json) -ContentType "application/json"# HR Department

Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$($hrDept.id)/assign" -Method Post -Body (@{ userId = $hrStf2.user.id; role = "DepartmentStaff" } | ConvertTo-Json) -Headers $headers | Out-Null$hrDeptBody = @{

Write-Host "hr.staff2 created" -ForegroundColor Green    name = "İnsan Kaynakları"

    description = "İnsan kaynakları yönetimi ve personel işlemleri departmanı"

# End Users} | ConvertTo-Json

$emp1 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body (@{ username = "employee1"; email = "emp1@company.com"; password = "User@123"; displayName = "Employee 1" } | ConvertTo-Json) -ContentType "application/json"

Write-Host "employee1 created" -ForegroundColor Greentry {

    $hrDept = Invoke-RestMethod -Uri "$baseUrl/api/admin/departments" -Method Post -Body $hrDeptBody -Headers $headers

$emp2 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body (@{ username = "employee2"; email = "emp2@company.com"; password = "User@123"; displayName = "Employee 2" } | ConvertTo-Json) -ContentType "application/json"    $hrDeptId = $hrDept.id

Write-Host "employee2 created" -ForegroundColor Green    Write-Host "✓ İnsan Kaynakları departmanı oluşturuldu (ID: $hrDeptId)" -ForegroundColor Green

} catch {

$emp3 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body (@{ username = "employee3"; email = "emp3@company.com"; password = "User@123"; displayName = "Employee 3" } | ConvertTo-Json) -ContentType "application/json"    Write-Host "✗ İnsan Kaynakları departmanı oluşturulamadı" -ForegroundColor Red

Write-Host "employee3 created" -ForegroundColor Green    Write-Host $_.Exception.Message -ForegroundColor Red

}

Write-Host ""

Write-Host "TAMAMLANDI!" -ForegroundColor GreenWrite-Host ""

Write-Host ""

Write-Host "Kullanicilar:" -ForegroundColor White# 3. Kullanıcıları Oluştur

Write-Host "  SuperAdmin: superadmin / Admin@123"Write-Host "3. Kullanıcılar oluşturuluyor..." -ForegroundColor Yellow

Write-Host "  IT Manager: it.manager / IT@Manager123"

Write-Host "  IT Staff: it.staff1, it.staff2 / IT@Staff123"# IT Department Manager

Write-Host "  HR Manager: hr.manager / HR@Manager123"$itManagerBody = @{

Write-Host "  HR Staff: hr.staff1, hr.staff2 / HR@Staff123"    username = "it.manager"

Write-Host "  Employees: employee1, employee2, employee3 / User@123"    email = "it.manager@company.com"

Write-Host ""    password = "IT@Manager123"

    displayName = "Ahmet Yılmaz (IT Müdürü)"
} | ConvertTo-Json

try {
    $itManager = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $itManagerBody -ContentType "application/json"
    $itManagerId = $itManager.user.id
    Write-Host "✓ IT Manager kullanıcısı oluşturuldu: it.manager / IT@Manager123" -ForegroundColor Green
    
    # Role ata
    $roleBody = @{
        userId = $itManagerId
        role = "DepartmentManager"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$itDeptId/assign" -Method Post -Body $roleBody -Headers $headers | Out-Null
    Write-Host "  → DepartmentManager rolü atandı" -ForegroundColor Gray
} catch {
    Write-Host "✗ IT Manager oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
}

# IT Department Staff 1
$itStaff1Body = @{
    username = "it.staff1"
    email = "it.staff1@company.com"
    password = "IT@Staff123"
    displayName = "Mehmet Demir (IT Teknisyeni)"
} | ConvertTo-Json

try {
    $itStaff1 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $itStaff1Body -ContentType "application/json"
    $itStaff1Id = $itStaff1.user.id
    Write-Host "✓ IT Staff kullanıcısı oluşturuldu: it.staff1 / IT@Staff123" -ForegroundColor Green
    
    # Role ata
    $roleBody = @{
        userId = $itStaff1Id
        role = "DepartmentStaff"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$itDeptId/assign" -Method Post -Body $roleBody -Headers $headers | Out-Null
    Write-Host "  → DepartmentStaff rolü atandı" -ForegroundColor Gray
} catch {
    Write-Host "✗ IT Staff 1 oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
}

# IT Department Staff 2
$itStaff2Body = @{
    username = "it.staff2"
    email = "it.staff2@company.com"
    password = "IT@Staff123"
    displayName = "Ayşe Kaya (IT Teknisyeni)"
} | ConvertTo-Json

try {
    $itStaff2 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $itStaff2Body -ContentType "application/json"
    $itStaff2Id = $itStaff2.user.id
    Write-Host "✓ IT Staff kullanıcısı oluşturuldu: it.staff2 / IT@Staff123" -ForegroundColor Green
    
    # Role ata
    $roleBody = @{
        userId = $itStaff2Id
        role = "DepartmentStaff"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$itDeptId/assign" -Method Post -Body $roleBody -Headers $headers | Out-Null
    Write-Host "  → DepartmentStaff rolü atandı" -ForegroundColor Gray
} catch {
    Write-Host "✗ IT Staff 2 oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# HR Department Manager
$hrManagerBody = @{
    username = "hr.manager"
    email = "hr.manager@company.com"
    password = "HR@Manager123"
    displayName = "Zeynep Çelik (İK Müdürü)"
} | ConvertTo-Json

try {
    $hrManager = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $hrManagerBody -ContentType "application/json"
    $hrManagerId = $hrManager.user.id
    Write-Host "✓ HR Manager kullanıcısı oluşturuldu: hr.manager / HR@Manager123" -ForegroundColor Green
    
    # Role ata
    $roleBody = @{
        userId = $hrManagerId
        role = "DepartmentManager"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$hrDeptId/assign" -Method Post -Body $roleBody -Headers $headers | Out-Null
    Write-Host "  → DepartmentManager rolü atandı" -ForegroundColor Gray
} catch {
    Write-Host "✗ HR Manager oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
}

# HR Department Staff 1
$hrStaff1Body = @{
    username = "hr.staff1"
    email = "hr.staff1@company.com"
    password = "HR@Staff123"
    displayName = "Can Öztürk (İK Uzmanı)"
} | ConvertTo-Json

try {
    $hrStaff1 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $hrStaff1Body -ContentType "application/json"
    $hrStaff1Id = $hrStaff1.user.id
    Write-Host "✓ HR Staff kullanıcısı oluşturuldu: hr.staff1 / HR@Staff123" -ForegroundColor Green
    
    # Role ata
    $roleBody = @{
        userId = $hrStaff1Id
        role = "DepartmentStaff"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$hrDeptId/assign" -Method Post -Body $roleBody -Headers $headers | Out-Null
    Write-Host "  → DepartmentStaff rolü atandı" -ForegroundColor Gray
} catch {
    Write-Host "✗ HR Staff 1 oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
}

# HR Department Staff 2
$hrStaff2Body = @{
    username = "hr.staff2"
    email = "hr.staff2@company.com"
    password = "HR@Staff123"
    displayName = "Elif Yılmaz (İK Uzmanı)"
} | ConvertTo-Json

try {
    $hrStaff2 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $hrStaff2Body -ContentType "application/json"
    $hrStaff2Id = $hrStaff2.user.id
    Write-Host "✓ HR Staff kullanıcısı oluşturuldu: hr.staff2 / HR@Staff123" -ForegroundColor Green
    
    # Role ata
    $roleBody = @{
        userId = $hrStaff2Id
        role = "DepartmentStaff"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/api/admin/departments/$hrDeptId/assign" -Method Post -Body $roleBody -Headers $headers | Out-Null
    Write-Host "  → DepartmentStaff rolü atandı" -ForegroundColor Gray
} catch {
    Write-Host "✗ HR Staff 2 oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Normal Kullanıcılar (End Users)
Write-Host "4. Normal kullanıcılar oluşturuluyor..." -ForegroundColor Yellow

# End User 1
$user1Body = @{
    username = "employee1"
    email = "employee1@company.com"
    password = "User@123"
    displayName = "Ali Veli (Çalışan)"
} | ConvertTo-Json

try {
    $user1 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $user1Body -ContentType "application/json"
    Write-Host "✓ Normal kullanıcı oluşturuldu: employee1 / User@123" -ForegroundColor Green
} catch {
    Write-Host "✗ Employee 1 oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
}

# End User 2
$user2Body = @{
    username = "employee2"
    email = "employee2@company.com"
    password = "User@123"
    displayName = "Fatma Nur (Çalışan)"
} | ConvertTo-Json

try {
    $user2 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $user2Body -ContentType "application/json"
    Write-Host "✓ Normal kullanıcı oluşturuldu: employee2 / User@123" -ForegroundColor Green
} catch {
    Write-Host "✗ Employee 2 oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
}

# End User 3
$user3Body = @{
    username = "employee3"
    email = "employee3@company.com"
    password = "User@123"
    displayName = "Burak Şahin (Çalışan)"
} | ConvertTo-Json

try {
    $user3 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $user3Body -ContentType "application/json"
    Write-Host "✓ Normal kullanıcı oluşturuldu: employee3 / User@123" -ForegroundColor Green
} catch {
    Write-Host "✗ Employee 3 oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Kurulum Tamamlandı!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Oluşturulan Departmanlar:" -ForegroundColor White
Write-Host "  • Bilgi İşlem (ID: $itDeptId)" -ForegroundColor Gray
Write-Host "  • İnsan Kaynakları (ID: $hrDeptId)" -ForegroundColor Gray
Write-Host ""
Write-Host "👥 Oluşturulan Kullanıcılar:" -ForegroundColor White
Write-Host ""
Write-Host "  🔐 SuperAdmin:" -ForegroundColor Yellow
Write-Host "    • superadmin / Admin@123" -ForegroundColor Gray
Write-Host ""
Write-Host "  💼 IT Departmanı:" -ForegroundColor Cyan
Write-Host "    • it.manager / IT@Manager123 (Manager)" -ForegroundColor Gray
Write-Host "    • it.staff1 / IT@Staff123 (Staff)" -ForegroundColor Gray
Write-Host "    • it.staff2 / IT@Staff123 (Staff)" -ForegroundColor Gray
Write-Host ""
Write-Host "  👔 HR Departmanı:" -ForegroundColor Magenta
Write-Host "    • hr.manager / HR@Manager123 (Manager)" -ForegroundColor Gray
Write-Host "    • hr.staff1 / HR@Staff123 (Staff)" -ForegroundColor Gray
Write-Host "    • hr.staff2 / HR@Staff123 (Staff)" -ForegroundColor Gray
Write-Host ""
Write-Host "  👤 Normal Kullanıcılar:" -ForegroundColor White
Write-Host "    • employee1 / User@123" -ForegroundColor Gray
Write-Host "    • employee2 / User@123" -ForegroundColor Gray
Write-Host "    • employee3 / User@123" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend URL: http://localhost:5173" -ForegroundColor Green
Write-Host "Swagger API URL: http://localhost:5000/swagger" -ForegroundColor Green
Write-Host ""
