# PowerShell script to update all HTML files with new hamburger menu
# Changes:
# 1. Move navbar-toggler before navbar-brand
# 2. Replace Font Awesome icon with custom CSS hamburger (3 lines)
# 3. Add accessibility attributes

$htmlFiles = Get-ChildItem -Path "D:\SACARABIACODE-main" -Filter "*.html" | Where-Object { $_.Name -ne "index.html" -and $_.Name -ne "index_backup.html" }

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw

    # Check if file has the old pattern (navbar-toggler after navbar-brand)
    if ($content -match '<a href="index\.html" class="navbar-brand p-0">\s*<img src="img/logo1\.png" alt="SAC Arabia">\s*</a>\s*<button class="navbar-toggler"') {

        # Replace the pattern
        $oldPattern = '<a href="index\.html" class="navbar-brand p-0">\s*<img src="img/logo1\.png" alt="SAC Arabia">\s*</a>\s*<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">\s*<span class="fa fa-bars"></span>\s*</button>'

        $newReplacement = '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="hamburger-menu">
            <span></span>
            <span></span>
            <span></span>
        </span>
    </button>
    <a href="index.html" class="navbar-brand p-0">
    <img src="img/logo1.png" alt="SAC Arabia">
    </a>'

        $newContent = $content -replace $oldPattern, $newReplacement

        if ($newContent -ne $content) {
            Set-Content -Path $file.FullName -Value $newContent
            Write-Host "Updated: $($file.Name)" -ForegroundColor Green
        }
    }
    # Handle variation with extra attributes on button
    elseif ($content -match '<a href="index\.html" class="navbar-brand p-0">\s*<img src="img/logo1\.png" alt="SAC Arabia">\s*</a>\s*<button class="navbar-toggler" type="button" data-bs-togg') {

        $oldPattern = '<a href="index\.html" class="navbar-brand p-0">\s*<img src="img/logo1\.png" alt="SAC Arabia">\s*</a>\s*<button class="navbar-toggler".*?</button>'

        $newReplacement = '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="hamburger-menu">
            <span></span>
            <span></span>
            <span></span>
        </span>
    </button>
    <a href="index.html" class="navbar-brand p-0">
    <img src="img/logo1.png" alt="SAC Arabia">
    </a>'

        $newContent = $content -replace $oldPattern, $newReplacement

        if ($newContent -ne $content) {
            Set-Content -Path $file.FullName -Value $newContent
            Write-Host "Updated: $($file.Name)" -ForegroundColor Green
        }
    }
}

Write-Host "`nDone! All files updated." -ForegroundColor Cyan
