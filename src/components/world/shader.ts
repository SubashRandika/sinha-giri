export const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * One full-screen pass. Two scene layers (A, B) each hold a photograph of
 * today and a reconstruction, blended by a material-like mask. Global
 * uniforms (vegetation, fog, warmth, drawing, silhouette, speed) all derive
 * from the same year value on the CPU.
 */
export const fragmentShader = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform sampler2D uA0; uniform sampler2D uA1;
uniform sampler2D uB0; uniform sampler2D uB1;
uniform vec4 uA0fit; uniform vec4 uA1fit; uniform vec4 uB0fit; uniform vec4 uB1fit;
uniform vec3 uAcam; uniform vec3 uBcam;
uniform float uAreveal; uniform float uBreveal;
uniform float uAmode; uniform float uBmode;
uniform float uAmask; uniform float uBmask;
uniform float uMix;

uniform vec2 uExtent;      // visible share of the 16:9 frame at zoom 1
uniform vec2 uRes;
uniform float uTime;
uniform float uFog;
uniform float uWarm;
uniform float uExposure;
uniform float uVeg;
uniform float uDraw;
uniform float uSil;
uniform float uSpeed;
uniform float uDust;
uniform float uClimb;
uniform float uSimple;     // reduced motion: plain crossfades
uniform vec2 uPointer;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

// Screen uv -> plate frame coordinates (x right, y down).
vec2 frameUv(vec2 uv, vec3 cam) {
  vec2 s = vec2(uv.x, 1.0 - uv.y) - 0.5;
  return cam.yz + s * uExtent / cam.x;
}
vec2 texUv(vec2 f, vec4 fit) {
  vec2 t = vec2(f.x, 1.0 - f.y) - 0.5;
  return t * fit.xy + 0.5 + fit.zw;
}

vec3 samplePlate(sampler2D tex, vec4 fit, vec2 f, float ab) {
  vec2 uv = texUv(f, fit);
  if (ab < 0.0005) return texture2D(tex, uv).rgb;
  vec2 dir = (uv - 0.5) * ab;
  return vec3(texture2D(tex, uv + dir).r, texture2D(tex, uv).g, texture2D(tex, uv - dir).b);
}

// Reconstruction mask: 0 = today's photograph, 1 = reconstruction.
float grainField(vec2 f) {
  // Broad patches with fine grain inside them: reads as material, not blobs.
  float n = 0.55 * fbm(f * vec2(5.0, 3.4) + 3.7) + 0.45 * fbm(f * vec2(26.0, 17.0) - 1.3);
  return clamp((n - 0.24) / 0.52, 0.0, 1.0);
}

float accrete(float n, float reveal) {
  return smoothstep(n - 0.05, n + 0.05, reveal * 1.14 - 0.07);
}

float revealMask(vec2 f, float reveal, float mode, out float edge) {
  float n = grainField(f);
  float m;
  if (uSimple > 0.5) { edge = 0.0; return reveal; }
  if (mode < 0.5) {
    // Accretion: material gathers in grains, like plaster setting.
    m = accrete(n, reveal);
  } else if (mode < 1.5) {
    // Rise: built course by course from the ground up.
    float h = 1.0 - f.y + (n - 0.5) * 0.05;
    m = smoothstep(-0.01, 0.01, reveal * 1.12 - 0.04 - h);
  } else {
    // Water: the pools fill from the lowest basin upward; the land above
    // the gardens settles into its older form more quietly.
    float pools = smoothstep(0.58, 0.64, f.y);
    float level = clamp(reveal / 0.75, 0.0, 1.0);
    float h = (1.0 - f.y) / 0.4 + sin(f.x * 90.0 + uTime * 1.6) * 0.004 + (n - 0.5) * 0.04;
    float water = smoothstep(-0.01, 0.01, level * 1.04 - h);
    float land = accrete(n, clamp((reveal - 0.35) / 0.65, 0.0, 1.0));
    m = mix(land, water, pools);
    edge = (1.0 - abs(water * 2.0 - 1.0)) * pools;
    return m;
  }
  edge = 1.0 - abs(m * 2.0 - 1.0);
  return m;
}

float rockHeight(vec2 p) {
  // Exfoliating granite: broad slabs, sharp ridges, fine crystal grain.
  float slabs = fbm(p * 0.9);
  float ridge = 1.0 - abs(fbm(p * vec2(2.2, 1.4) + 7.0) * 2.0 - 1.0);
  float grain = fbm(p * 18.0);
  return slabs * 0.55 + pow(ridge, 3.0) * 0.3 + grain * 0.15;
}

vec3 rockFace(vec2 uv) {
  // The camera climbs the western face with uClimb, lit from the upper left.
  vec2 p = vec2(uv.x * (uRes.x / uRes.y), uv.y) * 2.4 + vec2(0.0, uClimb * 6.0);
  float h = rockHeight(p);
  vec2 e = vec2(0.004, 0.0);
  vec3 n = normalize(vec3(rockHeight(p - e.xy) - rockHeight(p + e.xy), rockHeight(p - e.yx) - rockHeight(p + e.yx), 0.02));
  float light = clamp(dot(n, normalize(vec3(-0.6, 0.55, 0.6))), 0.0, 1.0);

  vec3 grey = vec3(0.52, 0.49, 0.45);
  vec3 orange = vec3(0.66, 0.38, 0.2);
  vec3 stain = vec3(0.12, 0.1, 0.09);
  float warm = smoothstep(0.35, 0.7, fbm(p * 0.6 + 3.0));
  vec3 c = mix(grey, orange, warm);
  // Rain streaks: dark vertical stains running down the face.
  float streak = smoothstep(0.55, 0.8, fbm(vec2(p.x * 7.0, p.y * 0.35)));
  c = mix(c, stain, streak * 0.75);
  // Lichen and moss in the hollows.
  float moss = smoothstep(0.62, 0.75, fbm(p * 3.0 + 9.0)) * (1.0 - h);
  c = mix(c, vec3(0.2, 0.26, 0.14), moss * 0.6);
  c *= 0.35 + 0.95 * light;
  c *= 0.8 + 0.3 * h;
  return c;
}

vec3 renderLayer(sampler2D t0, sampler2D t1, vec4 fit0, vec4 fit1, vec3 cam, float reveal, float mode, float mask, vec2 uv, out float recon) {
  recon = 0.0;
  if (mode > 1.5) return vec3(0.045, 0.034, 0.028);
  if (mode > 0.5) return rockFace(uv);
  vec2 f = frameUv(uv + uPointer * 0.006, cam);
  float ab = uSimple > 0.5 ? 0.0 : clamp(abs(uSpeed) * 0.0035, 0.0, 0.012);
  vec3 today = reveal < 0.999 ? samplePlate(t0, fit0, f, ab) : vec3(0.0);
  vec3 then = reveal > 0.001 ? samplePlate(t1, fit1, f, ab) : vec3(0.0);
  float edge;
  float m = revealMask(f, reveal, mask, edge);
  vec3 c = mix(today, then, m);
  // Plaster dust at the reconstruction front; cool light at the waterline;
  // fired-brick warmth along a course being laid.
  vec3 edgeCol = mask > 1.5 ? vec3(0.7, 0.84, 0.92) : mask > 0.5 ? vec3(0.62, 0.3, 0.16) : vec3(1.0, 0.82, 0.56);
  float edgeAmt = mask > 1.5 ? 0.3 : mask > 0.5 ? 0.35 : 0.1;
  c += edgeCol * edge * edgeAmt * (1.0 - uSimple);
  // Drawing mode: the photograph becomes an ink survey sheet.
  if (uDraw > 0.001) {
    vec2 px = 1.4 / uRes * uExtent / cam.x;
    float l = luma(today);
    float lx = luma(samplePlate(t0, fit0, f + vec2(px.x, 0.0), 0.0)) - luma(samplePlate(t0, fit0, f - vec2(px.x, 0.0), 0.0));
    float ly = luma(samplePlate(t0, fit0, f + vec2(0.0, px.y), 0.0)) - luma(samplePlate(t0, fit0, f - vec2(0.0, px.y), 0.0));
    float ink = smoothstep(0.05, 0.2, length(vec2(lx, ly)));
    vec3 paper = vec3(0.905, 0.885, 0.835) * (0.96 + 0.04 * noise(uv * uRes * 0.5));
    vec3 inked = mix(paper, vec3(0.16, 0.15, 0.13), ink * 0.9);
    inked = mix(inked, paper * vec3(0.93, 0.9, 0.85), (1.0 - smoothstep(0.1, 0.5, l)) * 0.25);
    c = mix(c, inked, uDraw);
  }
  recon = m;
  return c;
}

void main() {
  vec2 uv = vUv;
  float rA, rB;
  vec3 col;
  vec3 cA = uMix < 0.999 ? renderLayer(uA0, uA1, uA0fit, uA1fit, uAcam, uAreveal, uAmode, uAmask, uv, rA) : vec3(0.0);
  vec3 cB = uMix > 0.001 ? renderLayer(uB0, uB1, uB0fit, uB1fit, uBcam, uBreveal, uBmode, uBmask, uv, rB) : vec3(0.0);
  col = mix(cA, cB, uMix);
  // A breath of darkness between scenes, like a dissolve through black.
  col *= 1.0 - 0.35 * sin(3.14159 * uMix);

  // Vegetation: canopy creeps over structures as the forest returns.
  // Anchored to the plate so it grows in place rather than sliding.
  float veg = uVeg * (1.0 - uDraw);
  if (veg > 0.001) {
    vec2 p = frameUv(uv, uMix > 0.5 ? uBcam : uAcam) * vec2(16.0, 9.0);
    float canopy = 0.6 * fbm(p * 0.7 + 11.0) + 0.4 * fbm(p * 3.1);
    float cover = smoothstep(0.66 - veg * 0.26, 0.7 - veg * 0.24, canopy);
    float leafDetail = fbm(p * 7.0);
    vec3 leaf = mix(vec3(0.06, 0.1, 0.05), vec3(0.27, 0.36, 0.15), leafDetail);
    leaf *= 0.75 + 0.5 * smoothstep(0.4, 0.8, fbm(p * 2.0 + 5.0));
    col = mix(col, leaf, cover * veg * 0.62);
    col = mix(col, col * vec3(0.86, 0.96, 0.82), veg * 0.3);
  }

  // Match-cut: the image reduced to a two-tone print, so the shape of
  // the summit carries across the cut while the detail changes.
  if (uSil > 0.001) {
    float l = luma(col);
    vec3 print = mix(vec3(0.05, 0.035, 0.03), vec3(0.86, 0.56, 0.3), smoothstep(0.16, 0.62, l));
    col = mix(col, print, uSil);
  }

  // Warm grade.
  col = mix(col, col * vec3(1.14, 0.98, 0.8) + vec3(0.03, 0.01, 0.0), uWarm);

  // Mist: denser near the ground, drifting slowly.
  if (uFog > 0.001) {
    float drift = fbm(uv * vec2(2.2, 3.2) + vec2(uTime * 0.018, uTime * 0.006));
    float low = smoothstep(1.1, 0.0, uv.y);
    float fog = uFog * clamp(drift * 1.3 * (0.35 + 0.75 * low), 0.0, 1.0);
    col = mix(col, vec3(0.83, 0.8, 0.74), fog);
  }

  // Dust motes catching the light.
  if (uDust > 0.001 && uSimple < 0.5) {
    vec2 g = uv * uRes / 42.0;
    vec2 cell = floor(g + vec2(uTime * 0.12, uTime * 0.05 + uClimb * 20.0));
    vec2 fpos = fract(g + vec2(uTime * 0.12, uTime * 0.05 + uClimb * 20.0));
    float h = hash(cell);
    vec2 center = vec2(hash(cell + 1.3), hash(cell + 7.1));
    float d = length(fpos - center);
    float mote = smoothstep(0.06, 0.0, d) * step(0.93, h) * (0.5 + 0.5 * sin(uTime * 2.0 + h * 40.0));
    col += vec3(1.0, 0.86, 0.6) * mote * uDust * 0.35;
  }

  col *= uExposure;

  // Vignette and grain.
  vec2 q = uv - 0.5;
  col *= 1.0 - dot(q, q) * 0.75;
  float grain = (hash(uv * uRes + fract(uTime * 7.3) * 100.0) - 0.5) * 0.05 * (1.0 - uSimple * 0.6);
  col += grain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
