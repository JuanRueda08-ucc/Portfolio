/**
 * Converts a font file into the three.js "typeface.json" format used by
 * drei's <Text3D>. Only the glyphs we need are exported to keep it small.
 *
 * Usage: node scripts/build-typeface.mjs <input.woff|ttf|otf> <output.json>
 */
import { readFileSync, writeFileSync } from "node:fs";
import opentype from "opentype.js";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node scripts/build-typeface.mjs <font> <out.json>");
  process.exit(1);
}

const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.,'-¡¿ ";
const RESOLUTION = 1000;

const buffer = readFileSync(input);
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
const scale = RESOLUTION / font.unitsPerEm;
const r = (n) => Math.round(n * scale);

const glyphs = {};
for (const ch of CHARS) {
  const glyph = font.charToGlyph(ch);
  if (!glyph || glyph.unicode === undefined) continue;
  const cmds = [];
  for (const c of glyph.path.commands) {
    // three.js typeface format: quadratic/cubic list the END point first.
    if (c.type === "M") cmds.push(`m ${r(c.x)} ${r(c.y)}`);
    else if (c.type === "L") cmds.push(`l ${r(c.x)} ${r(c.y)}`);
    else if (c.type === "Q") cmds.push(`q ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)}`);
    else if (c.type === "C") cmds.push(`b ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)}`);
    // "Z" (close path) is implicit in the format.
  }
  const bbox = glyph.getBoundingBox();
  glyphs[ch] = {
    ha: r(glyph.advanceWidth ?? 0),
    x_min: r(bbox.x1),
    x_max: r(bbox.x2),
    o: cmds.join(" "),
  };
}

const json = {
  glyphs,
  familyName: font.names.fontFamily?.en ?? "Font",
  ascender: r(font.ascender),
  descender: r(font.descender),
  underlinePosition: r(font.tables.post?.underlinePosition ?? -100),
  underlineThickness: r(font.tables.post?.underlineThickness ?? 50),
  boundingBox: {
    xMin: r(font.tables.head.xMin),
    yMin: r(font.tables.head.yMin),
    xMax: r(font.tables.head.xMax),
    yMax: r(font.tables.head.yMax),
  },
  resolution: RESOLUTION,
  original_font_information: { format: 0, fontFamily: font.names.fontFamily?.en ?? "Font" },
};

writeFileSync(output, JSON.stringify(json));
console.log(`Wrote ${Object.keys(glyphs).length} glyphs → ${output}`);
