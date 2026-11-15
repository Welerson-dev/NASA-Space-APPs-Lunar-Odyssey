import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Rocket, Settings, Volume2, VolumeX } from 'lucide-react';
import { EquipmentModal } from './components/EquipmentModal';
import { FinalScreen } from './components/FinalScreen';
import { LanguageToggle } from './components/LanguageToggle';
import { retroAudio } from './game/audio';
import { UI_TEXT, getLocalizedMissionBubbleText } from './game/i18n';
import {
  ASTRONAUT_START_MAP_POS,
  EARTH_MAP_POS,
  EquipmentId,
  EquipmentProgress,
  MAP_ASPECT_RATIO,
  NAVE_MAP_POS,
  PROXIMITY_RADIUS,
  PartKey,
  Point2D,
  RTG_MAP_POS,
  RepairInventory,
  SURVEYOR_MAP_POS,
  TOTAL_REQUIRED_PARTS,
  clampToLunarSurface,
  countCollectedParts,
  createInitialEquipmentProgress,
  createInitialInventory,
  getMapDistance,
  isNaveReady,
} from './game/missionData';
import { Language, tts } from './game/tts';

type AppPhase = 'intro' | 'map' | 'equipment' | 'takeoff' | 'final';
type InteractiveTarget = EquipmentId | 'nave';

const MOVE_KEYS = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

export default function App() {
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [phase, setPhase] = useState<AppPhase>('intro');
  const [activeEquipment, setActiveEquipment] = useState<EquipmentId | null>(null);
  const [inventory, setInventory] = useState<RepairInventory>(createInitialInventory);
  const [equipmentProgress, setEquipmentProgress] = useState<
    Record<EquipmentId, EquipmentProgress>
  >(createInitialEquipmentProgress);

  const [astroPos, setAstroPos] = useState<Point2D>(ASTRONAUT_START_MAP_POS);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [isMoving, setIsMoving] = useState(false);
  const [walkBobY, setWalkBobY] = useState(0);
  const [lang, setLang] = useState<Language>('pt');
  const [nearbyTarget, setNearbyTarget] = useState<InteractiveTarget | null>(null);
  const [showDamagedNotice, setShowDamagedNotice] = useState(false);
  const [takeoffProgress, setTakeoffProgress] = useState(0);
  const [autoTts, setAutoTts] = useState(false);
  const [muted, setMuted] = useState(false);

  // Refs for 60 FPS loop
  const phaseRef = useRef<AppPhase>('intro');
  const astroPosRef = useRef<Point2D>({ ...ASTRONAUT_START_MAP_POS });
  const walkTargetRef = useRef<Point2D | null>(null);
  const keysPressedRef = useRef<Set<string>>(new Set());
  const nearbyRef = useRef<InteractiveTarget | null>(null);
  const inventoryRef = useRef<RepairInventory>(createInitialInventory());
  const takeoffRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === 'intro') document.body.dataset.state = 'title';
    else if (phase === 'final') document.body.dataset.state = 'gameover';
    else document.body.dataset.state = 'playing';
    document.body.dataset.phase = phase;
  }, [phase]);

  useEffect(() => {
    inventoryRef.current = inventory;
  }, [inventory]);

  const ui = UI_TEXT[lang];
  const collectedCount = countCollectedParts(inventory);
  const naveReady = isNaveReady(collectedCount);
  const missionBubbleText = getLocalizedMissionBubbleText(
    inventory,
    equipmentProgress,
    lang
  );
  const naveStatusMessage = showDamagedNotice
    ? ui.damagedShipStatus(collectedCount, TOTAL_REQUIRED_PARTS)
    : null;

  const handleChangeLang = useCallback((nextLang: Language) => {
    tts.stop();
    setLang(nextLang);
  }, []);

  const startMission = useCallback(() => {
    tts.stop();
    const freshInv = createInitialInventory();
    const freshProg = createInitialEquipmentProgress();

    inventoryRef.current = freshInv;
    astroPosRef.current = { ...ASTRONAUT_START_MAP_POS };
    walkTargetRef.current = null;
    keysPressedRef.current.clear();
    nearbyRef.current = null;
    takeoffRef.current = 0;

    setInventory(freshInv);
    setEquipmentProgress(freshProg);
    setAstroPos({ ...ASTRONAUT_START_MAP_POS });
    setFacing('right');
    setIsMoving(false);
    setWalkBobY(0);
    setNearbyTarget(null);
    setShowDamagedNotice(false);
    setTakeoffProgress(0);
    setActiveEquipment(null);
    setPhase('map');
    retroAudio.playEnterStage();
  }, []);

  // Support ?autostart=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      startMission();
    }
  }, [startMission]);

  const interactWithTarget = useCallback((target: InteractiveTarget) => {
    if (phaseRef.current !== 'map') return;
    keysPressedRef.current.clear();
    walkTargetRef.current = null;
    setIsMoving(false);
    setWalkBobY(0);

    if (target === 'nave') {
      const count = countCollectedParts(inventoryRef.current);
      if (isNaveReady(count)) {
        setShowDamagedNotice(false);
        takeoffRef.current = 0;
        setTakeoffProgress(0);
        setPhase('takeoff');
        retroAudio.playEnterStage();
      } else {
        setShowDamagedNotice(true);
        retroAudio.playHurt();
      }
      return;
    }

    setShowDamagedNotice(false);
    setActiveEquipment(target);
    setPhase('equipment');
    retroAudio.playEnterStage();
  }, []);

  // Keyboard listeners: WASD / Arrows for 60fps free movement + E / Space to interact + M mute
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        retroAudio.muted = !retroAudio.muted;
        setMuted(retroAudio.muted);
        return;
      }

      if (phaseRef.current === 'intro' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        startMission();
        return;
      }

      if (phaseRef.current !== 'map') return;

      if (MOVE_KEYS.has(e.code)) {
        e.preventDefault();
        keysPressedRef.current.add(e.code);
        walkTargetRef.current = null;
        return;
      }

      if (e.code === 'KeyE' || e.code === 'Space') {
        if (nearbyRef.current) {
          e.preventDefault();
          interactWithTarget(nearbyRef.current);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (MOVE_KEYS.has(e.code)) {
        keysPressedRef.current.delete(e.code);
      }
    };

    const onBlur = () => {
      keysPressedRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [interactWithTarget, startMission]);

  // 60 FPS requestAnimationFrame loop for free movement, proximity check, and takeoff
  useEffect(() => {
    let rafId = 0;
    let last = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;

      if (phaseRef.current === 'takeoff') {
        takeoffRef.current = Math.min(1, takeoffRef.current + dt / 3.2);
        setTakeoffProgress(takeoffRef.current);
        if (takeoffRef.current >= 1) {
          phaseRef.current = 'final';
          setPhase('final');
          retroAudio.playVictory();
        }
      } else if (phaseRef.current === 'map') {
        const keys = keysPressedRef.current;
        let dx = 0;
        let dy = 0;

        if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
        if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;

        const speedY = 26; // % of stage height per second
        const speedX = speedY / MAP_ASPECT_RATIO; // visually uniform speed
        let movingNow = false;

        if (dx !== 0 || dy !== 0) {
          const len = Math.hypot(dx, dy);
          dx /= len;
          dy /= len;
          const next = clampToLunarSurface(
            astroPosRef.current.x + dx * speedX * dt,
            astroPosRef.current.y + dy * speedY * dt
          );
          astroPosRef.current = next;
          setAstroPos(next);
          if (dx < -0.05) setFacing('left');
          else if (dx > 0.05) setFacing('right');
          movingNow = true;
        } else if (walkTargetRef.current) {
          const target = walkTargetRef.current;
          const vx = (target.x - astroPosRef.current.x) * MAP_ASPECT_RATIO;
          const vy = target.y - astroPosRef.current.y;
          const dist = Math.hypot(vx, vy);
          const stepDist = speedY * dt;

          if (dist <= stepDist + 0.35) {
            astroPosRef.current = target;
            walkTargetRef.current = null;
            setAstroPos(target);
            movingNow = false;
          } else {
            const nx = vx / dist;
            const ny = vy / dist;
            const next = clampToLunarSurface(
              astroPosRef.current.x + nx * speedX * dt,
              astroPosRef.current.y + ny * speedY * dt
            );
            astroPosRef.current = next;
            setAstroPos(next);
            if (nx < -0.05) setFacing('left');
            else if (nx > 0.05) setFacing('right');
            movingNow = true;
          }
        }

        setIsMoving(movingNow);
        setWalkBobY(movingNow ? Math.abs(Math.sin(elapsed * 13)) * -4 : 0);

        // Proximity detection against RTG, Surveyor 3, and Nave
        const candidates: { id: InteractiveTarget; d: number }[] = [
          { id: 'rtg', d: getMapDistance(astroPosRef.current, RTG_MAP_POS) },
          { id: 'surveyor3', d: getMapDistance(astroPosRef.current, SURVEYOR_MAP_POS) },
          { id: 'nave', d: getMapDistance(astroPosRef.current, NAVE_MAP_POS) },
        ];
        candidates.sort((a, b) => a.d - b.d);
        const closest =
          candidates[0].d <= PROXIMITY_RADIUS ? candidates[0].id : null;

        if (nearbyRef.current !== closest) {
          nearbyRef.current = closest;
          setNearbyTarget(closest);
          if (closest !== 'nave') {
            setShowDamagedNotice(false);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Free click/tap anywhere on the lunar map to walk to (x, y)
  const handleStageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (phaseRef.current !== 'map') return;
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
      const clamped = clampToLunarSurface(xPercent, yPercent);
      walkTargetRef.current = clamped;
      setShowDamagedNotice(false);
      retroAudio.playStep();
    },
    []
  );

  // Clicking directly on an object: opens immediately if near, otherwise walks to it
  const handleObjectClick = useCallback(
    (e: React.MouseEvent, target: InteractiveTarget, pos: Point2D) => {
      e.stopPropagation();
      if (phaseRef.current !== 'map') return;

      if (nearbyRef.current === target) {
        interactWithTarget(target);
        return;
      }

      const stopPoint = clampToLunarSurface(
        target === 'rtg' ? pos.x + 5 : target === 'surveyor3' ? pos.x - 5 : pos.x - 6,
        pos.y + 5
      );
      walkTargetRef.current = stopPoint;
      setShowDamagedNotice(false);
      retroAudio.playStep();
    },
    [interactWithTarget]
  );

  const handleCollectPart = useCallback((partKey: PartKey) => {
    setInventory((prev) => {
      if (prev[partKey]) return prev;
      const next = { ...prev, [partKey]: true };
      inventoryRef.current = next;
      retroAudio.playCollect();
      return next;
    });
  }, []);

  const handleProgressChange = useCallback(
    (equipmentId: EquipmentId, progress: EquipmentProgress) => {
      setEquipmentProgress((prev) => {
        const cur = prev[equipmentId];
        if (
          cur.step === progress.step &&
          cur.balloonIdx === progress.balloonIdx &&
          cur.selectedQ1 === progress.selectedQ1 &&
          cur.selectedQ2 === progress.selectedQ2 &&
          cur.completed === progress.completed
        ) {
          return prev;
        }
        return { ...prev, [equipmentId]: progress };
      });
    },
    []
  );

  const handleCompleteEquipment = useCallback((equipmentId: EquipmentId) => {
    setEquipmentProgress((prev) => {
      if (prev[equipmentId].completed) return prev;
      retroAudio.playVictory();
      return {
        ...prev,
        [equipmentId]: { ...prev[equipmentId], step: 9, completed: true },
      };
    });
  }, []);

  const handleCloseModalToMap = useCallback(() => {
    setActiveEquipment(null);
    setPhase('map');
  }, []);

  // Takeoff interpolation along curved path toward Earth
  const takeoffEase =
    takeoffProgress < 0.18
      ? 0
      : Math.pow((takeoffProgress - 0.18) / 0.82, 1.5);
  const takeoffX =
    NAVE_MAP_POS.x + takeoffEase * (EARTH_MAP_POS.x - NAVE_MAP_POS.x);
  const takeoffY =
    NAVE_MAP_POS.y - takeoffEase * (NAVE_MAP_POS.y - EARTH_MAP_POS.y);
  const takeoffScale = Math.max(0.22, 1 - takeoffEase * 0.78);
  const takeoffRotate = takeoffEase * 32;

  return (
    <main className="relative w-screen h-screen bg-[#040318] flex items-center justify-center overflow-hidden">
      {/* 16:9 Lunar Map Stage preserving exact aspect ratio of mapa_lunar.png */}
      <div
        ref={stageRef}
        data-testid="lunar-map-stage"
        onClick={handleStageClick}
        className="relative aspect-[1376/768] w-[min(100vw,calc(100vh*1376/768))] h-[min(100vh,calc(100vw*768/1376))] overflow-hidden select-none cursor-crosshair"
      >
        {/* 1. Background Map Image (mapa_lunar.png) */}
        <img
          src="/mapa_lunar.png"
          alt={ui.mapAlt}
          draggable={false}
          style={{ background: 'transparent', mixBlendMode: 'normal' }}
          className="absolute inset-0 w-full h-full object-contain pixelated pointer-events-none select-none"
        />

        {/* 2. RTG (Left equipment at end of left dotted trail) */}
        <div
          style={{ left: `${RTG_MAP_POS.x}%`, top: `${RTG_MAP_POS.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-[68%] z-10 flex flex-col items-center"
        >
          {phase === 'map' && nearbyTarget === 'rtg' && (
            <button
              type="button"
              data-testid="interact-rtg"
              onClick={(e) => {
                e.stopPropagation();
                interactWithTarget('rtg');
              }}
              className="mb-1.5 whitespace-nowrap font-pixel text-[10px] md:text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2.5 py-1 border-2 border-slate-950 shadow-[0_3px_0_#040318] cursor-pointer"
            >
              {ui.interactPrompt}
            </button>
          )}

          <button
            type="button"
            data-testid="object-rtg"
            onClick={(e) => handleObjectClick(e, 'rtg', RTG_MAP_POS)}
            aria-label="RTG"
            className={`group relative cursor-pointer transition-transform duration-150 ${
              nearbyTarget === 'rtg' ? 'scale-105' : 'hover:scale-105'
            }`}
          >
            <img
              src="/rtg.png"
              alt="RTG"
              draggable={false}
              style={{ background: 'transparent', mixBlendMode: 'normal' }}
              className="w-14 h-20 md:w-20 md:h-28 object-contain pixelated drop-shadow-[0_6px_6px_rgba(0,0,0,0.65)]"
            />
          </button>

          <span
            data-testid="label-rtg"
            className={`mt-1 whitespace-nowrap font-pixel text-[10px] md:text-[11px] px-2 py-0.5 border bg-[#090b1f]/90 ${
              equipmentProgress.rtg.completed
                ? 'border-emerald-400 text-emerald-300'
                : 'border-cyan-400/70 text-cyan-200'
            }`}
          >
            {equipmentProgress.rtg.completed ? `RTG · ${ui.completedBadge}` : 'RTG'}
          </span>
        </div>

        {/* 3. Surveyor 3 (Right equipment at end of right dotted trail) */}
        <div
          style={{ left: `${SURVEYOR_MAP_POS.x}%`, top: `${SURVEYOR_MAP_POS.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-[68%] z-10 flex flex-col items-center"
        >
          {phase === 'map' && nearbyTarget === 'surveyor3' && (
            <button
              type="button"
              data-testid="interact-surveyor3"
              onClick={(e) => {
                e.stopPropagation();
                interactWithTarget('surveyor3');
              }}
              className="mb-1.5 whitespace-nowrap font-pixel text-[10px] md:text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2.5 py-1 border-2 border-slate-950 shadow-[0_3px_0_#040318] cursor-pointer"
            >
              {ui.interactPrompt}
            </button>
          )}

          <button
            type="button"
            data-testid="object-surveyor3"
            onClick={(e) => handleObjectClick(e, 'surveyor3', SURVEYOR_MAP_POS)}
            aria-label="Surveyor 3"
            className={`group relative cursor-pointer transition-transform duration-150 ${
              nearbyTarget === 'surveyor3' ? 'scale-105' : 'hover:scale-105'
            }`}
          >
            <img
              src="/surveyor3.png"
              alt="Surveyor 3"
              draggable={false}
              style={{ background: 'transparent', mixBlendMode: 'normal' }}
              className="w-20 h-20 md:w-28 md:h-28 object-contain pixelated drop-shadow-[0_6px_6px_rgba(0,0,0,0.65)]"
            />
          </button>

          <span
            data-testid="label-surveyor3"
            className={`mt-1 whitespace-nowrap font-pixel text-[10px] md:text-[11px] px-2 py-0.5 border bg-[#090b1f]/90 ${
              equipmentProgress.surveyor3.completed
                ? 'border-emerald-400 text-emerald-300'
                : 'border-amber-400/70 text-amber-200'
            }`}
          >
            {equipmentProgress.surveyor3.completed
              ? `Surveyor 3 · ${ui.completedBadge}`
              : 'Surveyor 3'}
          </span>
        </div>

        {/* 4. Central Nave (nave.png) */}
        <div
          style={{
            left: `${phase === 'takeoff' ? takeoffX : NAVE_MAP_POS.x}%`,
            top: `${phase === 'takeoff' ? takeoffY : NAVE_MAP_POS.y}%`,
            transform:
              phase === 'takeoff'
                ? `translate(-50%, -65%) scale(${takeoffScale}) rotate(${takeoffRotate}deg)`
                : 'translate(-50%, -65%)',
          }}
          className="absolute z-10 flex flex-col items-center"
        >
          {phase === 'map' && nearbyTarget === 'nave' && (
            <button
              type="button"
              data-testid="interact-nave"
              onClick={(e) => {
                e.stopPropagation();
                interactWithTarget('nave');
              }}
              className="mb-1.5 whitespace-nowrap font-pixel text-[10px] md:text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-2.5 py-1 border-2 border-slate-950 shadow-[0_3px_0_#040318] cursor-pointer"
            >
              {ui.interactPrompt}
            </button>
          )}

          <button
            type="button"
            data-testid="object-nave"
            disabled={phase === 'takeoff'}
            onClick={(e) => handleObjectClick(e, 'nave', NAVE_MAP_POS)}
            aria-label={ui.shipLabel}
            className={`relative focus:outline-none transition-transform duration-150 ${
              phase === 'takeoff'
                ? 'cursor-default'
                : naveReady
                ? 'cursor-pointer hover:scale-105'
                : 'cursor-pointer hover:scale-[1.02]'
            }`}
          >
            {/* Pulsing emerald/cyan readiness aura when 4/4 repaired */}
            {naveReady && phase !== 'takeoff' && (
              <span
                aria-hidden="true"
                className="absolute inset-0 -m-2 rounded-full border-2 border-emerald-400/80 shadow-[0_0_24px_rgba(52,211,153,0.75)] animate-pulse pointer-events-none"
              />
            )}

            {/* Subtle smoke puffs when damaged (0/4 to 3/4) */}
            {!naveReady && phase === 'map' && (
              <span
                aria-hidden="true"
                className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800/75 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-orange-500/80 animate-pulse" />
              </span>
            )}

            <img
              src="/nave.png"
              alt={ui.shipLabel}
              draggable={false}
              style={{ background: 'transparent', mixBlendMode: 'normal' }}
              className="w-24 h-24 md:w-32 md:h-32 object-contain pixelated drop-shadow-[0_8px_8px_rgba(0,0,0,0.7)]"
            />

            {/* Takeoff thruster flame */}
            {phase === 'takeoff' && (
              <span
                aria-hidden="true"
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-8 bg-gradient-to-b from-yellow-200 via-orange-500 to-transparent rounded-full blur-[1px] pointer-events-none"
              />
            )}
          </button>

          {phase !== 'takeoff' && (
            <span
              className={`mt-1 whitespace-nowrap font-pixel text-[10px] md:text-[11px] px-2 py-0.5 border bg-[#090b1f]/90 ${
                naveReady
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-slate-500 text-slate-200'
              }`}
            >
              {naveReady ? ui.shipReadyLabel : ui.shipLabel}
            </span>
          )}
        </div>

        {/* 5. Free-Roaming Astronaut (astronauta.png) */}
        {phase !== 'takeoff' && phase !== 'final' && (
          <div
            data-testid="astronaut-sprite"
            style={{
              left: `${astroPos.x}%`,
              top: `${astroPos.y}%`,
              transform: `translate(-50%, -88%)`,
            }}
            className="absolute z-20 pointer-events-none flex flex-col items-center"
          >
            <img
              src="/astronauta.png"
              alt={ui.astronautAlt}
              draggable={false}
              style={{
                background: 'transparent',
                mixBlendMode: 'normal',
                transform: `scaleX(${facing === 'right' ? -1 : 1}) translateY(${walkBobY}px)`,
              }}
              className="w-12 h-16 md:w-16 md:h-20 object-contain pixelated drop-shadow-[0_4px_4px_rgba(0,0,0,0.7)]"
            />
            <span
              aria-hidden="true"
              className={`w-8 h-2 -mt-1 rounded-full bg-black/50 ${
                isMoving ? 'scale-x-90' : 'scale-x-100'
              }`}
            />
          </div>
        )}

        {/* Takeoff Banner */}
        {phase === 'takeoff' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#040318]/90 border-2 border-amber-400 px-6 py-2.5 font-pixel text-xs md:text-sm text-amber-300 whitespace-nowrap">
            {takeoffProgress < 0.25 ? ui.takeoffIgnition : ui.takeoffReturning}
          </div>
        )}
      </div>

      {/* TOP HUD (Visible during map & equipment exploration) */}
      {(phase === 'map' || phase === 'equipment') && (
        <div className="fixed top-0 left-0 right-0 z-20 flex flex-wrap md:flex-nowrap items-start justify-between gap-3 p-3 md:p-4 pointer-events-none">
          {/* Repair Progress Bar with Gear Icon & "X/4 materiais" */}
          <div className="pointer-events-auto shrink-0 bg-[#0b1120]/95 border-2 border-slate-600 px-4 py-2.5 shadow-[0_4px_0_#040318]">
            <div className="flex items-center gap-2.5 mb-2">
              <Settings
                className={`w-4 h-4 ${naveReady ? 'text-emerald-400' : 'text-amber-300'}`}
                aria-hidden="true"
              />
              <span className="font-pixel text-xs text-slate-100">{ui.shipRepairHud}</span>
              <span
                data-testid="materials-counter"
                className={`font-mono-tabular font-bold text-xs px-2 py-0.5 border ${
                  naveReady
                    ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                    : 'bg-slate-900 border-slate-600 text-amber-300'
                }`}
              >
                {collectedCount}/{TOTAL_REQUIRED_PARTS} {ui.materialsUnit}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 w-52">
              {[
                inventory.peca1_cameraTV,
                inventory.peca2_conchaColetora,
                inventory.peca3_termopares,
                inventory.peca4_condicionamentoEnergia,
              ].map((filled, idx) => (
                <div
                  key={idx}
                  className={`h-2.5 border ${
                    filled
                      ? naveReady
                        ? 'bg-emerald-400 border-emerald-200'
                        : 'bg-amber-400 border-amber-200'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Top-Center Mission Guidance Speech Bubble ("balãozinho" da missão) */}
          {phase === 'map' && (
            <div
              data-testid="mission-bubble"
              role="status"
              className={`pointer-events-auto relative order-3 md:order-2 w-full md:w-auto md:max-w-lg mx-auto flex items-center gap-3 px-3.5 py-2 border-2 shadow-[0_4px_0_#040318] ${
                naveReady
                  ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100'
                  : 'bg-[#0b1120]/95 border-cyan-400 text-slate-100'
              }`}
            >
              <img
                src="/astronauta.png"
                alt=""
                aria-hidden="true"
                style={{ background: 'transparent', mixBlendMode: 'normal' }}
                className="w-8 h-10 object-contain pixelated shrink-0"
              />
              <div className="min-w-0">
                <div
                  className={`font-pixel text-[10px] mb-0.5 ${
                    naveReady ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {ui.missionObjectiveTitle}
                </div>
                <p className="text-xs leading-snug">{missionBubbleText}</p>
              </div>
              <span
                aria-hidden="true"
                className={`hidden md:block absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r-2 border-b-2 ${
                  naveReady
                    ? 'bg-emerald-950 border-emerald-400'
                    : 'bg-[#0b1120] border-cyan-400'
                }`}
              />
            </div>
          )}

          {/* Right Language & Audio Controls */}
          <div className="pointer-events-auto order-2 md:order-3 shrink-0 flex items-center gap-2">
            <LanguageToggle lang={lang} onChange={handleChangeLang} />
            <button
              type="button"
              onClick={() => {
                retroAudio.muted = !retroAudio.muted;
                setMuted(retroAudio.muted);
              }}
              aria-label={muted ? ui.soundEnableAria : ui.soundMuteAria}
              className="flex items-center gap-1.5 font-pixel text-[11px] bg-[#0b1120]/95 hover:bg-slate-800 text-slate-200 border-2 border-slate-600 px-3 py-2 shadow-[0_4px_0_#040318] cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{muted ? ui.soundMuted : ui.soundOn}</span>
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS & STATUS NOTICE */}
      {phase === 'map' && (
        <div className="fixed bottom-3 left-0 right-0 z-20 flex flex-col items-center gap-2 px-4 pointer-events-none">
          {naveStatusMessage && (
            <div
              role="status"
              className="pointer-events-auto bg-amber-950/95 border-2 border-amber-400 text-amber-100 font-pixel text-[11px] px-4 py-2 shadow-[0_3px_0_#040318] text-center"
            >
              {naveStatusMessage}
            </div>
          )}

          {naveReady && (
            <button
              type="button"
              onClick={() => {
                if (nearbyTarget === 'nave') {
                  interactWithTarget('nave');
                } else {
                  walkTargetRef.current = clampToLunarSurface(
                    NAVE_MAP_POS.x - 6,
                    NAVE_MAP_POS.y + 5
                  );
                }
              }}
              className="pointer-events-auto flex items-center gap-2 font-pixel text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-5 py-2.5 border-2 border-slate-950 shadow-[0_4px_0_#040318] cursor-pointer"
            >
              <Rocket className="w-4 h-4" aria-hidden="true" />
              <span>{ui.shipReadyBanner}</span>
            </button>
          )}

          <div className="pointer-events-auto bg-[#0b1120]/90 border border-slate-700 px-4 py-1.5 text-[11px] font-pixel text-slate-300 text-center shadow-[0_3px_0_#040318]">
            {ui.controlsHint}
          </div>
        </div>
      )}

      {/* INTRO MODAL */}
      {phase === 'intro' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#040318]/75 p-4 pointer-events-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="intro-title"
            className="w-full max-w-lg bg-[#0b1120] border-2 border-slate-500 p-6 md:p-8 shadow-[0_8px_0_#040318] text-center space-y-5"
          >
            <div className="flex justify-end">
              <LanguageToggle lang={lang} onChange={handleChangeLang} />
            </div>
            <div className="text-xs font-pixel text-cyan-300 tracking-widest">
              {ui.introBadge}
            </div>
            <h1 id="intro-title" className="font-pixel text-2xl md:text-3xl text-amber-300">
              {ui.introTitle}
            </h1>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed">
              {ui.introText}
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startMission}
              className="font-pixel text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-8 py-3.5 border-2 border-slate-950 shadow-[0_4px_0_#040318] cursor-pointer"
            >
              {ui.startMissionBtn}
            </button>
          </div>
        </div>
      )}

      {/* 9-STAGE EQUIPMENT MODAL (Isolated per equipment) */}
      {phase === 'equipment' && activeEquipment && (
        <EquipmentModal
          key={activeEquipment}
          equipmentId={activeEquipment}
          lang={lang}
          onChangeLang={handleChangeLang}
          inventory={inventory}
          initialProgress={equipmentProgress[activeEquipment]}
          autoTts={autoTts}
          onToggleAutoTts={() => setAutoTts((v) => !v)}
          onProgressChange={handleProgressChange}
          onCollectPart={handleCollectPart}
          onCompleteEquipment={handleCompleteEquipment}
          onCloseToMap={handleCloseModalToMap}
        />
      )}

      {/* FINAL SCREEN WITH NASA LINKS */}
      {phase === 'final' && (
        <FinalScreen
          lang={lang}
          onChangeLang={handleChangeLang}
          onPlayAgain={startMission}
        />
      )}
    </main>
  );
}
