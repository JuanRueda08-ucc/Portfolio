# Use an isolated checkout of the game (2f412f5) and its Godot 4.7.2 editor.
param(
  [Parameter(Mandatory)][string]$GameCheckout,
  [Parameter(Mandatory)][string]$Godot,
  [Parameter(Mandatory)][string]$Ffmpeg,
  [ValidateSet("action", "turns")][string[]]$Modes = @("action", "turns")
)
$ErrorActionPreference = 'Stop'
$rawPath = (Resolve-Path (Join-Path $PSScriptRoot '../raw')).Path
$gamePath = (Resolve-Path $GameCheckout).Path
$env:APPDATA = (New-Item -Force -ItemType Directory (Join-Path $rawPath 'ecos-profile')).FullName
Copy-Item (Join-Path $PSScriptRoot 'ecos-walkthrough.gd') (Join-Path $gamePath 'tools/portfolio.gd')
@"
[gd_scene load_steps=2 format=3]
[ext_resource type="Script" path="res://tools/portfolio.gd" id="1"]
[node name="Recording" type="Node"]
script = ExtResource("1")
"@ | Set-Content -Encoding utf8 (Join-Path $gamePath 'tools/portfolio.tscn')
& $Godot --headless --path $gamePath --import *> (Join-Path $rawPath 'ecos-import.log')
if ($LASTEXITCODE) { throw 'Godot asset import failed' }
foreach ($mode in $Modes) {
  $extra = @()
  if ($mode -eq 'turns') { $extra = @('--', '--turns') }
  $movie = Join-Path $rawPath "ecos-$mode.avi"
  $log = Join-Path $rawPath "ecos-$mode.log"
  & $Godot --path $gamePath --audio-driver Dummy --resolution 640x360 --windowed --fixed-fps 30 --write-movie $movie --quit-after 30100 res://tools/portfolio.tscn @extra *> $log
  if ($LASTEXITCODE -or !(Select-String -Path $log -Pattern '^CHAPTER .* End$' -Quiet)) { throw "Incomplete $mode run. See $log" }
  & $Ffmpeg -v error -y -i $movie -an -c:v libx264 -threads 3 -preset fast -crf 15 -pix_fmt yuv420p (Join-Path $rawPath "ecos-$mode.mp4")
  if ($LASTEXITCODE) { throw "Cannot encode $movie" }
}
$partsFile = Join-Path $rawPath 'ecos-combine.txt'
@("file 'ecos-action.mp4'", "file 'ecos-turns.mp4'") | Set-Content -Encoding ascii $partsFile
$clip = Join-Path $PSScriptRoot '../public/clips/ecos-de-la-tierra-full.mp4'
if ((Test-Path (Join-Path $rawPath 'ecos-action.mp4')) -and (Test-Path (Join-Path $rawPath 'ecos-turns.mp4'))) {
  & $Ffmpeg -v error -y -f concat -safe 0 -i $partsFile -an -c copy $clip
  if ($LASTEXITCODE) { throw 'Cannot join the gameplay recordings' }
}
