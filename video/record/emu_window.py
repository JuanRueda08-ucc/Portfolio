"""Find, enlarge and pin the emulator window; return its rectangle in physical pixels (for ddagrab)."""
import ctypes
from ctypes import wintypes

user32 = ctypes.windll.user32
dwm = ctypes.windll.dwmapi
user32.SetProcessDPIAware()


def find(title="Android Emulator - vigia_pixel"):
    found = []

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def each(hwnd, _):
        buf = ctypes.create_unicode_buffer(256)
        user32.GetWindowTextW(hwnd, buf, 256)
        if user32.IsWindowVisible(hwnd) and buf.value.startswith(title):
            found.append(hwnd)
        return True

    user32.EnumWindows(each, 0)
    if not found:
        raise RuntimeError("Emulator window not found")
    return found[0]


def rect(hwnd):
    r = wintypes.RECT()
    dwm.DwmGetWindowAttribute(hwnd, 9, ctypes.byref(r), ctypes.sizeof(r))  # visible frame, no shadow
    return r.left, r.top, r.right - r.left, r.bottom - r.top


def pin(hwnd, height=None, top=0):
    """Keep the window above the others; optionally resize it (Qt rescales the device)."""
    x, y, w, h = rect(hwnd)
    flags = 0x0040  # SWP_SHOWWINDOW
    if height:
        w = round(w * height / h)
        h, y = height, top
    else:
        flags |= 0x0001  # SWP_NOSIZE
    user32.SetWindowPos(hwnd, -1, x, y, w, h, flags)  # HWND_TOPMOST


def unpin(hwnd):
    user32.SetWindowPos(hwnd, -2, 0, 0, 0, 0, 0x0001 | 0x0002 | 0x0040)  # HWND_NOTOPMOST, keep size/pos


if __name__ == "__main__":
    import sys
    hwnd = find()
    if len(sys.argv) > 1:
        pin(hwnd, int(sys.argv[1]))
    print(rect(hwnd))
