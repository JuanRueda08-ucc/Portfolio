"""Record a whole Vigía session driven by the owner on the vigia_pixel emulator.

    python record/vigia_session.py full

Records the emulator window from the desktop (no 3-minute limit, no cost to the
emulator), every touch (getevent; mouse clicks in the emulator window count) and
the engine log, until Enter is pressed. Keep the emulator window still and visible.
Writes raw/vigia-<name>.mp4 and raw/vigia-<name>.json:
{"taps": [{t, x, y, up}], "engine": [{t, line}]}, times in seconds from the
start of the recording, coordinates in screen pixels (1080×2400).
"""
import json
import re
import subprocess
import sys
import threading
import time
from pathlib import Path

import emu_window

FFMPEG = ("C:/Users/Edwin Rueda/AppData/Local/Microsoft/WinGet/Packages/"
          "Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-essentials_build/bin/ffmpeg.exe")
ADB ="D:/dev/android-sdk/platform-tools/adb.exe"
RAW = Path(__file__).resolve().parent.parent / "raw"
W, H, MAX = 1080, 2400, 32767


def adb(*args):
    return subprocess.run([ADB, *args], capture_output=True, text=True, encoding="utf-8", errors="replace").stdout


def status_bar():
    adb("shell", "settings", "put", "global", "sysui_demo_allowed", "1")
    demo = ["shell", "am", "broadcast", "-a", "com.android.systemui.demo", "-e", "command"]
    for extra in (["enter"], ["clock", "-e", "hhmm", "0941"], ["battery", "-e", "level", "100", "-e", "plugged", "false"],
                  ["network", "-e", "wifi", "show", "-e", "level", "4", "-e", "fully", "true"],
                  ["network", "-e", "mobile", "hide"], ["notifications", "-e", "visible", "false"]):
        adb(*demo, *extra)


def main(name):
    movie = RAW / f"vigia-{name}.mp4"
    taps, engine = [], []
    status_bar()
    adb("logcat", "-c")
    # The emulator's own recorder (and on-device screenrecord) took ~30 % of the frames the app analyses, so
    # calibration failed while recording. Capture the emulator window from the desktop instead (Desktop
    # Duplication + Intel Quick Sync): it costs the emulator nothing measurable.
    hwnd = emu_window.find()
    emu_window.pin(hwnd)
    x, y, w, h = emu_window.rect(hwnd)
    w, h = w // 2 * 2, h // 2 * 2
    grab = subprocess.Popen(
        [FFMPEG, "-v", "error", "-y", "-f", "lavfi", "-i",
         f"ddagrab=output_idx=0:framerate=30:draw_mouse=0:offset_x={x}:offset_y={y}:video_size={w}x{h},hwdownload,format=bgra,format=nv12",
         # Fragmented MP4: the file stays playable even if the process is killed.
         "-c:v", "h264_qsv", "-global_quality", "18", "-movflags", "+frag_keyframe+empty_moov", str(movie)],
        stdin=subprocess.PIPE)
    t0 = time.time()
    stamp = lambda: round(time.time() - t0, 3)

    # -t: a pty, otherwise getevent buffers its output and the touches arrive late or never.
    touch = subprocess.Popen([ADB, "shell", "-t", "-t", "getevent", "-l"], stdout=subprocess.PIPE, text=True, bufsize=1)
    log = subprocess.Popen([ADB, "logcat", "-v", "time", "-s", "VigiaMonitoring:I"], stdout=subprocess.PIPE,
                           text=True, encoding="utf-8", errors="replace", bufsize=1)

    def read_touch():
        x = y = None
        down = None
        for line in touch.stdout:
            if "ABS_MT_POSITION_X" in line:
                x = int(line.split()[-1], 16) * W // MAX
            elif "ABS_MT_POSITION_Y" in line:
                y = int(line.split()[-1], 16) * H // MAX
            # The emulator's virtio multitouch sends no BTN_TOUCH: a tracking id starts a touch, ffffffff ends it.
            elif "ABS_MT_TRACKING_ID" in line and not line.rstrip().endswith("ffffffff"):
                down = stamp()
            elif "ABS_MT_TRACKING_ID" in line and down is not None:
                taps.append({"t": down, "x": x, "y": y, "up": stamp()})
                print(f"  toque {len(taps)} en {down:.1f}s ({x}, {y})", flush=True)
                down = None

    def read_log():
        for line in log.stdout:
            if "VigiaMonitoring" in line:
                engine.append({"t": stamp(), "line": line.strip()[:400]})
                m = re.search(r"calibración=(\w+).*?sesión=(\w+).*?señal=(\w+)", line)
                if m:
                    print(f"  motor {stamp():.0f}s: calibración={m[1]} sesión={m[2]} señal={m[3]}", flush=True)

    out = RAW / f"vigia-{name}.json"

    def save():  # after every event, so nothing is lost if the tab is closed
        out.write_text(json.dumps({"taps": taps, "engine": engine}, indent=1, ensure_ascii=False), encoding="utf-8")

    def autosave():
        while True:
            time.sleep(2)
            save()

    threading.Thread(target=autosave, daemon=True).start()
    for fn in (read_touch, read_log):
        threading.Thread(target=fn, daemon=True).start()

    print("\nGRABANDO. Haz todo el recorrido a tu ritmo. Cuando termines, vuelve aquí y presiona Enter.\n", flush=True)
    try:
        input()
    finally:
        grab.communicate(b"q", timeout=30)
        emu_window.unpin(hwnd)
        touch.kill()
        log.kill()
        time.sleep(3)
        save()
        print(f"Listo: {movie.name} ({stamp():.0f}s), {len(taps)} toques, {len(engine)} eventos del motor.", flush=True)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "full")
