// Vigía, recorded on the vigia_pixel emulator with the host webcam as its front camera
// (record/vigia_session.py, then cropped to the 1080×2400 screen and scaled ×2 in public/clips/).
// Times are seconds of that recording; x/y are device pixels (1080×2400).
import type { PhoneProps } from "./PhoneDemo";

const MENU = { x: 95, y: 216 };
const item = (y: number) => ({ x: 341, y });
const HOME = item(387), HISTORY = item(528), SETTINGS = item(670), ACCOUNT = item(812);
const BOTTOM = 2230, PAUSE = { x: 320, y: 2228 }, FINISH = { x: 850, y: 2228 };
const scroll = (t: number, from = 1800, to = 950) => ({ t, x: 540, y: from, to: [540, to] as [number, number], ms: 450 });

export const vigiaFull: PhoneProps = {
  clip: "clips/vigia-full.mp4",
  title: "Vigía",
  tagline: "Drowsiness alerts from your eyes, entirely on the phone",
  platform: "Android · Flutter + Kotlin",
  bg: ["#121019", "#3a3157"],
  accent: "#c4b2ff",
  outro: { github: "https://github.com/JuanRueda08-ucc/mobile-final-interface" },
  segments: [
    { from: 0.2, to: 7.95, rate: 1, chapter: "Prepare a session",
      caption: "Frame your face until camera, face, eyes and eye opening all pass",
      zoom: { x: 540, y: 1250, scale: 1.3, at: 2.4, until: 7.4 } },
    { from: 61.15, to: 80.6, rate: 1, chapter: "Calibrate to your eyes",
      caption: "Look ahead for 8 s, then close your eyes until the beep. A voice guides you, twice",
      zoom: { x: 540, y: 900, scale: 1.45, at: 61.6, until: 80.1 } },
    { from: 80.6, to: 87.6, rate: 1, chapter: "Check the alert tone",
      caption: "Monitoring only starts once you confirm you heard the tone",
      zoom: { x: 540, y: 1150, scale: 1.3, at: 80.9, until: 86.6 } },
    { from: 87.6, to: 99.8, rate: 1, chapter: "Monitor live",
      caption: "Face and eye landmarks run on the device. Close your eyes and the alert fires",
      zoom: { x: 540, y: 950, scale: 1.4, at: 88.6, until: 99.3 } },
    { from: 99.8, to: 109, rate: 1.5, chapter: "Pause and resume",
      caption: "Pausing closes the camera; resuming waits for valid measurements" },
    { from: 109, to: 117.6, rate: 1,
      caption: "Another prolonged eye closure: a tone and a visual alert again",
      zoom: { x: 540, y: 1150, scale: 1.4, at: 109.6, until: 117.1 } },
    { from: 117.6, to: 133.6, rate: 1.25, chapter: "Finish and review",
      caption: "End the session and read its summary: coverage, closures and alerts" },
    { from: 134.8, to: 147.2, rate: 1.25, chapter: "History",
      caption: "Every session is kept. Open one to see its timeline of alerts" },
    { from: 148.4, to: 173.3, rate: 1.3, chapter: "Theme and account",
      caption: "Switch to dark mode. Only summaries sync to the account; images never leave the phone" },
  ],
  taps: [
    { t: 1.05, x: 540, y: 840 }, // Preparar sesión
    { t: 7.9, x: 540, y: BOTTOM }, // Calibrar
    { t: 83.3, x: 242, y: 1371 }, // Probar tono
    { t: 85.85, x: 784, y: 1481 }, // Lo escuché
    { t: 87.15, x: 540, y: BOTTOM }, // Iniciar monitoreo
    { t: 99.9, ...PAUSE },
    { t: 105.5, ...PAUSE }, // Reanudar
    { t: 118.45, ...FINISH },
    { t: 121.2, x: 540, y: 2179 }, // confirm
    scroll(123.7), scroll(128.9), scroll(130.6), scroll(131.7),
    { t: 133.25, x: 540, y: 2038 }, // Volver a inicio
    { t: 135.3, ...MENU }, { t: 136.2, ...HISTORY },
    { t: 138.2, x: 540, y: 1083 }, // newest session
    scroll(140.5), scroll(142.2), scroll(144), scroll(145.6),
    { t: 148.6, ...SETTINGS },
    { t: 150.95, x: 540, y: 663 }, // Oscuro
    { t: 152.6, ...MENU }, { t: 153.7, ...HOME },
    { t: 157.6, ...MENU }, { t: 159.4, ...SETTINGS },
    { t: 160.7, x: 540, y: 520 }, // Claro
    { t: 163.6, ...MENU }, { t: 165.3, ...ACCOUNT },
    scroll(168.5, 1700, 1250),
    { t: 171.6, ...MENU }, { t: 172.6, ...HOME },
  ],
};

/** Hover preview for the project card: the same footage, shorter and a bit faster. */
export const vigia: PhoneProps = {
  ...vigiaFull,
  outro: undefined,
  segments: [
    { from: 0.6, to: 7.95, rate: 1.4, chapter: "Prepare a session", caption: "Frame your face until every check passes",
      zoom: { x: 540, y: 1250, scale: 1.3, at: 2.4, until: 7.5 } },
    { from: 66, to: 80.6, rate: 1.4, chapter: "Calibrate to your eyes", caption: "Close your eyes until the beep, twice",
      zoom: { x: 540, y: 900, scale: 1.45, at: 66.3, until: 80.2 } },
    { from: 89, to: 99.5, rate: 1.1, chapter: "Monitor live", caption: "Close your eyes and the alert fires",
      zoom: { x: 540, y: 950, scale: 1.4, at: 89.3, until: 99.1 } },
    { from: 109.5, to: 116, rate: 1, caption: "A tone and a visual alert, every time",
      zoom: { x: 540, y: 1150, scale: 1.4, at: 109.8, until: 115.7 } },
    { from: 121.3, to: 133.4, rate: 1.6, chapter: "Finish and review", caption: "Coverage, closures and alerts in the summary" },
  ],
};
