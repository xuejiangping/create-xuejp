# 更新README中模版列表

$ErrorActionPreference = 'Stop'

$readmePath = Join-Path $PSScriptRoot '..' 'README.md' | Resolve-Path
$templateRoot = Join-Path $PSScriptRoot '..' 'template' | Resolve-Path
$readme = Get-Content $readmePath -Raw

$templates = Get-ChildItem $templateRoot -Directory |
Where-Object { Test-Path (Join-Path $_.FullName 'README.md') } |
Sort-Object Name

$items = if ($templates.Count -eq 0) {
  '暂无可用模版。'
}
else {
  $templates | ForEach-Object {
    $relativePath = "template/$($_.Name)/README.md"
    "### [$($_.Name)]($relativePath)"
  }
}

$generatedItems = $items -join "`r`n"
$pattern = '(?ms)(<!-- templates:start -->).*?(<!-- templates:end -->)'

if ($readme -notmatch $pattern) {
  throw 'README.md 中找不到 templates:start/templates:end 标记。'
}

$replacement = "`$1`r`n$generatedItems`r`n`$2"
$updatedReadme = [regex]::Replace($readme, $pattern, $replacement)
[System.IO.File]::WriteAllText($readmePath, $updatedReadme)

Write-Output "已更新 README.md 中的模板列表，共 $($templates.Count) 个模版。"