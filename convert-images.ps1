# Image Conversion Script for Sakr Store
# Converts JPG/PNG images to WebP and AVIF formats
# Requires: ImageMagick or cwebp/avifenc tools

param(
    [string]$ImagePath = ".\images",
    [int]$WebPQuality = 80,
    [int]$AvifQuality = 60
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Sakr Store - Image Optimization Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if images directory exists
if (-not (Test-Path $ImagePath)) {
    Write-Host "ERROR: Images directory not found: $ImagePath" -ForegroundColor Red
    exit 1
}

# Get all JPG and PNG files
$imageFiles = Get-ChildItem -Path $ImagePath -Include *.jpg,*.jpeg,*.png -Recurse

if ($imageFiles.Count -eq 0) {
    Write-Host "No JPG or PNG images found in $ImagePath" -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($imageFiles.Count) images to convert" -ForegroundColor Green
Write-Host ""

# Check for ImageMagick
$hasImageMagick = $null -ne (Get-Command "magick" -ErrorAction SilentlyContinue)
$hasCWebP = $null -ne (Get-Command "cwebp" -ErrorAction SilentlyContinue)
$hasAvifEnc = $null -ne (Get-Command "avifenc" -ErrorAction SilentlyContinue)

Write-Host "Tool Availability:" -ForegroundColor Cyan
Write-Host "  ImageMagick: $(if($hasImageMagick){'✓ Available'}else{'✗ Not found'})" -ForegroundColor $(if($hasImageMagick){'Green'}else{'Red'})
Write-Host "  cwebp:       $(if($hasCWebP){'✓ Available'}else{'✗ Not found'})" -ForegroundColor $(if($hasCWebP){'Green'}else{'Red'})
Write-Host "  avifenc:     $(if($hasAvifEnc){'✓ Available'}else{'✗ Not found'})" -ForegroundColor $(if($hasAvifEnc){'Green'}else{'Red'})
Write-Host ""

if (-not ($hasImageMagick -or $hasCWebP -or $hasAvifEnc)) {
    Write-Host "ERROR: No image conversion tools found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install one of the following:" -ForegroundColor Yellow
    Write-Host "  1. ImageMagick: https://imagemagick.org/script/download.php" -ForegroundColor Yellow
    Write-Host "  2. WebP tools: https://developers.google.com/speed/webp/download" -ForegroundColor Yellow
    Write-Host "  3. AVIF tools: https://github.com/AOMediaCodec/libavif/releases" -ForegroundColor Yellow
    exit 1
}

$convertedWebP = 0
$convertedAvif = 0
$skippedWebP = 0
$skippedAvif = 0

foreach ($file in $imageFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $directory = $file.DirectoryName
    $webpPath = Join-Path $directory "$baseName.webp"
    $avifPath = Join-Path $directory "$baseName.avif"
    
    Write-Host "Processing: $($file.Name)" -ForegroundColor White
    
    # Convert to WebP
    if (Test-Path $webpPath) {
        Write-Host "  WebP: Skipped (already exists)" -ForegroundColor Yellow
        $skippedWebP++
    }
    else {
        try {
            if ($hasCWebP) {
                # Use cwebp
                & cwebp -q $WebPQuality $file.FullName -o $webpPath 2>&1 | Out-Null
            }
            elseif ($hasImageMagick) {
                # Use ImageMagick
                & magick $file.FullName -quality $WebPQuality $webpPath
            }
            
            if (Test-Path $webpPath) {
                $originalSize = $file.Length / 1KB
                $webpSize = (Get-Item $webpPath).Length / 1KB
                $savings = [math]::Round((($originalSize - $webpSize) / $originalSize) * 100, 1)
                Write-Host "  WebP: Created (${originalSize}KB → ${webpSize}KB, saved ${savings}%)" -ForegroundColor Green
                $convertedWebP++
            }
        }
        catch {
            Write-Host "  WebP: Failed - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Convert to AVIF
    if (Test-Path $avifPath) {
        Write-Host "  AVIF: Skipped (already exists)" -ForegroundColor Yellow
        $skippedAvif++
    }
    else {
        try {
            if ($hasAvifEnc) {
                # Use avifenc
                & avifenc -s 0 --min $AvifQuality --max $AvifQuality $file.FullName $avifPath 2>&1 | Out-Null
            }
            elseif ($hasImageMagick) {
                # Use ImageMagick
                & magick $file.FullName -quality $AvifQuality $avifPath
            }
            
            if (Test-Path $avifPath) {
                $originalSize = $file.Length / 1KB
                $avifSize = (Get-Item $avifPath).Length / 1KB
                $savings = [math]::Round((($originalSize - $avifSize) / $originalSize) * 100, 1)
                Write-Host "  AVIF: Created (${originalSize}KB → ${avifSize}KB, saved ${savings}%)" -ForegroundColor Green
                $convertedAvif++
            }
        }
        catch {
            Write-Host "  AVIF: Failed - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# Summary
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Conversion Complete!" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "WebP: $convertedWebP converted, $skippedWebP skipped" -ForegroundColor $(if($convertedWebP -gt 0){'Green'}else{'Yellow'})
Write-Host "AVIF: $convertedAvif converted, $skippedAvif skipped" -ForegroundColor $(if($convertedAvif -gt 0){'Green'}else{'Yellow'})
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review the converted images in your images folder" -ForegroundColor White
Write-Host "2. Update products.json to reference the new image files if needed" -ForegroundColor White
Write-Host "3. Test the website in different browsers" -ForegroundColor White
Write-Host "4. Check the IMAGE_OPTIMIZATION_GUIDE.md for more details" -ForegroundColor White
