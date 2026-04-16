import { useRef, useMemo, useEffect, useCallback, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Gender, AgeRange } from "./GenderAgeSelector";
import { detectBodyPart } from "@/utils/detect-body-part.functions";

interface ModelMetrics {
  width: number;
  height: number;
  depth: number;
}

interface PainMark {
  position: THREE.Vector3;
  partName: string;
  partLabel: string;
}

interface DetectionSnapshot {
  imageDataUrl: string;
  clickX: number;
  clickY: number;
}

interface BodyPartZone {
  name: string;
  label: string;
  yMin: number;
  yMax: number;
  xSide?: "left" | "right" | "center";
  zSide?: "front" | "back" | "center";
}

const BODY_ZONES: BodyPartZone[] = [
  { name: "scalp", label: "Scalp / Top of Head", yMin: 1.75, yMax: 2.0 },
  { name: "forehead", label: "Forehead", yMin: 1.68, yMax: 1.78, zSide: "front" },
  { name: "left_eye", label: "Left Eye", yMin: 1.63, yMax: 1.72, xSide: "right", zSide: "front" },
  { name: "right_eye", label: "Right Eye", yMin: 1.63, yMax: 1.72, xSide: "left", zSide: "front" },
  { name: "nose", label: "Nose", yMin: 1.60, yMax: 1.68, zSide: "front" },
  { name: "left_ear", label: "Left Ear", yMin: 1.60, yMax: 1.72, xSide: "right" },
  { name: "right_ear", label: "Right Ear", yMin: 1.60, yMax: 1.72, xSide: "left" },
  { name: "left_cheek", label: "Left Cheek", yMin: 1.56, yMax: 1.65, xSide: "right", zSide: "front" },
  { name: "right_cheek", label: "Right Cheek", yMin: 1.56, yMax: 1.65, xSide: "left", zSide: "front" },
  { name: "mouth", label: "Mouth", yMin: 1.55, yMax: 1.62, zSide: "front" },
  { name: "chin", label: "Chin", yMin: 1.50, yMax: 1.57, zSide: "front" },
  { name: "jaw", label: "Jaw", yMin: 1.50, yMax: 1.58 },
  { name: "front_neck", label: "Front of Neck (Throat)", yMin: 1.40, yMax: 1.52, zSide: "front" },
  { name: "back_neck", label: "Back of Neck (Nape)", yMin: 1.40, yMax: 1.55, zSide: "back" },
  { name: "left_shoulder", label: "Left Shoulder", yMin: 1.25, yMax: 1.45, xSide: "right" },
  { name: "right_shoulder", label: "Right Shoulder", yMin: 1.25, yMax: 1.45, xSide: "left" },
  { name: "upper_chest", label: "Upper Chest", yMin: 1.20, yMax: 1.40, zSide: "front" },
  { name: "sternum", label: "Sternum (Breastbone)", yMin: 1.10, yMax: 1.30, zSide: "front" },
  { name: "upper_back", label: "Upper Back", yMin: 1.15, yMax: 1.40, zSide: "back" },
  { name: "mid_back", label: "Mid Back", yMin: 1.00, yMax: 1.15, zSide: "back" },
  { name: "upper_abdomen", label: "Upper Abdomen", yMin: 0.95, yMax: 1.10, zSide: "front" },
  { name: "navel", label: "Navel (Belly Button)", yMin: 0.90, yMax: 1.00, zSide: "front" },
  { name: "lower_abdomen", label: "Lower Abdomen", yMin: 0.80, yMax: 0.95, zSide: "front" },
  { name: "lower_back", label: "Lower Back (Lumbar)", yMin: 0.75, yMax: 1.05, zSide: "back" },
  { name: "left_hip", label: "Left Hip", yMin: 0.65, yMax: 0.85, xSide: "right" },
  { name: "right_hip", label: "Right Hip", yMin: 0.65, yMax: 0.85, xSide: "left" },
  { name: "groin", label: "Groin", yMin: 0.60, yMax: 0.75, zSide: "front" },
  { name: "buttocks", label: "Buttocks", yMin: 0.60, yMax: 0.80, zSide: "back" },
  { name: "left_upper_arm", label: "Left Upper Arm (Bicep)", yMin: 0.95, yMax: 1.25, xSide: "right" },
  { name: "right_upper_arm", label: "Right Upper Arm (Bicep)", yMin: 0.95, yMax: 1.25, xSide: "left" },
  { name: "left_elbow", label: "Left Elbow", yMin: 0.80, yMax: 0.95, xSide: "right" },
  { name: "right_elbow", label: "Right Elbow", yMin: 0.80, yMax: 0.95, xSide: "left" },
  { name: "left_forearm", label: "Left Forearm", yMin: 0.60, yMax: 0.80, xSide: "right" },
  { name: "right_forearm", label: "Right Forearm", yMin: 0.60, yMax: 0.80, xSide: "left" },
  { name: "left_wrist", label: "Left Wrist", yMin: 0.52, yMax: 0.60, xSide: "right" },
  { name: "right_wrist", label: "Right Wrist", yMin: 0.52, yMax: 0.60, xSide: "left" },
  { name: "left_palm", label: "Left Palm", yMin: 0.38, yMax: 0.52, xSide: "right" },
  { name: "right_palm", label: "Right Palm", yMin: 0.38, yMax: 0.52, xSide: "left" },
  { name: "left_thumb", label: "Left Thumb", yMin: 0.40, yMax: 0.50, xSide: "right" },
  { name: "right_thumb", label: "Right Thumb", yMin: 0.40, yMax: 0.50, xSide: "left" },
  { name: "left_thigh_front", label: "Left Front Thigh (Quad)", yMin: 0.35, yMax: 0.60, xSide: "right", zSide: "front" },
  { name: "right_thigh_front", label: "Right Front Thigh (Quad)", yMin: 0.35, yMax: 0.60, xSide: "left", zSide: "front" },
  { name: "left_thigh_back", label: "Left Back Thigh (Hamstring)", yMin: 0.35, yMax: 0.60, xSide: "right", zSide: "back" },
  { name: "right_thigh_back", label: "Right Back Thigh (Hamstring)", yMin: 0.35, yMax: 0.60, xSide: "left", zSide: "back" },
  { name: "left_kneecap", label: "Left Kneecap", yMin: 0.25, yMax: 0.38, xSide: "right", zSide: "front" },
  { name: "right_kneecap", label: "Right Kneecap", yMin: 0.25, yMax: 0.38, xSide: "left", zSide: "front" },
  { name: "left_shin", label: "Left Shin", yMin: 0.08, yMax: 0.25, xSide: "right", zSide: "front" },
  { name: "right_shin", label: "Right Shin", yMin: 0.08, yMax: 0.25, xSide: "left", zSide: "front" },
  { name: "left_calf", label: "Left Calf", yMin: 0.08, yMax: 0.25, xSide: "right", zSide: "back" },
  { name: "right_calf", label: "Right Calf", yMin: 0.08, yMax: 0.25, xSide: "left", zSide: "back" },
  { name: "left_ankle", label: "Left Ankle", yMin: 0.02, yMax: 0.08, xSide: "right" },
  { name: "right_ankle", label: "Right Ankle", yMin: 0.02, yMax: 0.08, xSide: "left" },
  { name: "left_top_of_foot", label: "Left Top of Foot", yMin: -0.05, yMax: 0.04, xSide: "right" },
  { name: "right_top_of_foot", label: "Right Top of Foot", yMin: -0.05, yMax: 0.04, xSide: "left" },
  { name: "left_heel", label: "Left Heel", yMin: -0.05, yMax: 0.03, xSide: "right", zSide: "back" },
  { name: "right_heel", label: "Right Heel", yMin: -0.05, yMax: 0.03, xSide: "left", zSide: "back" },
];

export const BODY_PARTS = BODY_ZONES.map((z) => ({ name: z.name, label: z.label }));

function identifyBodyPart(point: THREE.Vector3): { name: string; label: string } {
  const y = point.y;
  const x = point.x;
  const z = point.z;
  const isLimb = Math.abs(x) > 0.12;

  let best: BodyPartZone | null = null;
  let bestScore = -Infinity;

  for (const zone of BODY_ZONES) {
    if (y < zone.yMin || y > zone.yMax) continue;
    let score = 0;
    if (zone.xSide === "left" && x < -0.05) score += 2;
    else if (zone.xSide === "right" && x > 0.05) score += 2;
    else if (!zone.xSide || zone.xSide === "center") score += isLimb ? 0 : 1;
    if (zone.zSide === "front" && z > 0) score += 1;
    else if (zone.zSide === "back" && z < 0) score += 1;
    else if (!zone.zSide) score += 0.5;
    score += 1 / (zone.yMax - zone.yMin);
    if (score > bestScore) { bestScore = score; best = zone; }
  }
  return best ? { name: best.name, label: best.label } : { name: "upper_chest", label: "Upper Chest" };
}

function getTargetHeight(ageRange: AgeRange) {
  switch (ageRange) {
    case "0-5": return 0.85;
    case "5-18": return 1.45;
    case "18-40": return 1.85;
    case "40-60": return 1.8;
    case "60+": return 1.72;
  }
}

/* Ground glow ring */
function GroundGlow() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + 0.04 * Math.sin(clock.getElapsedTime() * 0.8);
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
      <ringGeometry args={[0.3, 1.2, 64]} />
      <meshBasicMaterial color="#00e5cc" transparent opacity={0.1} depthWrite={false} />
    </mesh>
  );
}

/* Breathing idle animation on wrapper group */
function BreathingGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.scale.y = 1 + 0.003 * Math.sin(t * 1.2);
    }
  });
  return <group ref={ref}>{children}</group>;
}

function FitCamera({ metrics, controlsRef }: { metrics: ModelMetrics | null; controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  useEffect(() => {
    if (!metrics || !(camera instanceof THREE.PerspectiveCamera)) return;
    const verticalFov = THREE.MathUtils.degToRad(camera.fov);
    const fitHeightDistance = metrics.height / (2 * Math.tan(verticalFov / 2));
    const fitWidthDistance = metrics.width / (2 * Math.tan(verticalFov / 2) * camera.aspect);
    const fitDepthDistance = metrics.depth * 2.4;
    const distance = Math.max(fitHeightDistance, fitWidthDistance, fitDepthDistance) * 1.05;
    const targetY = metrics.height * 0.5;
    camera.position.set(0, targetY, distance);
    camera.near = 0.1;
    camera.far = Math.max(100, distance * 10);
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.target.set(0, targetY, 0);
      controlsRef.current.minDistance = distance * 0.5;
      controlsRef.current.maxDistance = distance * 2.5;
      controlsRef.current.update();
    }
  }, [camera, controlsRef, metrics]);
  return null;
}

function PainMarker({ position, label }: { position: THREE.Vector3; label: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 1 + 0.25 * Math.sin(t * 3);
    if (meshRef.current) meshRef.current.scale.setScalar(pulse);
    if (glowRef.current) {
      glowRef.current.scale.setScalar(pulse * 2.5);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + 0.1 * Math.sin(t * 3);
    }
  });
  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshBasicMaterial color="#ff1a1a" />
      </mesh>
      <Html position={[0, 0.08, 0]} center style={{ pointerEvents: "none" }}>
        <div style={{
          background: "rgba(220, 20, 20, 0.9)", color: "white", padding: "3px 10px",
          borderRadius: "6px", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(220,20,20,0.4)", border: "1px solid rgba(255,255,255,0.2)",
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function HumanModel({
  gender, ageRange, onSelectPart, onMetrics, painMark, onSetPainMark, onResolveBodyPart,
}: {
  gender: Gender;
  ageRange: AgeRange;
  onSelectPart: (part: string) => Promise<void> | void;
  onMetrics: (metrics: ModelMetrics) => void;
  painMark: PainMark | null;
  onSetPainMark: (mark: PainMark) => void;
  onResolveBodyPart: (snapshot: DetectionSnapshot, mode: "click" | "hover") => Promise<{ bodyPart: string; label: string }>;
}) {
  const modelPath = gender === "male" ? "/models/male_anatomy.glb" : "/models/female_anatomy.glb";
  const { scene } = useGLTF(modelPath);
  const wrapperRef = useRef<THREE.Group>(null);
  const { gl, camera } = useThree();
  const [isResolving, setIsResolving] = useState(false);

  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.frustumCulled = false;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else {
          mesh.material = mesh.material.clone();
        }
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
            material.roughness = 0.5;
            material.metalness = 0.1;
            material.side = THREE.FrontSide;
          }
        });
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const safeHeight = Math.max(size.y, 0.001);
    const targetHeight = getTargetHeight(ageRange);
    const normalizedScale = targetHeight / safeHeight;
    return {
      clone, normalizedScale,
      offset: [-center.x * normalizedScale, -box.min.y * normalizedScale, -center.z * normalizedScale] as [number, number, number],
      metrics: { width: size.x * normalizedScale, height: size.y * normalizedScale, depth: size.z * normalizedScale },
    };
  }, [ageRange, scene]);

  useEffect(() => { onMetrics(prepared.metrics); }, [onMetrics, prepared.metrics]);

  const projectWorldToScreen = useCallback((worldPoint: THREE.Vector3) => {
    const projected = worldPoint.clone().project(camera);
    return {
      x: THREE.MathUtils.clamp((projected.x + 1) / 2, 0, 1),
      y: THREE.MathUtils.clamp((-projected.y + 1) / 2, 0, 1),
    };
  }, [camera]);

  const buildSnapshot = useCallback((worldPoint: THREE.Vector3) => {
    const sourceCanvas = gl.domElement;
    const w = 256;
    const h = Math.round(256 * (sourceCanvas.height / sourceCanvas.width));
    const snapshotCanvas = document.createElement("canvas");
    snapshotCanvas.width = w;
    snapshotCanvas.height = h;
    const ctx = snapshotCanvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context failed.");
    ctx.drawImage(sourceCanvas, 0, 0, w, h);
    const { x, y } = projectWorldToScreen(worldPoint);
    const px = x * w;
    const py = y * h;
    ctx.fillStyle = "rgba(255, 40, 40, 0.18)";
    ctx.beginPath(); ctx.arc(px, py, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255, 40, 40, 0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255, 40, 40, 1)";
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
    return {
      imageDataUrl: snapshotCanvas.toDataURL("image/jpeg", 0.5),
      clickX: x, clickY: y,
    };
  }, [gl.domElement, projectWorldToScreen]);

  const handleClick = useCallback(async (event: any) => {
    event.stopPropagation();
    if (isResolving) return;
    setIsResolving(true);
    try {
      const worldPoint = event.point.clone();
      const snapshot = buildSnapshot(worldPoint);
      let detected: { bodyPart: string; label: string };
      try {
        detected = await onResolveBodyPart(snapshot, "click");
      } catch {
        const fallback = identifyBodyPart(worldPoint);
        detected = { bodyPart: fallback.name, label: fallback.label };
      }
      onSetPainMark({ position: worldPoint, partName: detected.bodyPart, partLabel: detected.label });
      await onSelectPart(detected.bodyPart);
    } finally {
      setIsResolving(false);
    }
  }, [buildSnapshot, isResolving, onSetPainMark, onResolveBodyPart, onSelectPart]);

  const handlePointerMove = useCallback((event: any) => {
    event.stopPropagation();
    gl.domElement.style.cursor = isResolving ? "progress" : "pointer";
  }, [gl.domElement.style, isResolving]);

  const handlePointerOut = useCallback(() => {
    gl.domElement.style.cursor = "auto";
  }, [gl.domElement.style]);

  return (
    <group ref={wrapperRef}>
      <primitive
        object={prepared.clone}
        scale={[prepared.normalizedScale, prepared.normalizedScale, prepared.normalizedScale]}
        position={prepared.offset}
        onClick={(event: any) => { void handleClick(event); }}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      />
      {painMark && <PainMarker position={painMark.position} label={painMark.partLabel} />}
    </group>
  );
}

function Scene({
  gender, ageRange, onSelectPart, painMark, onSetPainMark, onResolveBodyPart,
}: {
  gender: Gender;
  ageRange: AgeRange;
  selectedPart: string | null;
  onSelectPart: (part: string) => Promise<void> | void;
  painMark: PainMark | null;
  onSetPainMark: (mark: PainMark) => void;
  onResolveBodyPart: (snapshot: DetectionSnapshot, mode: "click" | "hover") => Promise<{ bodyPart: string; label: string }>;
}) {
  const controlsRef = useRef<any>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 8, 5]} intensity={0.9} castShadow={false} />
      <directionalLight position={[-3, 4, -3]} intensity={0.25} />
      <pointLight position={[0, 2.5, 2.5]} intensity={0.15} color={0x00e5cc} distance={10} />
      <pointLight position={[0, 0, -3]} intensity={0.1} color={0x6366f1} distance={8} />
      <FitCamera metrics={metrics} controlsRef={controlsRef} />
      <BreathingGroup>
        <HumanModel
          gender={gender} ageRange={ageRange} onSelectPart={onSelectPart}
          onMetrics={setMetrics} painMark={painMark} onSetPainMark={onSetPainMark}
          onResolveBodyPart={onResolveBodyPart}
        />
      </BreathingGroup>
      <GroundGlow />
      <gridHelper args={[4, 20, 0x0d3340, 0x0d3340]} position={[0, -0.01, 0]} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.6}
        rotateSpeed={0.6}
        zoomSpeed={0.6}
      />
    </>
  );
}

export default function HumanBody3D({
  selectedPart, onSelectPart, gender, ageRange,
}: {
  selectedPart: string | null;
  onSelectPart: (part: string) => Promise<void> | void;
  gender: Gender;
  ageRange: AgeRange;
}) {
  const [painMark, setPainMark] = useState<PainMark | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleSetPainMark = useCallback((mark: PainMark) => {
    setPainMark(mark);
  }, []);

  const handleResolveBodyPart = useCallback(
    async ({ imageDataUrl, clickX, clickY }: DetectionSnapshot, mode: "click" | "hover") => {
      if (mode === "click") setIsDetecting(true);
      try {
        return await detectBodyPart({
          data: { imageDataUrl, gender, ageRange, clickX, clickY, mode },
        });
      } finally {
        if (mode === "click") setIsDetecting(false);
      }
    },
    [ageRange, gender]
  );

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 1.2, 5], fov: 32 }} gl={{ preserveDrawingBuffer: true, antialias: true }} className="!bg-transparent">
        <Scene
          gender={gender} ageRange={ageRange} selectedPart={selectedPart}
          onSelectPart={onSelectPart} painMark={painMark}
          onSetPainMark={handleSetPainMark} onResolveBodyPart={handleResolveBodyPart}
        />
      </Canvas>
      {painMark && (
        <button onClick={() => setPainMark(null)}
          className="absolute top-3 right-3 rounded-lg border border-destructive/30 bg-card/80 px-3 py-1.5 backdrop-blur-sm text-xs text-destructive hover:bg-destructive/10 transition-colors">
          Clear
        </button>
      )}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-1.5">
        <span className="text-[11px] text-muted-foreground">
          {isDetecting ? "⏳ Identifying..." : "🖱️ Click body part • Drag to rotate • Scroll to zoom"}
        </span>
      </div>
    </div>
  );
}
