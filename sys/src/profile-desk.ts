import {
  BackSide, BoxGeometry, CanvasTexture, CatmullRomCurve3, Color, CylinderGeometry, DataTexture,
  DirectionalLight, Group, HemisphereLight, InstancedMesh, LinearFilter, Mesh, MeshBasicMaterial,
  MeshToonMaterial, Object3D, OrthographicCamera, PCFShadowMap, PlaneGeometry,
  MathUtils, RedFormat, Scene, SphereGeometry, SRGBColorSpace, TextureLoader, TorusGeometry, TubeGeometry, Vector3, WebGLRenderer,
  type BufferGeometry, type Material,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { deskViews, type DeskProjection } from "./profile-desk-views.ts";
import { defaultDeskLighting, deskThemes, type DeskLighting, type DeskTheme } from "./profile-desk-themes.ts";
type Position = [number, number, number];

export const deskWindow = {
  // 窓を光の方向に沿って画角の外へ移し、室内に落ちる光の位置を保つ。
  x: 10.08,
  direction: new Vector3(11, 5.2, 4.6),
  z: 0.96,
  y: 3.02,
  width: 3.8,
  height: 2.68,
  frame: 0.174,
  mullionWidth: 0.096,
  mullions: [0.90, 2.90],
};

export const deskScreen = { width: 3.43, height: 1.91, centerY: 1.51, z: -0.416 };

export const deskLamp = { x: 2.16, z: 0.44, radius: 2.05, color: [0.66, 0.36, 0.16] } as const;

export function deskLampFalloff(point: Vector3) {
  const distance = Math.hypot(point.x - deskLamp.x, point.y * 0.65, (point.z - deskLamp.z) * 1.2);
  return (1 - MathUtils.smoothstep(distance, 0, deskLamp.radius))
    * MathUtils.smoothstep(point.y, -0.42, -0.02) * (1 - MathUtils.smoothstep(point.y, 0.65, 1.5));
}

// Keep the same painted texture in the live view and the WebP renders.
const paintTexture = `
  float broad = sin(point.x * 2.3 + point.y * 2.1 + sin(point.z * 1.5))
    * sin(point.y * 2.8 + point.z * 1.7 + sin(point.x * 0.9));
  float wash = sin(point.x * 8.2 + point.y * 11.0 + point.z * 4.1) * 0.014;
  float grain = sin(point.x * 91.0 + point.y * 77.0 + point.z * 113.0)
    * sin(point.x * 157.0 - point.y * 97.0 + point.z * 79.0) * 0.021;
  float grainLine = sin(point.z * 62.0 + sin(point.x * 1.75) * 1.3) * 0.025;
  return 1.0 + broad * 0.027 + wash + grain + grainLine * wood;
`;

export function deskPaintMultiplier(point: Vector3, wood: number) {
  const { x, y, z } = point;
  const broad = Math.sin(x * 2.3 + y * 2.1 + Math.sin(z * 1.5))
    * Math.sin(y * 2.8 + z * 1.7 + Math.sin(x * 0.9));
  const wash = Math.sin(x * 8.2 + y * 11 + z * 4.1) * 0.014;
  const grain = Math.sin(x * 91 + y * 77 + z * 113) * Math.sin(x * 157 - y * 97 + z * 79) * 0.021;
  return 1 + broad * 0.027 + wash + grain + Math.sin(z * 62 + Math.sin(x * 1.75) * 1.3) * 0.025 * wood;
}

export function createDeskScene(motion?: CanvasTexture) {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
  const fill = new HemisphereLight(0xf7f3ff, 0xcbd0ed, 2.75);
  const sun = new DirectionalLight(0xffe7ac, 2.15);
  sun.position.copy(deskWindow.direction);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 5, bottom: -5, far: 23 });
  sun.shadow.normalBias = 0.025;
  scene.add(fill, sun);

  // 連続的な反射の代わりに、明るさを段階に分けて色面を描く。
  const gradientMap = new DataTexture(new Uint8Array([40, 40, 40, 145, 145, 255]), 6, 1, RedFormat);
  gradientMap.needsUpdate = true;
  const light = { value: new Color() };
  const lamp = { value: 0 };
  const windowMotion = { value: motion };
  const matte = (color: number, wood = 0) => {
    const material = new MeshToonMaterial({ color, gradientMap });
    material.userData.wood = wood;
    material.onBeforeCompile = (shader) => {
      shader.uniforms.deskWindowTint = light;
      shader.uniforms.deskWood = { value: wood };
      shader.uniforms.deskLamp = lamp;
      if (motion) shader.uniforms.deskWindowMotion = windowMotion;
      shader.vertexShader = `varying vec3 deskWorldPosition;
        ${shader.vertexShader}`.replace("#include <project_vertex>", `
          vec4 deskPosition = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            deskPosition = instanceMatrix * deskPosition;
          #endif
          deskWorldPosition = (modelMatrix * deskPosition).xyz;
          #include <project_vertex>
        `);
      shader.fragmentShader = `
        varying vec3 deskWorldPosition;
        uniform vec3 deskWindowTint;
        uniform float deskWood;
        uniform float deskLamp;
        ${motion ? "uniform sampler2D deskWindowMotion;" : ""}
        float deskPaint(vec3 point, float wood) { ${paintTexture} }
        ${shader.fragmentShader}
      `.replace("#include <opaque_fragment>", `
        // Trace the incident ray back to the opening in the right wall.
        float distanceToWindow = (${deskWindow.x} - deskWorldPosition.x) / ${deskWindow.direction.x.toFixed(1)};
        vec2 atWindow = deskWorldPosition.zy + distanceToWindow
          * vec2(${deskWindow.direction.z}, ${deskWindow.direction.y});
        vec2 inWindow = atWindow - vec2(${deskWindow.z.toFixed(2)}, ${deskWindow.y});
        vec2 windowSize = vec2(${deskWindow.width}, ${deskWindow.height});
        vec2 outside = min(inWindow, windowSize - inWindow);
        float divider = min(
          abs(inWindow.x - ${deskWindow.mullions[0].toFixed(2)}),
          abs(inWindow.x - ${deskWindow.mullions[1].toFixed(2)})
        ) - ${deskWindow.mullionWidth / 2};
        vec2 edge = vec2(min(outside.x - ${deskWindow.frame}, divider), outside.y - ${deskWindow.frame});
        vec2 feather = max(fwidth(inWindow) * 1.2, vec2(0.015));
        float lightMask = smoothstep(0.0, feather.x, edge.x) * smoothstep(0.0, feather.y, edge.y)
          * step(0.0, distanceToWindow);
        float motionAlpha = ${motion ? "texture2D(deskWindowMotion, clamp(inWindow / windowSize, 0.0, 1.0)).a" : "0.0"};
        float transmission = lightMask * (1.0 - motionAlpha * (1.0 - deskLamp) * 0.93);
        vec3 direct = mix(vec3(0.23), mix(vec3(1.0), deskWindowTint, 0.55) * 1.45, transmission);
        float lampDistance = length(vec3(deskWorldPosition.x - ${deskLamp.x},
          deskWorldPosition.y * 0.65, (deskWorldPosition.z - ${deskLamp.z}) * 1.2));
        float lampMask = (1.0 - smoothstep(0.0, ${deskLamp.radius}, lampDistance))
          * smoothstep(-0.42, -0.02, deskWorldPosition.y) * (1.0 - smoothstep(0.65, 1.5, deskWorldPosition.y));
        vec3 lampLight = diffuseColor.rgb * vec3(${deskLamp.color.join(", ")}) * lampMask * deskLamp;
        vec3 meteorLight = diffuseColor.rgb * vec3(0.58, 0.78, 1.15) * lightMask * motionAlpha * deskLamp;
        outgoingLight = reflectedLight.indirectDiffuse + reflectedLight.directDiffuse * direct + lampLight
          + totalEmissiveRadiance + meteorLight;
        outgoingLight *= deskPaint(deskWorldPosition, deskWood);
        #include <opaque_fragment>
      `);
    };
    return material;
  };
  const ivory = matte(0xfff3e7);
  const white = matte(0xffffff);
  const lampBulb = matte(0xffffff);
  const desk = matte(0xd99b61, 1);
  const accent = matte(0xe94225);
  const detail = matte(0xffbe49);
  const leaf = matte(0xd98523);
  const soil = matte(0x654339);
  const coffee = matte(0x7b3b20);
  const screen = new MeshBasicMaterial({ color: 0x252135, toneMapped: false });
  const backWall = matte(0xffffff);
  const sideWall = matte(0xffffff);
  const floor = matte(0xffffff, 1);
  const rightWallPaint = matte(0xffffff);
  rightWallPaint.color = floor.color;
  const trim = matte(0xffffff);
  const ink = new MeshBasicMaterial({ side: BackSide });
  ink.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\ntransformed += normal * 0.024;",
    );
  };

  function mesh(parent: Object3D, geometry: BufferGeometry, material: Material, position: Position) {
    const item = new Mesh(geometry, material);
    item.position.set(...position);
    item.castShadow = true;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  }

  function box(parent: Object3D, size: Position, material: Material, position: Position, radius = 0.045) {
    return mesh(parent, new RoundedBoxGeometry(...size, 2, radius), material, position);
  }

  function cylinder(parent: Object3D, radii: [number, number], height: number, material: Material, position: Position) {
    return mesh(parent, new CylinderGeometry(...radii, height, 32), material, position);
  }

  function tube(parent: Object3D, points: Position[], radius: number, material: Material) {
    return mesh(parent, new TubeGeometry(new CatmullRomCurve3(points.map((point) => new Vector3(...point))),
      24, radius, 8), material, [0, 0, 0]);
  }

  function outline(item: Mesh) {
    item.add(new Mesh(item.geometry, ink));
  }

  function surface(geometry: PlaneGeometry, material: Material, position: Position) {
    const plane = mesh(scene, geometry, material, position);
    plane.castShadow = false;
    return plane;
  }

  const wallZ = -1.57;
  const floorY = -1.64;
  const cornerX = -11.5;
  const roomSize = 32;
  surface(new PlaneGeometry(roomSize, 12), backWall, [cornerX + roomSize / 2, floorY + 6, wallZ]);
  surface(new PlaneGeometry(roomSize, 12), sideWall, [cornerX, floorY + 6, wallZ + roomSize / 2]).rotation.y = Math.PI / 2;
  surface(new PlaneGeometry(roomSize, roomSize), floor, [cornerX + roomSize / 2, floorY, wallZ + roomSize / 2]).rotation.x = -Math.PI / 2;
  surface(new PlaneGeometry(roomSize, 0.14), trim, [cornerX + roomSize / 2, floorY + 0.07, wallZ + 0.006]);
  surface(new PlaneGeometry(roomSize, 0.14), trim, [cornerX + 0.006, floorY + 0.07, wallZ + roomSize / 2]).rotation.y = Math.PI / 2;

  const windowRight = deskWindow.z + deskWindow.width;
  const windowTop = deskWindow.y + deskWindow.height;
  const roomTop = floorY + 12;
  function rightWall(fromZ: number, toZ: number, fromY: number, toY: number, material: Material, x = deskWindow.x) {
    surface(new PlaneGeometry(toZ - fromZ, toY - fromY), material,
      [x, (fromY + toY) / 2, (fromZ + toZ) / 2]).rotation.y = -Math.PI / 2;
  }
  rightWall(wallZ, deskWindow.z, floorY, roomTop, rightWallPaint);
  rightWall(windowRight, wallZ + roomSize, floorY, roomTop, rightWallPaint);
  rightWall(deskWindow.z, windowRight, floorY, deskWindow.y, rightWallPaint);
  rightWall(deskWindow.z, windowRight, windowTop, roomTop, rightWallPaint);
  rightWall(wallZ, wallZ + roomSize, floorY, floorY + 0.14, trim, deskWindow.x - 0.008);

  const landscapePaint = new MeshBasicMaterial({ color: 0xffffff });
  if (motion) {
    landscapePaint.onBeforeCompile = (shader) => {
      shader.uniforms.deskWindowMotion = windowMotion;
      shader.uniforms.deskLamp = lamp;
      shader.fragmentShader = `
        uniform sampler2D deskWindowMotion;
        uniform float deskLamp;
        ${shader.fragmentShader}
      `.replace("#include <map_fragment>", `
        #include <map_fragment>
        #ifdef USE_MAP
        float motionAlpha = texture2D(deskWindowMotion, vMapUv).a;
        vec3 motionColor = mix(vec3(0.035, 0.047, 0.072), vec3(0.63, 0.78, 1.0), deskLamp);
        diffuseColor.rgb = mix(diffuseColor.rgb, motionColor, motionAlpha * 0.82);
        #endif
      `);
    };
  }
  // Place the view just behind the sash so oblique camera rays still hit the image at the edge.
  rightWall(deskWindow.z, windowRight, deskWindow.y, windowTop, landscapePaint, deskWindow.x + 0.004);

  const windowFrame = matte(0xdad6c4, 1);
  const frameBevel = new MeshBasicMaterial({ color: 0xf4eddd });
  const frameShadow = new MeshBasicMaterial({ color: 0x626d88 });
  const frameReveal = new MeshBasicMaterial({ color: 0xa1adba });
  const metal = new MeshBasicMaterial({ color: 0xd6dadd });

  const { frame } = deskWindow;
  const casing = 0.115;
  for (const [fromZ, toZ] of [[deskWindow.z - casing, deskWindow.z], [windowRight, windowRight + casing]]) {
    rightWall(fromZ, toZ, deskWindow.y - casing, windowTop + casing, frameShadow, deskWindow.x - 0.018);
  }
  for (const [fromY, toY] of [[deskWindow.y - casing, deskWindow.y], [windowTop, windowTop + casing]]) {
    rightWall(deskWindow.z - casing, windowRight + casing, fromY, toY, frameShadow, deskWindow.x - 0.021);
  }

  for (const [fromZ, toZ] of [[deskWindow.z, deskWindow.z + frame], [windowRight - frame, windowRight]]) {
    rightWall(fromZ, toZ, deskWindow.y, windowTop, windowFrame, deskWindow.x - 0.025);
    rightWall(fromZ + 0.023, fromZ + 0.046, deskWindow.y + frame, windowTop - frame, frameBevel, deskWindow.x - 0.031);
  }
  for (const [fromY, toY] of [[deskWindow.y, deskWindow.y + frame], [windowTop - frame, windowTop]]) {
    rightWall(deskWindow.z, windowRight, fromY, toY, windowFrame, deskWindow.x - 0.03);
    rightWall(deskWindow.z + frame, windowRight - frame, toY - 0.043, toY - 0.023, frameBevel, deskWindow.x - 0.037);
  }
  const divider = deskWindow.mullionWidth / 2;
  for (const offset of deskWindow.mullions) {
    const z = deskWindow.z + offset;
    rightWall(z - divider, z + divider, deskWindow.y + frame, windowTop - frame, frameShadow, deskWindow.x - 0.029);
    rightWall(z - divider + 0.015, z + divider - 0.017, deskWindow.y + frame, windowTop - frame,
      frameBevel, deskWindow.x - 0.036);
    rightWall(z - 0.054, z + 0.054, deskWindow.y + 0.48, deskWindow.y + 0.67, frameShadow, deskWindow.x - 0.043);
    rightWall(z - 0.032, z + 0.032, deskWindow.y + 0.50, deskWindow.y + 0.65, metal, deskWindow.x - 0.049);
  }
  rightWall(deskWindow.z + frame - 0.04, deskWindow.z + frame, deskWindow.y + frame, windowTop - frame,
    frameReveal, deskWindow.x - 0.041);
  rightWall(windowRight - frame, windowRight - frame + 0.04, deskWindow.y + frame, windowTop - frame,
    frameReveal, deskWindow.x - 0.041);
  rightWall(deskWindow.z - 0.15, windowRight + 0.15, deskWindow.y - 0.11, deskWindow.y + 0.015,
    windowFrame, deskWindow.x - 0.04);
  rightWall(deskWindow.z - 0.14, windowRight + 0.14, deskWindow.y - 0.012, deskWindow.y + 0.01,
    frameBevel, deskWindow.x - 0.045);

  outline(box(scene, [10.6, 0.22, 3.1], desk, [0, -0.11, 0]));
  outline(box(scene, [10.2, 0.28, 2.75], desk, [0, -0.35, 0]));

  box(scene, [1.38, 0.12, 0.66], ivory, [0, 0.06, -0.52]);
  box(scene, [0.39, 0.49, 0.24], ivory, [0, 0.29, -0.59]);
  outline(box(scene, [3.68, 2.19, 0.22], ivory, [0, 1.48, -0.59], 0.085));
  box(scene, [3.49, 1.98, 0.045], screen, [0, 1.51, -0.463], 0.025);
  box(scene, [0.065, 0.024, 0.03], detail, [1.61, 0.44, -0.465], 0.008);

  // モニター内のエディターを抽象化した配色と行。
  const editorColors = [0x776282, 0xffa780, 0xe7b9f3, 0x8ed9c7].map(
    (color) => new MeshBasicMaterial({ color, toneMapped: false }),
  );
  const screenBar = new MeshBasicMaterial({ color: 0x352d47, toneMapped: false });
  const screenZ = -0.434;
  const editorPoster = new Group();
  scene.add(editorPoster);
  mesh(editorPoster, new BoxGeometry(3.43, 0.23, 0.005), screenBar, [0, 2.36, screenZ]);
  mesh(editorPoster, new BoxGeometry(0.69, 1.68, 0.005), screenBar, [-1.37, 1.38, screenZ]);
  for (let dot = 0; dot < 3; dot++) {
    mesh(editorPoster, new SphereGeometry(0.027, 12, 8), editorColors[dot + 1], [-1.56 + dot * 0.1, 2.36, screenZ + 0.008]);
  }
  const lineLengths = [0.42, 0.30, 0.56, 0.33, 0.47, 0.25, 0.40];
  lineLengths.forEach((length, row) => {
    const indent = row === 0 || row === 6 ? 0 : 0.18;
    const y = 2.09 - row * 0.111;
    mesh(editorPoster, new BoxGeometry(0.13 + indent, 0.020, 0.005), editorColors[1 + row % 3], [-0.8 + indent, y, screenZ]);
    mesh(editorPoster, new BoxGeometry(length, 0.017, 0.005), editorColors[0], [-0.69 + length / 2 + 2 * indent, y, screenZ]);
  });

  for (const side of [-1, 1]) {
    const speaker = new Group();
    speaker.position.set(side * 3.86, 0, -0.57);
    speaker.rotation.y = -side * 0.18;
    scene.add(speaker);
    outline(box(speaker, [0.85, 1.42, 0.72], ivory, [0, 0.72, 0], 0.12));
    for (const [height, radius] of [[0.92, 0.245], [0.39, 0.14]]) {
      cylinder(speaker, [radius, radius], 0.06, accent, [0, height, 0.373]).rotation.x = Math.PI / 2;
      const cone = mesh(speaker, new SphereGeometry(radius * 0.46, 24, 12), white, [0, height, 0.407]);
      cone.scale.z = 0.5;
    }
  }

  const keyboard = new Group();
  keyboard.position.set(-0.02, 0, 0.93);
  keyboard.rotation.y = 0.035;
  scene.add(keyboard);
  outline(box(keyboard, [2.25, 0.1, 0.64], ivory, [0, 0.05, 0]));
  const keys = new InstancedMesh(new BoxGeometry(0.122, 0.05, 0.112), detail, 42);
  const key = new Object3D();
  for (let index = 0; index < keys.count; index++) {
    key.position.set(-0.94 + (index % 14) * 0.145, 0.12, -0.22 + Math.floor(index / 14) * 0.147);
    key.updateMatrix();
    keys.setMatrixAt(index, key.matrix);
  }
  keyboard.add(keys);
  box(keyboard, [0.83, 0.05, 0.11], detail, [0, 0.12, 0.22], 0.018);
  const mouse = mesh(scene, new SphereGeometry(1, 24, 16), ivory, [1.76, 0.085, 0.98]);
  mouse.scale.set(0.22, 0.12, 0.33);

  const cup = [-2.38, 0.22, 0.64] satisfies Position;
  outline(cylinder(scene, [0.24, 0.19], 0.43, ivory, cup));
  cylinder(scene, [0.205, 0.205], 0.01, coffee, [cup[0], 0.438, cup[2]]);
  const rim = mesh(scene, new TorusGeometry(0.222, 0.02, 10, 32), white, [cup[0], 0.443, cup[2]]);
  rim.rotation.x = Math.PI / 2;
  mesh(scene, new TorusGeometry(0.132, 0.036, 10, 24), ivory, [-2.12, 0.24, 0.64]);
  box(scene, [0.82, 0.038, 0.57], detail, [-3.55, 0.023, 1]).rotation.y = -0.15;
  box(scene, [0.74, 0.026, 0.48], white, [-3.61, 0.052, 1.03]).rotation.y = 0.12;

  cylinder(scene, [0.41, 0.43], 0.12, accent, [2.67, 0.06, 0.47]);
  tube(scene, [[2.81, 0.12, 0.47], [2.81, 0.76, 0.47], [2.75, 1.42, 0.43], [2.44, 1.74, 0.36]], 0.045, ivory);
  const shade = new Group();
  shade.position.set(2.38, 1.69, 0.36);
  shade.rotation.z = -0.53;
  scene.add(shade);
  outline(cylinder(shade, [0.16, 0.36], 0.43, accent, [0, 0, 0]));
  cylinder(shade, [0.318, 0.318], 0.022, lampBulb, [0, -0.22, 0]);

  outline(cylinder(scene, [0.35, 0.25], 0.49, ivory, [3.13, 0.25, -0.56]));
  cylinder(scene, [0.36, 0.36], 0.085, white, [3.13, 0.49, -0.56]);
  cylinder(scene, [0.31, 0.31], 0.01, soil, [3.13, 0.538, -0.56]);
  for (const [x, y, tilt, height] of [[3.0, 0.89, 0.48, 0.47], [3.29, 1.09, -0.44, 0.7], [3.17, 0.82, -0.83, 0.36]]) {
    const blade = mesh(scene, new SphereGeometry(1, 24, 16), leaf, [x, y, -0.56]);
    blade.scale.set(0.14, height, 0.07);
    blade.rotation.z = tilt;
  }

  const clock = new Group();
  clock.position.set(2.57, 2.92, wallZ + 0.065);
  scene.add(clock);
  const clockRim = cylinder(clock, [0.55, 0.55], 0.13, ivory, [0, 0, 0]);
  clockRim.rotation.x = Math.PI / 2;
  outline(clockRim);
  cylinder(clock, [0.46, 0.46], 0.03, accent, [0, 0, 0.075]).rotation.x = Math.PI / 2;
  box(clock, [0.033, 0.26, 0.025], white, [-0.07, 0.09, 0.103], 0.01).rotation.z = 0.65;
  box(clock, [0.29, 0.033, 0.025], white, [0.14, 0, 0.105], 0.01);
  mesh(clock, new SphereGeometry(0.047, 16, 10), white, [0, 0, 0.116]);
  outline(box(scene, [0.8, 1.07, 0.1], ivory, [-2.87, 2.65, wallZ + 0.05]));
  box(scene, [0.67, 0.94, 0.034], detail, [-2.87, 2.65, wallZ + 0.121]);
  cylinder(scene, [0.205, 0.205], 0.02, accent, [-2.87, 2.55, wallZ + 0.15]).rotation.x = Math.PI / 2;
  cylinder(scene, [0.081, 0.081], 0.02, ivory, [-2.99, 2.88, wallZ + 0.15]).rotation.x = Math.PI / 2;

  let theme: DeskTheme | undefined;
  let lighting = defaultDeskLighting;
  let aspect = 16 / 9;
  let framedAspect = 0;
  let framedTilt = -1;

  function updateLightingColors() {
    if (!theme) return;
    const night = lighting === "night";
    light.value.setHex(night ? 0xbcd0ff : deskThemes[theme].light);
    ink.color.setHex(deskThemes[theme].ink).multiplyScalar(night ? 0.38 : 1);
    frameShadow.color.setHex(night ? 0x343c5e : 0x626d88);
    frameBevel.color.setHex(night ? 0x8f91ac : 0xf4eddd);
    frameReveal.color.setHex(night ? 0x606b91 : 0xa1adba);
    metal.color.setHex(night ? 0x929db8 : 0xd6dadd);
  }

  function projectRectangle(x: number, y: number, z: number, width: number, height: number): DeskProjection {
    const left = x - width / 2;
    const top = y + height / 2;
    const project = (px: number, py: number): [number, number] => {
      const vertex = new Vector3(px, py, z).project(camera);
      return [(vertex.x + 1) / 2, (1 - vertex.y) / 2];
    };
    camera.updateMatrixWorld(true);
    return [project(left, top), project(left + width, top), project(left, top - height)];
  }

  return {
    setTheme(next: DeskTheme) {
      if (theme === next) return;
      theme = next;
      const palette = deskThemes[next];
      desk.color.setHex(palette.desk);
      accent.color.setHex(palette.accent);
      detail.color.setHex(palette.detail);
      leaf.color.setHex(palette.leaf);
      backWall.color.setHex(palette.wall);
      sideWall.color.setHex(palette.side);
      floor.color.setHex(palette.floor);
      trim.color.setHex(palette.trim);
      windowFrame.color.setHex(palette.frame);
      updateLightingColors();
    },
    setLighting(next: DeskLighting) {
      lighting = next;
      const night = next === "night";
      fill.color.setHex(night ? 0xbac8ff : 0xf7f3ff);
      fill.groundColor.setHex(night ? 0x8999c6 : 0xcbd0ed);
      fill.intensity = night ? 1.48 : 2.75;
      sun.color.setHex(night ? 0xbad2ff : 0xffe7ac);
      sun.intensity = night ? 0.46 : 2.15;
      lamp.value = night ? 1 : 0;
      lampBulb.emissive.setHex(night ? 0xffd599 : 0x000000);
      updateLightingColors();
    },
    projectScreen() {
      return projectRectangle(0, deskScreen.centerY, deskScreen.z, deskScreen.width, deskScreen.height);
    },
    resize(width: number, height: number) {
      aspect = width / height;
    },
    aim(angle: number) {
      const tilt = MathUtils.smoothstep(Math.abs(angle), deskViews.front, deskViews.right);
      if (aspect !== framedAspect || tilt !== framedTilt) {
        const frontWidth = Math.max(11.65, aspect * 6.56);
        const sideWidth = Math.max(12.35, aspect * 7.43);
        const viewWidth = MathUtils.lerp(frontWidth, sideWidth, tilt);
        camera.left = -viewWidth / 2;
        camera.right = viewWidth / 2;
        camera.top = viewWidth / aspect / 2;
        camera.bottom = -camera.top;
        camera.updateProjectionMatrix();
        framedAspect = aspect;
        framedTilt = tilt;
      }
      const azimuth = MathUtils.degToRad(angle);
      camera.position.set(Math.sin(azimuth) * 14.3, MathUtils.lerp(4.5, 8.75, tilt), Math.cos(azimuth) * 14.3);
      camera.lookAt(0, MathUtils.lerp(2.2, 1.09, tilt), tilt * 0.07);
    },
    scene, camera, light, editorPoster, landscapePaint,
  };
}


export async function createProfileDesk(
  canvas: HTMLCanvasElement, landscapeUrls: Record<DeskLighting, string>,
  editor?: HTMLCanvasElement, outdoorMotion?: HTMLCanvasElement,
) {
  const loader = new TextureLoader();
  const [day, night] = await Promise.all([loader.loadAsync(landscapeUrls.day), loader.loadAsync(landscapeUrls.night)]);
  day.colorSpace = night.colorSpace = SRGBColorSpace;
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.debug.onShaderError = () => {
    throw new Error("Profile desk shader failed to compile");
  };
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  const motion = outdoorMotion ? new CanvasTexture(outdoorMotion) : undefined;
  if (motion) {
    motion.generateMipmaps = false;
    motion.minFilter = LinearFilter;
  }
  const desk = createDeskScene(motion);
  desk.landscapePaint.map = day;
  const texture = editor ? new CanvasTexture(editor) : undefined;
  if (texture) texture.colorSpace = SRGBColorSpace;
  if (texture) {
    const screen = new Mesh(
      new PlaneGeometry(deskScreen.width, deskScreen.height),
      new MeshBasicMaterial({ map: texture, toneMapped: false }),
    );
    screen.position.set(0, deskScreen.centerY, deskScreen.z);
    desk.editorPoster.visible = false;
    desk.scene.add(screen);
  }
  return {
    setTheme: desk.setTheme,
    setLighting(mode: DeskLighting) {
      desk.setLighting(mode);
      desk.landscapePaint.map = mode === "night" ? night : day;
    },
    refreshWindow() {
      if (motion) motion.needsUpdate = true;
    },
    refreshScreen() {
      if (texture) texture.needsUpdate = true;
    },
    resize(width: number, height: number) {
      desk.resize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.setSize(width, height, false);
    },
    draw(angle: number) {
      desk.aim(angle);
      renderer.render(desk.scene, desk.camera);
    },
  };
}
