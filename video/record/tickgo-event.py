"""Record event creation in a throwaway Wear OS emulator, before the project's own demo."""
from pathlib import Path
from contextlib import contextmanager
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

ADB = ["D:/dev/android-sdk/platform-tools/adb.exe", "-s", "emulator-5582"]


def adb(*args):
    return subprocess.check_output([*ADB, *args]).decode("utf-8").strip()


def nodes():
    adb("shell", "uiautomator", "dump", "/sdcard/portfolio-window.xml")
    root = ET.fromstring(adb("shell", "cat", "/sdcard/portfolio-window.xml"))
    return [item.attrib for item in root.iter("node")]


def tap(label):
    for attempt in range(16):
        items = nodes()
        for item in items:
            if any(label.casefold() == item[key].strip("«»").casefold() for key in ("text", "content-desc")):
                x1, y1, x2, y2 = map(int, re.findall(r"\d+", item["bounds"]))
                adb("shell", "input", "tap", str((x1 + x2) // 2), str((y1 + y2) // 2))
                time.sleep(1)
                return
        if attempt < 15:
            adb("shell", "input", "swipe", "225", "330", "225", "140", "500")
    raise RuntimeError(f"Missing {label}: {[i['text'] for i in items if i['text']]}")


@contextmanager
def screenrecord(name):
    movie = f"/sdcard/portfolio-{name}.mp4"
    recorder = subprocess.Popen([*ADB, "shell", "screenrecord", "--bit-rate", "4000000",
                                 "--time-limit", "170", movie])
    try:
        yield
    finally:
        pid = adb("shell", "pidof", "screenrecord")
        if pid.isdigit():
            adb("shell", "kill", "-2", pid)
        recorder.wait(timeout=20)
        adb("pull", movie, str(Path("raw") / f"tickgo-{name}.mp4"))


def record_event():
    adb("shell", "pm", "grant", "com.atiempo.wear", "android.permission.POST_NOTIFICATIONS")
    adb("shell", "input", "keyevent", "KEYCODE_WAKEUP")
    adb("shell", "wm", "dismiss-keyguard")
    adb("shell", "svc", "power", "stayon", "true")
    adb("shell", "settings", "put", "system", "screen_off_timeout", "600000")
    adb("shell", "input", "keyevent", "4")
    adb("shell", "input", "keyevent", "KEYCODE_HOME")
    adb("shell", "am", "start", "-W", "-f", "268468224", "-a", "android.intent.action.MAIN", "-c", "android.intent.category.LAUNCHER", "-n", "com.atiempo.wear/.MainActivity")
    time.sleep(2)
    items = nodes()
    if any(i["text"] == "Allow" for i in items):
        tap("Allow")
    with screenrecord("event"):
        time.sleep(2)
        print("Opening the event list", flush=True)
        tap("Ver eventos")
        print("Starting event creation", flush=True)
        tap("Nuevo evento")
        time.sleep(1)
        tap("Clase de cálculo mañana a las 7")
        time.sleep(3)
        tap("Guardar")
        time.sleep(3)
        if not any(i["text"] in ("Guardado", "Nuevo evento", "Eventos") for i in nodes()):
            raise RuntimeError("The app did not confirm the event")
        print("Event saved", flush=True)


def record_routine():
    with screenrecord("routines"):
        tap("Rutinas")
        tap("Clase")
        tap("Más minutos")
        time.sleep(3)
        adb("shell", "input", "keyevent", "4")
        time.sleep(2)


if __name__ == "__main__":
    if adb("emu", "avd", "name").splitlines()[0] != "Portfolio_Watch":
        raise RuntimeError("Expected the dedicated portfolio emulator")
    if "--routines" in sys.argv:
        record_routine()
    else:
        record_event()
