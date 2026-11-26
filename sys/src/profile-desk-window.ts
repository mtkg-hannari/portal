import type { DeskLighting } from "./profile-desk-themes";
import type { DeskView } from "./profile-desk-views";

const width = 320;
const height = 224;
const outdoorObjectScale = 0.2;
const birdStroke = 2;
const birdDuration = 10_400;
const meteorTravel = 450;
const meteorFadeStart = 0.6;
const birdFlock = [
  { offsetX: -6, offsetY: 0, size: 0.96, phase: 0 },
  { offsetX: 2, offsetY: 3.8, size: 0.81, phase: 1.8 },
  { offsetX: 7, offsetY: -4.2, size: 0.7, phase: 3.4 },
];
// Increasing X in the side window moves the projected light to the left on the back wall.
const meteorPasses = [
  { delay: 0, startX: 0.055, startY: 0.19, endY: 0.293, size: 1 },
  { delay: 1300, startX: 0.063, startY: 0.15, endY: 0.253, size: 0.84 },
  { delay: 2850, startX: 0.051, startY: 0.24, endY: 0.306, size: 0.9 },
  { delay: 4250, startX: 0.070, startY: 0.23, endY: 0.275, size: 0.78 },
];
// Keep the fade inside the continuous patch of window light for each angle.
const meteorLeftEdge: Record<DeskView, number> = { left: 0.182, front: 0.15, standard: 0.218, right: 0.218 };

function createMeteorPaths(view: DeskView) {
  const firstBand = Math.floor(Math.random() * meteorPasses.length);
  const center = 0.125;
  return meteorPasses.map((meteor, index) => {
    const position = ((firstBand + index) % meteorPasses.length + Math.random()) / meteorPasses.length;
    return { ...meteor, endX: width * (center + (meteorLeftEdge[view] - center) * position) };
  });
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

export function createDeskWindowMotion(onPaint: () => void, getView: () => DeskView) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const brush = ctx;
  let mode: DeskLighting = "day";
  let running = false;
  let wait = 0;
  let frame = 0;

  function clear() {
    brush.clearRect(0, 0, width, height);
    onPaint();
  }

  function paintFlock(elapsed: number) {
    const progress = elapsed / birdDuration;
    const margin = 17;
    const x = width + margin - (width + 2 * margin) * progress;
    const y = height * (0.10 + progress * 0.12) - Math.sin(progress * Math.PI) * 5
      + Math.sin(elapsed / 820) * 2.2;
    for (const bird of birdFlock) {
      const drift = elapsed / 570 + bird.phase;
      paintBird(
        x + bird.offsetX + Math.sin(drift) * 1.1,
        y + bird.offsetY + Math.sin(drift + 0.8) * 1.4,
        Math.sin(elapsed / 160 + bird.phase),
        bird.size,
      );
    }
  }

  function paintBird(x: number, y: number, flap: number, relativeSize: number) {
    const farWing = -8.5 - 3.2 * flap;
    const nearWing = 5.6 + 2.6 * flap;
    const size = relativeSize * outdoorObjectScale;
    brush.save();
    brush.translate(x, y);
    brush.rotate(-0.13 + flap * 0.16);
    brush.scale(size, size);
    brush.globalAlpha = 1;
    brush.fillStyle = "#202538";
    brush.strokeStyle = brush.fillStyle;
    brush.lineWidth = birdStroke / size;
    brush.lineJoin = "round";
    brush.beginPath();
    brush.moveTo(-8.4, 0.3);
    brush.quadraticCurveTo(-7.2, -0.1, -6.7, -1.1);
    brush.quadraticCurveTo(-5.6, -2.8, -3.9, -1.7);
    brush.bezierCurveTo(-2.8, -3, -0.6, farWing - 1, 4.8, farWing);
    brush.bezierCurveTo(2.6, farWing + 1.2, 1.1, -3.3, 1.7, -1);
    brush.quadraticCurveTo(4.5, -0.6, 8.6, -2.1);
    brush.lineTo(6, 0);
    brush.lineTo(8.6, 2.2);
    brush.quadraticCurveTo(4.7, 1.1, 1.6, 1.45);
    brush.bezierCurveTo(1.3, 3.1, 2.8, nearWing - 1.2, 4.8, nearWing);
    brush.bezierCurveTo(1.3, nearWing + 0.35, -2.9, 3, -3.4, 1);
    brush.quadraticCurveTo(-5.6, 1.6, -6.7, 0.6);
    brush.closePath();
    brush.fill();
    // Keep the wing edges visible when the silhouette spans only a few texture pixels.
    brush.stroke();
    brush.restore();
  }

  function paintMeteor(elapsed: number, meteor: ReturnType<typeof createMeteorPaths>[number]) {
    const age = elapsed - meteor.delay;
    if (age < 0 || age >= meteorTravel) return;
    const startX = width * meteor.startX;
    const startY = height * meteor.startY;
    const endY = height * meteor.endY;
    const size = meteor.size * outdoorObjectScale;
    const radius = 1.15 + 0.3 * meteor.size;
    const t = age / meteorTravel;
    const progress = 0.35 * t + 0.65 * smoothstep(t);
    const fade = Math.max(0, (t - meteorFadeStart) / (1 - meteorFadeStart));

    brush.save();
    brush.globalAlpha = 1 - smoothstep(fade);
    brush.translate(startX + (meteor.endX - startX) * progress, startY + (endY - startY) * progress);
    brush.rotate(Math.atan2(endY - startY, meteor.endX - startX));
    const length = Math.max(1.85, Math.min(12, 3 + (1 - progress) * 60) * size);
    const trail = brush.createLinearGradient(-length, 0, 0, 0);
    trail.addColorStop(0, "transparent");
    trail.addColorStop(1, "white");
    brush.strokeStyle = trail;
    brush.lineWidth = 1.13 * radius;
    brush.lineCap = "round";
    brush.beginPath();
    brush.moveTo(-length, 0);
    brush.lineTo(0, 0);
    brush.stroke();
    brush.fillStyle = "white";
    brush.beginPath();
    brush.arc(0, 0, radius, 0, 2 * Math.PI);
    brush.fill();
    brush.restore();
  }

  function play() {
    const night = mode === "night";
    const meteors = night ? createMeteorPaths(getView()) : [];
    const duration = night
      ? Math.max(...meteors.map(({ delay }) => delay)) + meteorTravel
      : birdDuration;
    let started: number | undefined;
    let lastPaint = -Infinity;
    function step(now: number) {
      started ??= now;
      const elapsed = now - started;
      if (elapsed >= duration) {
        frame = 0;
        clear();
        wait = window.setTimeout(play, night ? 5000 : 1500);
        return;
      }
      if (now - lastPaint >= 30) {
        lastPaint = now;
        brush.clearRect(0, 0, width, height);
        if (night) {
          for (const meteor of meteors) paintMeteor(elapsed, meteor);
        } else {
          paintFlock(elapsed);
        }
        onPaint();
      }
      frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
  }

  return {
    canvas,
    setPlayback(active: boolean, lighting: DeskLighting) {
      if (active === running && lighting === mode) return;
      mode = lighting;
      running = active;
      window.clearTimeout(wait);
      cancelAnimationFrame(frame);
      clear();
      if (active) wait = window.setTimeout(play, 900);
    },
    readPixels() {
      return brush.getImageData(0, 0, width, height).data;
    },
  };
}

export function createDeskLightOverlay(canvas: HTMLCanvasElement, urls: Record<DeskView, string>) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const brush = context;
  type Projection = { pixels: Uint32Array; samples: Uint32Array; strengths: Uint8Array; image: ImageData };
  const cache = new Map<DeskView, Promise<Projection | undefined>>();
  let view: DeskView | undefined;
  let active: Projection | undefined;

  function load(next: DeskView) {
    return new Promise<Projection | undefined>((resolve) => {
      const map = new Image();
      map.onload = () => {
        const scratch = document.createElement("canvas");
        scratch.width = map.naturalWidth;
        scratch.height = map.naturalHeight;
        const source = scratch.getContext("2d");
        if (!source) return resolve(undefined);
        source.drawImage(map, 0, 0);
        const data = source.getImageData(0, 0, scratch.width, scratch.height).data;
        const offsets: number[] = [];
        const samples: number[] = [];
        const strengths: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 2] === 0) continue;
          const u = Math.round(data[i] * (width - 1) / 255);
          const v = Math.round(data[i + 1] * (height - 1) / 255);
          offsets.push(i);
          samples.push((v * width + u) * 4 + 3);
          strengths.push(data[i + 2]);
        }
        resolve({
          pixels: Uint32Array.from(offsets), samples: Uint32Array.from(samples), strengths: Uint8Array.from(strengths),
          image: brush.createImageData(scratch.width, scratch.height),
        });
      };
      map.onerror = () => resolve(undefined);
      map.src = urls[next];
    });
  }

  return {
    select(next?: DeskView) {
      if (view === next) return;
      view = next;
      active = undefined;
      brush.clearRect(0, 0, canvas.width, canvas.height);
      canvas.hidden = true;
      if (!next) return;
      const pending = cache.get(next) ?? load(next);
      cache.set(next, pending);
      void pending.then((projection) => {
        if (view !== next || !projection) return;
        active = projection;
        canvas.width = projection.image.width;
        canvas.height = projection.image.height;
        canvas.hidden = false;
      });
    },
    draw(mode: DeskLighting, motion: Uint8ClampedArray) {
      if (!active) return;
      const { pixels, samples, strengths, image } = active;
      const night = mode === "night";
      const [r, g, b] = night ? [176, 204, 255] : [31, 37, 54];
      for (let index = 0; index < pixels.length; index++) {
        const offset = pixels[index];
        image.data[offset] = r;
        image.data[offset + 1] = g;
        image.data[offset + 2] = b;
        image.data[offset + 3] = motion[samples[index]] * strengths[index] / 255 * (night ? 1 : 1.2);
      }
      brush.putImageData(image, 0, 0);
    },
  };
}
