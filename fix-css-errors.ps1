# Script to fix PowerShell code in CSS files

Write-Host "Starting CSS files fix..." -ForegroundColor Cyan

$pattern = '(?s)\s*param\(\$match\)\s+\$size = \[int\]\$match\.Groups\[1\]\.Value\s+\$newSize = \[Math\]::Max\(\$size - 3, 8\)\s+"font-size: \$\{newSize\}px"\s*;'

$cssFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.css"
$fixedCount = 0

foreach ($file in $cssFiles) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match 'param\(\$match\)') {
        Write-Host "Fixing: $($file.FullName)" -ForegroundColor Yellow
        
        # Replace the broken code with proper font-size
        $newContent = $content -replace $pattern, ' font-size: 14px;'
        
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $fixedCount++
        
        Write-Host "  Fixed!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Completed! Fixed $fixedCount files" -ForegroundColor Green
