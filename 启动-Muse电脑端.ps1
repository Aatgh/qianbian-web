$ErrorActionPreference = "Stop"

$root = Join-Path $PSScriptRoot "muse-desktop"
$url = "http://127.0.0.1:3101"

if (!(Test-Path -LiteralPath (Join-Path $root "web\dist\index.html"))) {
  throw "OpenMuse 尚未构建，请先运行：npm --prefix muse-desktop/web run build"
}

$running = $false
try {
  $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2
  $running = $response.StatusCode -eq 200
} catch {
  $running = $false
}

if (!$running) {
  $env:OPENMUSE_MOCK = "1"
  $env:PORT = "3101"
  $env:HOST = "127.0.0.1"
  Start-Process `
    -FilePath "node" `
    -ArgumentList "server/src/index.js" `
    -WorkingDirectory $root `
    -WindowStyle Hidden

  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 250
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        $running = $true
        break
      }
    } catch {
      continue
    }
  }
}

if (!$running) {
  throw "OpenMuse 启动失败，请检查 node 与端口 3101。"
}

Start-Process -FilePath $url
Write-Output "OpenMuse 已启动：$url"
