import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import { BackSide, MathUtils, Matrix3, Matrix4, Vector3 } from "three";
import { createDeskScene, deskLamp, deskLampFalloff, deskPaintMultiplier, deskWindow } from "../src/profile-desk.ts";
import { defaultDeskTheme, deskLightingModes, deskThemeNames } from "../src/profile-desk-themes.ts";
import { deskPosterFilename, deskViews } from "../src/profile-desk-views.ts";

// Rasterize the same room offline so the WebP views also work without WebGL.
// The renderer only needs the opaque, untextured meshes used by this scene.
const width = 1440;
const height = 810;
const desk = createDeskScene();
desk.resize(width, height);
const dayLandscape = fileURLToPath(new URL("../src/assets/images/profile-desk-countryside.webp", import.meta.url));
const nightLandscape = fileURLToPath(new URL("../src/assets/images/profile-desk-countryside-night.webp", import.meta.url));
const skyLayer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="760" height="536" viewBox="0 0 760 536">
  <defs>
    <linearGradient id="sky" x2="0" y2="1">
      <stop stop-color="#131c42"/><stop offset=".23" stop-color="#303d71"/>
      <stop offset=".43" stop-color="#23335d" stop-opacity="0"/>
    </linearGradient>
    <mask id="crescent"><circle cx="618" cy="85" r="26" fill="white"/>
      <circle cx="629" cy="73" r="25" fill="black"/></mask>
  </defs>
  <path fill="url(#sky)" d="M0 0h760v536H0z"/>
  <circle cx="618" cy="85" r="26" fill="#fff1ce" mask="url(#crescent)"/>
  <g fill="#fae9ce">
    <circle cx="89" cy="66" r="2.6"/><circle cx="153" cy="122" r="1.8"/>
    <circle cx="202" cy="43" r="2"/><circle cx="275" cy="91" r="3.2"/>
    <circle cx="351" cy="56" r="2"/><circle cx="394" cy="128" r="2.4"/>
    <circle cx="442" cy="42" r="2.8"/><circle cx="518" cy="97" r="2"/>
    <circle cx="557" cy="57" r="2.5"/><circle cx="684" cy="131" r="2"/>
    <circle cx="713" cy="58" r="3"/>
  </g>
</svg>`);
const dimLandscape = await sharp(dayLandscape).resize(760, 536).linear([0.31, 0.37, 0.49], [0, 0, 7]).png().toBuffer();
await sharp(dimLandscape).composite([{ input: skyLayer }]).webp({ quality: 88 }).toFile(nightLandscape);
const landscapes = {
  day: await readLandscape(dayLandscape),
  night: await readLandscape(nightLandscape),
};

function readLandscape(path) {
  return sharp(path).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
}
const sun = desk.scene.children.find((object) => object.isDirectionalLight);
const fill = desk.scene.children.find((object) => object.isHemisphereLight);
const direction = sun.position.clone().normalize();
const colorChannels = ["r", "g", "b"];
const srgb = (linear) => {
  const value = Math.min(1, Math.max(0, linear));
  return Math.round(255 * (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055));
};

function collectMeshes() {
  const meshes = [];
  desk.scene.updateMatrixWorld(true);
  desk.scene.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const instances = mesh.isInstancedMesh ? mesh.count : 1;
    for (let i = 0; i < instances; i++) {
      const matrix = mesh.matrixWorld.clone();
      if (mesh.isInstancedMesh) {
        const instance = new Matrix4();
        mesh.getMatrixAt(i, instance);
        matrix.multiply(instance);
      }
      const normalMatrix = new Matrix3().getNormalMatrix(matrix);
      const { position, normal, uv } = mesh.geometry.attributes;
      const vertices = Array.from({ length: position.count }, (_, index) => {
        const point = new Vector3().fromBufferAttribute(position, index);
        const axis = new Vector3().fromBufferAttribute(normal, index);
        if (mesh.material.side === BackSide) point.addScaledVector(axis, 0.024);
        return {
          point: point.applyMatrix4(matrix), normal: axis.applyNormalMatrix(normalMatrix),
          uv: uv ? [uv.getX(index), uv.getY(index)] : undefined,
        };
      });
      meshes.push({ mesh, vertices, indices: mesh.geometry.index?.array });
    }
  });
  return meshes;
}

function rasterize(meshes, camera, w, h, shade, shadowPass = false) {
  camera.updateMatrixWorld(true);
  const depth = new Float32Array(w * h).fill(Infinity);
  for (const { mesh, vertices, indices } of meshes) {
    if (shadowPass && !mesh.castShadow) continue;
    const projected = vertices.map(({ point }) => {
      const ndc = point.clone().project(camera);
      return [(ndc.x + 1) * w / 2, (1 - ndc.y) * h / 2, ndc.z];
    });
    const count = indices?.length ?? vertices.length;
    for (let index = 0; index < count; index += 3) {
      const ia = indices ? indices[index] : index;
      const ib = indices ? indices[index + 1] : index + 1;
      const ic = indices ? indices[index + 2] : index + 2;
      const [ax, ay, az] = projected[ia];
      const [bx, by, bz] = projected[ib];
      const [cx, cy, cz] = projected[ic];
      const area = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      const backFace = mesh.material.side === BackSide;
      if (Math.abs(area) < 1e-6 || (!shadowPass && (backFace ? area < 0 : area > 0))) continue;
      const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
      const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
      const maxX = Math.min(w - 1, Math.ceil(Math.max(ax, bx, cx)));
      const maxY = Math.min(h - 1, Math.ceil(Math.max(ay, by, cy)));
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const a = ((by - cy) * (x + 0.5 - cx) + (cx - bx) * (y + 0.5 - cy)) / area;
          const b = ((cy - ay) * (x + 0.5 - cx) + (ax - cx) * (y + 0.5 - cy)) / area;
          const c = 1 - a - b;
          if (a < 0 || b < 0 || c < 0) continue;
          const z = a * az + b * bz + c * cz;
          const pixel = y * w + x;
          if (z < -1 || z > 1 || z >= depth[pixel]) continue;
          depth[pixel] = z;
          if (shade) shade(pixel, mesh, vertices[ia], vertices[ib], vertices[ic], a, b, c);
        }
      }
    }
  }
  return depth;
}

const meshes = collectMeshes();
const shadowSize = 1024;
sun.shadow.updateMatrices(sun);
const shadowCamera = sun.shadow.camera;
const shadowDepth = rasterize(meshes, shadowCamera, shadowSize, shadowSize, null, true);
const point = new Vector3();
const normal = new Vector3();
const shadowPoint = new Vector3();
const projections = Object.fromEntries(Object.entries(deskViews).map(([view, angle]) => {
  desk.aim(angle);
  return [view, desk.projectScreen()];
}));

function windowMask(distance, z, y) {
  const { width, height, frame, mullions, mullionWidth } = deskWindow;
  return distance >= 0 && Math.min(z, width - z, y, height - y) > frame &&
    Math.abs(z - mullions[0]) > mullionWidth / 2 && Math.abs(z - mullions[1]) > mullionWidth / 2;
}

for (const lighting of deskLightingModes) {
  desk.setLighting(lighting);
  const { data: landscape, info: landscapeSize } = landscapes[lighting];
  for (const theme of deskThemeNames) {
    desk.setTheme(theme);
    await renderViews(theme, lighting, landscape, landscapeSize);
  }
}

async function renderViews(theme, lighting, landscape, landscapeSize) {
  for (const [view, angle] of Object.entries(deskViews)) {
    desk.aim(angle);
    const pixels = Buffer.alloc(width * height * 3);
    // Store the window coordinate and light strength at each visible lit surface.
    const lightMap = lighting === "day" && theme === defaultDeskTheme ? Buffer.alloc(pixels.length) : undefined;
    function recordLight(offset, u, v, strength) {
      if (!lightMap) return;
      lightMap[offset] = Math.round(u * 255);
      lightMap[offset + 1] = Math.round((1 - v) * 255);
      lightMap[offset + 2] = Math.round(strength * 255);
    }
    const depth = rasterize(meshes, desk.camera, width, height, (pixel, mesh, va, vb, vc, a, b, c) => {
      const { material } = mesh;
      const offset = pixel * 3;
      if (lightMap) lightMap[offset + 2] = 0;
      if (material === desk.landscapePaint) {
        const u = MathUtils.clamp(a * va.uv[0] + b * vb.uv[0] + c * vc.uv[0], 0, 1);
        const v = MathUtils.clamp(a * va.uv[1] + b * vb.uv[1] + c * vc.uv[1], 0, 1);
        const x = Math.round(u * (landscapeSize.width - 1));
        const y = Math.round((1 - v) * (landscapeSize.height - 1));
        const source = (y * landscapeSize.width + x) * 3;
        pixels[offset] = landscape[source];
        pixels[offset + 1] = landscape[source + 1];
        pixels[offset + 2] = landscape[source + 2];
        recordLight(offset, u, v, 1);
        return;
      }
      if (material.isMeshBasicMaterial) {
        pixels[offset] = srgb(material.color.r);
        pixels[offset + 1] = srgb(material.color.g);
        pixels[offset + 2] = srgb(material.color.b);
        return;
      }
      point.copy(va.point).multiplyScalar(a).addScaledVector(vb.point, b).addScaledVector(vc.point, c);
      normal.copy(va.normal).multiplyScalar(a).addScaledVector(vb.normal, b).addScaledVector(vc.normal, c).normalize();
      shadowPoint.copy(point).addScaledVector(normal, sun.shadow.normalBias).project(shadowCamera);
      const x = Math.floor((shadowPoint.x + 1) * shadowSize / 2);
      const y = Math.floor((1 - shadowPoint.y) * shadowSize / 2);
      const shadowed = mesh.receiveShadow && x >= 0 && x < shadowSize && y >= 0 && y < shadowSize &&
        shadowPoint.z > shadowDepth[y * shadowSize + x] + 0.001;
      const sky = normal.y * 0.5 + 0.5;
      const dot = normal.dot(direction);
      const ramp = material.gradientMap.image.data;
      const tone = ramp[Math.min(ramp.length - 1, Math.floor((dot + 1) * 0.5 * ramp.length))] / 255;
      const direct = shadowed ? 0 : tone * sun.intensity;
      const distance = (deskWindow.x - point.x) / deskWindow.direction.x;
      const windowZ = point.z + distance * deskWindow.direction.z - deskWindow.z;
      const windowY = point.y + distance * deskWindow.direction.y - deskWindow.y;
      const window = windowMask(distance, windowZ, windowY);
      if (window && lightMap && direct > 0) {
        const strength = Math.min(0.74, direct * 1.8 / (fill.intensity * 0.64 + direct));
        recordLight(offset, windowZ / deskWindow.width, windowY / deskWindow.height, strength);
      }
      const tint = desk.light.value;
      const { color } = material;
      const paint = deskPaintMultiplier(point, material.userData.wood);
      const lamp = lighting === "night" ? deskLampFalloff(point) : 0;
      for (let index = 0; index < colorChannels.length; index++) {
        const channel = colorChannels[index];
        const ambient = fill.intensity * (fill.color[channel] * sky + fill.groundColor[channel] * (1 - sky));
        const transmission = window ? (0.45 + tint[channel] * 0.55) * 1.45 : 0.23;
        const lit = color[channel] * ((ambient + direct * sun.color[channel] * transmission) / Math.PI
          + deskLamp.color[index] * lamp) + material.emissive[channel] * material.emissiveIntensity;
        pixels[offset + index] = srgb(lit * paint);
      }
    });
    if (depth.includes(Infinity)) throw new Error(`Room does not cover the camera view for ${view}`);
    const name = deskPosterFilename(theme, view, lighting);
    const destination = new URL(`../src/assets/images/${name}`, import.meta.url);
    await sharp(pixels, { raw: { width, height, channels: 3 } }).resize(1120).webp({ quality: 88 }).toFile(
      fileURLToPath(destination),
    );
    if (lightMap) {
      const map = new URL(`../src/assets/images/profile-window-light-${view}.png`, import.meta.url);
      await sharp(lightMap, { raw: { width, height, channels: 3 } })
        .resize({ width: 720, kernel: "nearest" }).png().toFile(fileURLToPath(map));
    }
    console.log(name);
  }
}
await writeFile(new URL("../src/profile-desk-screen.json", import.meta.url), JSON.stringify(projections, null, 2) + "\n");
