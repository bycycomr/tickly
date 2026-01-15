# Tickly LaTeX to PDF Dönüştürücü
# Bu script LaTeX dosyasını PDF'e dönüştürür

Write-Host "🔄 Tickly LaTeX Dökümanını PDF'e Dönüştürme Başlıyor..." -ForegroundColor Cyan
Write-Host ""

# LaTeX dosyasının varlığını kontrol et
$texFile = "Tickly_Proje_Dokumani.tex"
if (-Not (Test-Path $texFile)) {
    Write-Host "❌ Hata: $texFile dosyası bulunamadı!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ LaTeX dosyası bulundu: $texFile" -ForegroundColor Green

# pdflatex komutunun varlığını kontrol et
$pdflatex = Get-Command pdflatex -ErrorAction SilentlyContinue

if (-Not $pdflatex) {
    Write-Host ""
    Write-Host "❌ pdflatex komutu bulunamadı!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Lütfen aşağıdaki seçeneklerden birini kullanın:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Seçenek 1: MiKTeX Kurulumu (Önerilen)" -ForegroundColor Cyan
    Write-Host "  1. https://miktex.org/download adresine gidin"
    Write-Host "  2. Windows için MiKTeX installer'ı indirin"
    Write-Host "  3. Kurulumu tamamlayın ve bu scripti tekrar çalıştırın"
    Write-Host ""
    Write-Host "Seçenek 2: Online Overleaf (En Kolay)" -ForegroundColor Cyan
    Write-Host "  1. https://www.overleaf.com/ sitesine gidin"
    Write-Host "  2. 'New Project' > 'Upload Project' seçin"
    Write-Host "  3. $texFile dosyasını yükleyin"
    Write-Host "  4. Otomatik olarak PDF oluşturulacaktır"
    Write-Host ""
    Write-Host "Seçenek 3: Docker ile (Docker kurulu ise)" -ForegroundColor Cyan
    Write-Host "  docker run --rm -v ${PWD}:/workspace texlive/texlive pdflatex $texFile"
    Write-Host ""
    exit 1
}

Write-Host "✓ pdflatex komutu bulundu: $($pdflatex.Source)" -ForegroundColor Green
Write-Host ""

# İlk derleme
Write-Host "📄 İlk derleme başlıyor..." -ForegroundColor Cyan
$output1 = pdflatex -interaction=nonstopmode $texFile 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ İlk derleme başarısız oldu!" -ForegroundColor Red
    Write-Host "Hata detayları için $texFile.log dosyasını kontrol edin" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ İlk derleme tamamlandı" -ForegroundColor Green

# İkinci derleme (içindekiler için)
Write-Host "📄 İkinci derleme başlıyor (içindekiler için)..." -ForegroundColor Cyan
$output2 = pdflatex -interaction=nonstopmode $texFile 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  İkinci derleme başarısız oldu, ancak PDF oluşturulmuş olabilir" -ForegroundColor Yellow
} else {
    Write-Host "✓ İkinci derleme tamamlandı" -ForegroundColor Green
}

# PDF dosyasının varlığını kontrol et
$pdfFile = "Tickly_Proje_Dokumani.pdf"
if (Test-Path $pdfFile) {
    $pdfSize = (Get-Item $pdfFile).Length / 1KB
    Write-Host ""
    Write-Host "✅ PDF başarıyla oluşturuldu!" -ForegroundColor Green
    Write-Host "   Dosya: $pdfFile" -ForegroundColor White
    Write-Host "   Boyut: $([math]::Round($pdfSize, 2)) KB" -ForegroundColor White
    Write-Host ""
    
    # Geçici dosyaları temizle
    Write-Host "🧹 Geçici dosyalar temizleniyor..." -ForegroundColor Cyan
    $tempExtensions = @("*.aux", "*.log", "*.out", "*.toc")
    foreach ($ext in $tempExtensions) {
        Remove-Item $ext -ErrorAction SilentlyContinue
    }
    Write-Host "✓ Temizlik tamamlandı" -ForegroundColor Green
    Write-Host ""
    
    # PDF'i aç
    Write-Host "📖 PDF açılıyor..." -ForegroundColor Cyan
    Start-Process $pdfFile
    
} else {
    Write-Host ""
    Write-Host "❌ PDF oluşturulamadı!" -ForegroundColor Red
    Write-Host "Log dosyasını kontrol edin: $texFile.log" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 İşlem tamamlandı!" -ForegroundColor Green
Write-Host ""
