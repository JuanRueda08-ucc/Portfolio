/**
 * WebGL capability check shared by the hero scene and the footer pixel field.
 * Software renderers (SwiftShader, llvmpipe, Microsoft Basic Render…) run WebGL on
 * the CPU and make heavy shaders freeze the page, so we treat them as "no WebGL".
 */
let cache: boolean | null = null;

const SOFTWARE = /swiftshader|llvmpipe|softpipe|basic render|software|mesa offscreen/i;

export function hasFastWebGL(): boolean {
  if (cache !== null) return cache;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return (cache = false);
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    cache = !SOFTWARE.test(renderer);
  } catch {
    cache = false;
  }
  return cache;
}
