# Gera plano-fundacao.pdf a partir de plano-fundacao.html usando o Microsoft Edge (ou Chrome) em modo headless.
# Uso: powershell -ExecutionPolicy Bypass -File .\gerar-pdf.ps1
$ErrorActionPreference = 'Stop'
$pasta = $PSScriptRoot
$origem = Join-Path $pasta 'plano-fundacao.html'
$temp = Join-Path $env:TEMP 'plano-fundacao-print.html'
$saida = Join-Path $pasta 'plano-fundacao.pdf'

# O HTML publicado não tem esqueleto próprio; adiciona doctype e charset para renderizar igual à página.
$conteudo = Get-Content $origem -Raw -Encoding UTF8
$html = "<!doctype html><html lang=`"pt-BR`" data-theme=`"light`"><head><meta charset=`"utf-8`"></head><body>$conteudo</body></html>"
[IO.File]::WriteAllText($temp, $html, (New-Object Text.UTF8Encoding $false))

$navegadores = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
)
$exe = $navegadores | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $exe) { throw 'Edge ou Chrome não encontrado.' }

$url = ([Uri]$temp).AbsoluteUri
& $exe --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=5000 "--print-to-pdf=$saida" $url | Out-Null
Start-Sleep -Seconds 2
Remove-Item $temp -ErrorAction SilentlyContinue
if (Test-Path $saida) { Write-Output "PDF gerado: $saida" } else { throw 'Falha ao gerar o PDF.' }
