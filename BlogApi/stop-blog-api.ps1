# Debug derlemesi oncesi: bin/obj ciktilarini kilitleyen eski API surecini kapatir.
$ErrorActionPreference = "SilentlyContinue"

# Eski apphost (UseAppHost true iken)
taskkill /F /IM BlogApi.exe /T 2>$null | Out-Null

# dotnet run: komut satirinda bu proje klasoru + BlogApi.dll (gecici build klasorlerini oldurme)
$marker = [regex]::Escape((Resolve-Path $PSScriptRoot).Path)
Get-CimInstance Win32_Process -Filter "Name = 'dotnet.exe'" | ForEach-Object {
    $cmd = $_.CommandLine
    if ($null -eq $cmd) { return }
    if ($cmd -notmatch 'BlogApi\.dll') { return }
    if ($cmd -notmatch $marker) { return }
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

exit 0
