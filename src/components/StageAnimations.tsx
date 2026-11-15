import React, { useEffect, useState } from 'react';
import { Flame, Snowflake, Zap, Cpu } from 'lucide-react';
import { EquipmentId, NEIL_ARMSTRONG_QUOTE } from '../game/missionData';

export const StageAnimationView: React.FC<{ equipmentId: EquipmentId }> = ({
  equipmentId,
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setElapsed((now - start) / 1000);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [equipmentId]);

  if (equipmentId === 'surveyor3') {
    const t = elapsed % 15.0;
    // 1967 descent + 2 bounces (10m and 3m) + settle
    let s3OffsetY = 0;
    let s3Engine = false;
    if (t < 1.6) {
      const p = t / 1.6;
      s3OffsetY = -115 * (1 - p);
      s3Engine = p > 0.35 && p < 0.96;
    } else if (t < 2.8) {
      const p = (t - 1.6) / 1.2;
      s3OffsetY = -Math.sin(p * Math.PI) * 52;
    } else if (t < 3.6) {
      const p = (t - 2.8) / 0.8;
      s3OffsetY = -Math.sin(p * Math.PI) * 22;
    }

    // 1969 Apollo 12 arrival + astronaut walk + US flag plant + Neil Armstrong quote
    const showApollo = t >= 4.2;
    let lmOffsetY = 0;
    let lmFlame = false;
    if (showApollo && t < 5.8) {
      const p = (t - 4.2) / 1.6;
      const ease = 1 - Math.pow(1 - p, 2);
      lmOffsetY = -115 * (1 - ease);
      lmFlame = p < 0.94;
    }

    const walkStarted = t >= 6.1;
    const walkProg = walkStarted ? Math.min(1, (t - 6.1) / 2.6) : 0;
    const astroLeftPercent = 24 + walkProg * 32;
    const astroBob = walkStarted && walkProg < 1 ? Math.abs(Math.sin(t * 10)) * -4 : 0;

    const flagPlanted = t >= 8.9;
    const flagDropY = flagPlanted ? Math.max(0, (1 - Math.min(1, (t - 8.9) / 0.35)) * -18) : -18;

    return (
      <div className="relative w-full max-w-[540px] aspect-[16/9] mx-auto border-2 border-slate-700 overflow-hidden bg-[#040318]">
        <img
          src="/mapa_lunar.png"
          alt="Superfície lunar"
          style={{ background: 'transparent', mixBlendMode: 'normal' }}
          className="w-full h-full object-cover object-bottom pixelated opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040318]/45 via-transparent to-[#040318]/35 pointer-events-none" />

        {/* Year Header */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-[#090b1f]/90 border border-slate-600 font-pixel text-[10px] text-amber-300 z-10">
          {t < 4.2
            ? '1967 · SURVEYOR 3 (2 QUICOS)'
            : flagPlanted
            ? '1969 · BANDEIRA NA LUA & HOMENAGEM APOLLO'
            : '1969 · APOLLO 12 VISITANDO A SONDA'}
        </div>

        {/* Surveyor 3 Probe (Right) */}
        <div
          className="absolute bottom-[13%] right-[12%] w-20 h-20 flex items-center justify-center"
          style={{ transform: `translateY(${s3OffsetY}px)` }}
        >
          <img
            src="/surveyor3.png"
            alt="Surveyor 3"
            style={{ background: 'transparent', mixBlendMode: 'normal' }}
            className="w-full h-full object-contain pixelated drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]"
          />
          {s3Engine && (
            <div className="absolute -bottom-2 w-4 h-4 bg-amber-400/90 blur-[2px] rounded-full" />
          )}
        </div>

        {/* Apollo Lander (Left) */}
        {showApollo && (
          <div
            className="absolute bottom-[13%] left-[7%] w-20 h-20 flex items-center justify-center"
            style={{ transform: `translateY(${lmOffsetY}px)` }}
          >
            <img
              src="/nave.png"
              alt="Módulo Lunar Apollo"
              style={{ background: 'transparent', mixBlendMode: 'normal' }}
              className="w-full h-full object-contain pixelated drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]"
            />
            {lmFlame && (
              <div className="absolute -bottom-2 w-5 h-5 bg-orange-400/90 blur-[2px] rounded-full" />
            )}
          </div>
        )}

        {/* Planted US Flag right next to the astronaut */}
        {flagPlanted && (
          <div
            data-testid="planted-us-flag"
            className="absolute bottom-[14%] left-[63.5%] w-11 h-14 z-10"
            style={{ transform: `translateY(${flagDropY}px)` }}
          >
            <img
              src="/bandeira_eua.png"
              alt="Bandeira americana na Lua"
              style={{ background: 'transparent', mixBlendMode: 'normal' }}
              className="w-full h-full object-contain pixelated drop-shadow-[0_3px_3px_rgba(0,0,0,0.7)]"
            />
          </div>
        )}

        {/* Neil Armstrong Speech Bubble above Astronaut after planting flag */}
        {flagPlanted && (
          <div
            data-testid="neil-quote-bubble"
            className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[82%] max-w-[390px] z-20 bg-[#0b1120]/95 border-2 border-amber-300 px-3.5 py-2.5 shadow-[0_4px_0_#040318]"
          >
            <p className="text-xs md:text-[13px] text-white leading-snug font-medium">
              "{NEIL_ARMSTRONG_QUOTE}"
            </p>
            <div className="mt-1 text-[10px] font-pixel text-amber-300 text-right">
              — Neil Armstrong (Apollo 11, 1969)
            </div>
          </div>
        )}

        {/* Astronaut walking to Surveyor 3 and planting the flag */}
        {walkStarted && (
          <div
            className="absolute bottom-[13%] w-12 h-15 z-10"
            style={{
              left: `${astroLeftPercent}%`,
              transform: `translateY(${astroBob}px)`,
            }}
          >
            <img
              src="/astronauta.png"
              alt="Astronauta na Lua"
              style={{
                background: 'transparent',
                mixBlendMode: 'normal',
                transform: 'scaleX(-1)',
              }}
              className="w-full h-full object-contain pixelated drop-shadow-[0_3px_3px_rgba(0,0,0,0.7)]"
            />
          </div>
        )}
      </div>
    );
  }

  // RTG Stage 9: Seebeck Effect Schematic alongside clean proportional RTG sprite
  const pulseStep = Math.floor(elapsed * 2) % 3;

  return (
    <div className="w-full max-w-[540px] mx-auto border-2 border-slate-700 bg-[#070b16] p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-pixel text-[10px] text-cyan-300">
          EFEITO SEEBECK · MODELO SNAP-27
        </span>
        <span className="font-mono-tabular text-xs font-bold text-amber-300">
          ~70 W contínuos
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-20 h-28 shrink-0 flex items-center justify-center bg-slate-950/70 border border-slate-800 p-2">
          <img
            src="/rtg.png"
            alt="RTG SNAP-27"
            style={{ background: 'transparent', mixBlendMode: 'normal' }}
            className="w-full h-full object-contain pixelated"
          />
        </div>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
          <div
            className={`p-2.5 border text-center transition-colors ${
              pulseStep === 0
                ? 'border-orange-400 bg-orange-950/50'
                : 'border-slate-700 bg-slate-900/70'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <div className="font-pixel text-[9px] leading-tight text-orange-300">
              Plutônio 238
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">Lado Quente</div>
          </div>

          <div
            className={`p-2.5 border text-center transition-colors ${
              pulseStep === 1
                ? 'border-amber-400 bg-amber-950/40'
                : 'border-slate-700 bg-slate-900/70'
            }`}
          >
            <Cpu className="w-4 h-4 text-amber-300 mx-auto mb-1" />
            <div className="font-pixel text-[9px] leading-tight text-amber-200">
              442 Pares
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">Termopares</div>
          </div>

          <div
            className={`p-2.5 border text-center transition-colors ${
              pulseStep === 1
                ? 'border-cyan-400 bg-cyan-950/40'
                : 'border-slate-700 bg-slate-900/70'
            }`}
          >
            <Snowflake className="w-4 h-4 text-cyan-300 mx-auto mb-1" />
            <div className="font-pixel text-[9px] leading-tight text-cyan-200">
              Aletas Frias
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">Lado Frio</div>
          </div>

          <div
            className={`p-2.5 border text-center transition-colors ${
              pulseStep === 2
                ? 'border-emerald-400 bg-emerald-950/50'
                : 'border-slate-700 bg-slate-900/70'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-300 mx-auto mb-1" />
            <div className="font-pixel text-[9px] leading-tight text-emerald-300">
              Energia ~70W
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">Sem peças móveis</div>
          </div>
        </div>
      </div>
    </div>
  );
};
