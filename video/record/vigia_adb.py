"""Small ADB helpers for the Vigía emulator (vigia_pixel, front camera = host webcam).

    python record/vigia_adb.py dump          # list the labels on screen with their bounds
    python record/vigia_adb.py tap "Label"   # tap an element by its text/description
    python record/vigia_adb.py shot name     # save raw/vigia-<name>.png
"""
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from pathlib import Path

SERIAL = "emulator-5554"
ADB = ["D:/dev/android-sdk/platform-tools/adb.exe", "-s", SERIAL]
RAW = Path(__file__).resolve().parent.parent / "raw"


def adb(*args, text=True):
    out = subprocess.check_output([*ADB, *args])
    return out.decode("utf-8", "replace").strip() if text else out


def nodes():
    # A live camera preview can keep the UI from going idle; never read a stale dump.
    for _ in range(4):
        adb("shell", "rm", "-f", "/sdcard/vigia-window.xml")
        out = subprocess.run([*ADB, "shell", "uiautomator", "dump", "/sdcard/vigia-window.xml"],
                             capture_output=True, text=True).stdout
        if "dumped to" in out:
            break
        time.sleep(0.3)
    else:
        return []
    root = ET.fromstring(adb("shell", "cat", "/sdcard/vigia-window.xml"))
    found = []
    for node in root.iter("node"):
        a = node.attrib
        label = (a.get("text") or a.get("content-desc") or "").strip().replace("\n", " | ")
        x1, y1, x2, y2 = map(int, re.findall(r"-?\d+", a["bounds"]))
        found.append({"label": label, "box": (x1, y1, x2, y2), "clickable": a.get("clickable") == "true"})
    return found


def find(label, exact=False):
    want = label.casefold()
    for n in nodes():
        have = n["label"].casefold()
        if (have == want) if exact else (have == want or have.startswith(want)):
            return n
    return None


def center(n):
    x1, y1, x2, y2 = n["box"]
    return (x1 + x2) // 2, (y1 + y2) // 2


def tap_xy(x, y):
    adb("shell", "input", "tap", str(x), str(y))


def shot(name):
    RAW.mkdir(exist_ok=True)
    (RAW / f"vigia-{name}.png").write_bytes(adb("exec-out", "screencap", "-p", text=False))


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "dump":
        for n in nodes():
            if n["label"] or n["clickable"]:
                print(n["box"], "C" if n["clickable"] else " ", n["label"].replace("\n", " | ")[:100])
    elif cmd == "tap":
        n = find(sys.argv[2])
        if not n:
            sys.exit(f"Missing {sys.argv[2]!r}")
        tap_xy(*center(n))
        time.sleep(1.2)
    elif cmd == "shot":
        shot(sys.argv[2])
