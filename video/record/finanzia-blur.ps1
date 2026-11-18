# FinanzIA: the owner's screen recording → cropped, 3× faster, account email blurred.
# This is how public/videos/finanzia.mp4 was made. Blur boxes are in OUTPUT pixels (1280 wide)
# and OUTPUT seconds at 3×; if you change the speed, scale the times (t_out = t_source / speed).
#   - greeting "Hola, <email>": 400×44 at (560,279), on screen 2.76–4.10, 10.30–15.94, 44.26–44.94, ≥ 63.8 s
#   - user card (bottom-left): 110×32 at (36,588), always
#   - login email field: 262×38 at (146,282), before 2.9 s
# Source: 1916×1034; browser bar is y 0–37, Windows taskbar starts at y 988.
param(
  [string]$In = "D:\Downloads\WhatsApp Video 2026-11-17 at 2.47.25 PM.mp4",
  [string]$Out = "..\public\videos\finanzia.mp4"
)
$ffmpeg = "C:/Users/Edwin Rueda/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-essentials_build/bin/ffmpeg.exe"
$B = "boxblur=luma_radius=10:luma_power=3:chroma_radius=5:chroma_power=3"
$graph = "[0:v]crop=1916:950:0:38,setpts=PTS/3,fps=30,scale=1280:-2:flags=lanczos,split=4[base][a][b][c];" +
  "[a]crop=400:44:560:279,$B[ha];[b]crop=110:32:36:588,$B[sa];[c]crop=262:38:146:282,$B[la];" +
  "[base][ha]overlay=560:279:enable='between(t,2.76,4.10)+between(t,10.30,15.94)+between(t,44.26,44.94)+gte(t,63.8)'[v1];" +
  "[v1][sa]overlay=36:588[v2];[v2][la]overlay=146:282:enable='lt(t,2.9)'[out]"
& $ffmpeg -v error -y -i $In -an -filter_complex $graph -map "[out]" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart $Out
