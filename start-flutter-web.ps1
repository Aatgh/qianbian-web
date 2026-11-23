param(
  [int]$Port = 4174
)

$demoRoot = Join-Path $PSScriptRoot "output\flutter-web-demo"
if (-not (Test-Path $demoRoot)) {
  throw "Flutter Web build not found: $demoRoot"
}

Set-Location $demoRoot
python -m http.server $Port --bind 127.0.0.1
