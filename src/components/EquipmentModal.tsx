import React, { useEffect, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Cpu,
  Pickaxe,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  EQUIPMENT_SCRIPTS,
  EquipmentId,
  EquipmentProgress,
  PartKey,
  QuizQuestion,
  RepairInventory,
  RewardCard,
  StageStep,
  evaluateQuizAnswer,
} from '../game/missionData';
import { tts } from '../game/tts';
import { StageAnimationView } from './StageAnimations';

interface EquipmentModalProps {
  equipmentId: EquipmentId;
  inventory: RepairInventory;
  initialProgress: EquipmentProgress;
  autoTts: boolean;
  onToggleAutoTts: () => void;
  onProgressChange: (equipmentId: EquipmentId, progress: EquipmentProgress) => void;
  onCollectPart: (partKey: PartKey) => void;
  onCompleteEquipment: (equipmentId: EquipmentId) => void;
  onCloseToMap: () => void;
}

const PartVisualIcon: React.FC<{ partKey: PartKey }> = ({ partKey }) => {
  switch (partKey) {
    case 'peca1_cameraTV':
      return <Camera className="w-7 h-7 text-amber-300" aria-hidden="true" />;
    case 'peca2_conchaColetora':
      return <Pickaxe className="w-7 h-7 text-amber-300" aria-hidden="true" />;
    case 'peca3_termopares':
      return <Cpu className="w-7 h-7 text-cyan-300" aria-hidden="true" />;
    case 'peca4_condicionamentoEnergia':
      return <Zap className="w-7 h-7 text-emerald-300" aria-hidden="true" />;
  }
};

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  equipmentId,
  inventory,
  initialProgress,
  autoTts,
  onToggleAutoTts,
  onProgressChange,
  onCollectPart,
  onCompleteEquipment,
  onCloseToMap,
}) => {
  const script = EQUIPMENT_SCRIPTS[equipmentId];
  const equipmentImg = equipmentId === 'surveyor3' ? '/surveyor3.png' : '/rtg.png';
  const [isReadOnlySummary] = useState<boolean>(() => initialProgress.completed);

  const [step, setStep] = useState<StageStep>(initialProgress.step);
  const [balloonIdx, setBalloonIdx] = useState(initialProgress.balloonIdx);
  const [selectedQ1, setSelectedQ1] = useState<'A' | 'B' | 'C' | null>(
    initialProgress.selectedQ1
  );
  const [selectedQ2, setSelectedQ2] = useState<'A' | 'B' | 'C' | null>(
    initialProgress.selectedQ2
  );
  const [speakingCode, setSpeakingCode] = useState<string | null>(null);

  // Stop speech when unmounting or closing
  useEffect(() => {
    return () => {
      tts.stop();
    };
  }, []);

  // Persist progress whenever active state changes
  useEffect(() => {
    if (isReadOnlySummary) return;
    onProgressChange(equipmentId, {
      step,
      balloonIdx,
      selectedQ1,
      selectedQ2,
      completed: step === 9,
    });
  }, [
    equipmentId,
    step,
    balloonIdx,
    selectedQ1,
    selectedQ2,
    isReadOnlySummary,
    onProgressChange,
  ]);

  // Mark equipment complete on reaching step 9 (only after both exclusive pieces are collected and Block C finished)
  useEffect(() => {
    if (!isReadOnlySummary && step === 9) {
      onCompleteEquipment(equipmentId);
    }
  }, [step, equipmentId, isReadOnlySummary, onCompleteEquipment]);

  const currentBalloons =
    step === 2 ? script.blockA : step === 5 ? script.blockB : step === 8 ? script.blockC : null;

  const currentSpeech =
    !isReadOnlySummary && currentBalloons
      ? currentBalloons[balloonIdx]
      : !isReadOnlySummary && step === 4
      ? { code: script.reward1.speechCode, text: script.reward1.speechText }
      : !isReadOnlySummary && step === 7
      ? { code: script.reward2.speechCode, text: script.reward2.speechText }
      : null;

  // Auto-speak when enabled and speech changes
  useEffect(() => {
    if (!autoTts || !currentSpeech) return;
    setSpeakingCode(currentSpeech.code);
    tts.speak(currentSpeech.text, () => setSpeakingCode(null));
  }, [autoTts, currentSpeech?.code]);

  const handleSpeakClick = (code: string, text: string) => {
    if (speakingCode === code) {
      tts.stop();
      setSpeakingCode(null);
      return;
    }
    setSpeakingCode(code);
    tts.speak(text, () => setSpeakingCode(null));
  };

  const handleContinueBalloon = () => {
    tts.stop();
    setSpeakingCode(null);
    if (!currentBalloons) return;
    if (balloonIdx < currentBalloons.length - 1) {
      setBalloonIdx((i) => i + 1);
    } else {
      setBalloonIdx(0);
      if (step === 2) setStep(3);
      else if (step === 5) setStep(6);
      else if (step === 8) setStep(9);
    }
  };

  const handleCollectRewardPart = (reward: RewardCard, nextStep: StageStep) => {
    tts.stop();
    setSpeakingCode(null);
    if (!inventory[reward.partKey]) {
      onCollectPart(reward.partKey);
    }
    setStep(nextStep);
  };

  const handleCloseModal = () => {
    tts.stop();
    setSpeakingCode(null);
    if (!isReadOnlySummary) {
      // If player closes after collecting Reward 1 (step 4) or Reward 2 (step 7),
      // resume cleanly at the next story block (Bloco B or Bloco C) without repeating reward screens.
      const normalizedStep: StageStep =
        step === 4 ? 5 : step === 7 ? 8 : step;
      const normalizedBalloon = step === 4 || step === 7 ? 0 : balloonIdx;
      onProgressChange(equipmentId, {
        step: normalizedStep,
        balloonIdx: normalizedBalloon,
        selectedQ1,
        selectedQ2,
        completed: normalizedStep === 9,
      });
    }
    onCloseToMap();
  };

  const renderQuiz = (
    question: QuizQuestion,
    selected: 'A' | 'B' | 'C' | null,
    onSelect: (letter: 'A' | 'B' | 'C') => void,
    reward: RewardCard,
    nextStep: StageStep
  ) => {
    const evalResult = selected ? evaluateQuizAnswer(question, selected) : null;
    const alreadyOwned = inventory[reward.partKey];

    return (
      <div className="space-y-4">
        <div className="text-xs font-pixel text-amber-300">DESAFIO DE CONHECIMENTO</div>
        <h3 className="text-base md:text-lg font-semibold text-white leading-snug">
          {question.prompt}
        </h3>

        <div className="space-y-2.5">
          {question.options.map((opt) => {
            const isPicked = selected === opt.letter;
            const isRightOption = opt.letter === question.correctLetter;
            let borderClass =
              'border-slate-700 bg-slate-900/90 hover:border-cyan-400 text-slate-100';
            if (selected) {
              if (isRightOption) {
                borderClass = 'border-emerald-400 bg-emerald-950/60 text-emerald-100';
              } else if (isPicked) {
                borderClass = 'border-rose-400 bg-rose-950/60 text-rose-100';
              } else {
                borderClass = 'border-slate-800 bg-slate-900/50 text-slate-400';
              }
            }

            return (
              <button
                key={opt.letter}
                type="button"
                disabled={selected !== null}
                onClick={() => onSelect(opt.letter)}
                className={`w-full text-left px-4 py-3 border-2 transition-colors flex items-start gap-3 ${
                  selected === null ? 'cursor-pointer' : 'cursor-default'
                } ${borderClass}`}
              >
                <span className="font-pixel text-xs px-2 py-0.5 bg-slate-950 border border-slate-600 text-amber-300 shrink-0 mt-0.5">
                  {opt.letter}
                </span>
                <span className="text-sm leading-relaxed">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {evalResult && (
          <div
            role="status"
            className={`p-4 border-2 ${
              evalResult.isCorrect
                ? 'border-emerald-500/80 bg-emerald-950/40 text-emerald-100'
                : 'border-amber-500/80 bg-amber-950/40 text-amber-100'
            }`}
          >
            <p className="text-sm leading-relaxed">{evalResult.feedback}</p>
          </div>
        )}

        {selected && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              data-testid={`collect-${reward.partKey}`}
              onClick={() => handleCollectRewardPart(reward, nextStep)}
              className="font-pixel text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 border-2 border-slate-950 shadow-[0_3px_0_#05070e] cursor-pointer"
            >
              {alreadyOwned ? `Ver Peça: ${reward.partName}` : question.collectButtonLabel}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#040318]/80 p-3 md:p-6 pointer-events-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-modal-title"
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#0b1120] border-2 border-slate-500 shadow-[0_8px_0_#040318] text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#070b16] border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-xs text-cyan-300">{script.shortName}</span>
            <span className="text-xs text-slate-400 font-mono-tabular">
              {isReadOnlySummary ? 'Resumo · Concluído ✓' : `Etapa ${step}/9`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnlySummary && (
              <button
                type="button"
                onClick={onToggleAutoTts}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-pixel border border-slate-700 bg-slate-900 hover:border-slate-500 text-slate-200 cursor-pointer"
              >
                {autoTts ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{autoTts ? 'Auto-voz: ON' : 'Auto-voz: OFF'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-2.5 py-1.5 text-[11px] font-pixel border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 cursor-pointer"
            >
              Mapa
            </button>
          </div>
        </div>

        {/* Read-Only Summary View when equipment is already Concluído ✓ */}
        {isReadOnlySummary ? (
          <div className="p-5 md:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#070b16] border border-slate-700 p-4">
              <img
                src={equipmentImg}
                alt={script.shortName}
                style={{ background: 'transparent', mixBlendMode: 'normal' }}
                className="w-24 h-24 object-contain pixelated shrink-0"
              />
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-pixel text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluído ✓</span>
                </div>
                <h2
                  id="equipment-modal-title"
                  className="font-pixel text-base md:text-lg text-amber-300"
                >
                  {script.title}
                </h2>
                <p className="text-sm text-slate-200 leading-relaxed">{script.subtitle}</p>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-700 p-3.5 text-sm">
              <div className="text-[11px] font-pixel text-cyan-300 mb-1">
                {script.quickFactsLabel}
              </div>
              <p className="text-slate-200 leading-relaxed">{script.quickFacts}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[script.reward1, script.reward2].map((rw) => (
                <div
                  key={rw.partKey}
                  className="bg-emerald-950/35 border border-emerald-500/70 p-3.5 flex items-start gap-3"
                >
                  <div className="p-2 bg-slate-950 border border-slate-700 shrink-0">
                    <PartVisualIcon partKey={rw.partKey} />
                  </div>
                  <div className="space-y-1">
                    <div className="font-pixel text-xs text-emerald-300">
                      {rw.partName} · ✓
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rw.cardDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <StageAnimationView equipmentId={equipmentId} />
            <p className="text-center text-sm text-cyan-200">{script.animationCaption}</p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="font-pixel text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-6 py-3 border-2 border-slate-950 shadow-[0_3px_0_#040318] cursor-pointer"
              >
                {script.backButtonLabel}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 md:p-6">
            {/* ETAPA 1: Card Inicial do Equipamento */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#070b16] border border-slate-700 p-4">
                  <img
                    src={equipmentImg}
                    alt={script.shortName}
                    style={{ background: 'transparent', mixBlendMode: 'normal' }}
                    className="w-24 h-24 object-contain pixelated shrink-0"
                  />
                  <div className="space-y-2 text-center sm:text-left">
                    <h2
                      id="equipment-modal-title"
                      className="font-pixel text-base md:text-lg text-amber-300"
                    >
                      {script.title}
                    </h2>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {script.subtitle}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="bg-slate-900/70 border border-slate-700 p-3.5">
                    <div className="text-[11px] font-pixel text-cyan-300 mb-1">
                      {script.quickFactsLabel}
                    </div>
                    <p className="text-slate-200 leading-relaxed">{script.quickFacts}</p>
                  </div>
                  <div className="bg-slate-900/70 border border-slate-700 p-3.5">
                    <div className="text-[11px] font-pixel text-emerald-300 mb-1">
                      Peças desta etapa
                    </div>
                    <p className="text-slate-200">{script.stagePartsSummary}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setBalloonIdx(0);
                      setStep(2);
                    }}
                    className="font-pixel text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 border-2 border-slate-950 shadow-[0_3px_0_#040318] cursor-pointer"
                  >
                    {script.startButtonLabel}
                  </button>
                </div>
              </div>
            )}

            {/* ETAPAS 2, 5, 8: Blocos A, B, C (Balões sequenciais do astronauta) */}
            {(step === 2 || step === 5 || step === 8) && currentBalloons && (
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-pixel text-cyan-300">
                    {step === 2
                      ? 'Bloco A · Exploração'
                      : step === 5
                      ? 'Bloco B · Descoberta'
                      : 'Bloco C · História'}
                  </span>
                  <span className="font-mono-tabular">
                    Fala {balloonIdx + 1} de {currentBalloons.length}
                  </span>
                </div>

                <div className="flex items-start gap-4 bg-[#070b16] border-2 border-slate-600 p-4">
                  <img
                    src="/astronauta.png"
                    alt="Astronauta"
                    style={{ background: 'transparent', mixBlendMode: 'normal' }}
                    className="w-14 h-16 object-contain pixelated shrink-0 mt-1"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-tabular text-xs font-bold text-amber-300">
                        {currentBalloons[balloonIdx].code}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakClick(
                            currentBalloons[balloonIdx].code,
                            currentBalloons[balloonIdx].text
                          )
                        }
                        aria-label={`Ouvir fala ${currentBalloons[balloonIdx].code}`}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-pixel bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-200 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>
                          {speakingCode === currentBalloons[balloonIdx].code
                            ? 'Parar'
                            : 'Ouvir'}
                        </span>
                      </button>
                    </div>
                    <p className="text-base text-white leading-relaxed">
                      "{currentBalloons[balloonIdx].text}"
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleContinueBalloon}
                    className="font-pixel text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-6 py-3 border-2 border-slate-950 shadow-[0_3px_0_#040318] cursor-pointer"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: Pergunta 1 */}
            {step === 3 &&
              renderQuiz(
                script.question1,
                selectedQ1,
                setSelectedQ1,
                script.reward1,
                4
              )}

            {/* ETAPA 6: Pergunta 2 */}
            {step === 6 &&
              renderQuiz(
                script.question2,
                selectedQ2,
                setSelectedQ2,
                script.reward2,
                7
              )}

            {/* ETAPAS 4 e 7: Recompensas (aberta somente após clicar no botão de coleta) */}
            {(step === 4 || step === 7) &&
              (() => {
                const reward = step === 4 ? script.reward1 : script.reward2;
                const nextStep: StageStep = step === 4 ? 5 : 8;
                return (
                  <div className="space-y-5">
                    <div className="flex items-start gap-4 bg-[#070b16] border-2 border-slate-600 p-4">
                      <img
                        src="/astronauta.png"
                        alt="Astronauta"
                        style={{ background: 'transparent', mixBlendMode: 'normal' }}
                        className="w-14 h-16 object-contain pixelated shrink-0 mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono-tabular text-xs font-bold text-amber-300">
                            {reward.speechCode}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleSpeakClick(reward.speechCode, reward.speechText)
                            }
                            aria-label={`Ouvir fala ${reward.speechCode}`}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-pixel bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-200 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>
                              {speakingCode === reward.speechCode ? 'Parar' : 'Ouvir'}
                            </span>
                          </button>
                        </div>
                        <p className="text-base text-white leading-relaxed">
                          "{reward.speechText}"
                        </p>
                      </div>
                    </div>

                    <div className="bg-emerald-950/45 border-2 border-emerald-400 p-4 flex items-start gap-4">
                      <div className="relative p-3 bg-slate-950 border border-emerald-500/70 shrink-0 flex flex-col items-center gap-1.5">
                        <PartVisualIcon partKey={reward.partKey} />
                        <img
                          src={equipmentImg}
                          alt={reward.partName}
                          style={{ background: 'transparent', mixBlendMode: 'normal' }}
                          className="w-9 h-9 object-contain pixelated opacity-90"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="font-pixel text-[11px] text-emerald-200">
                          +1 MATERIAL ADICIONADO · {reward.partName}
                        </div>
                        <div className="font-pixel text-sm text-emerald-300">
                          {reward.cardTitle}
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {reward.cardDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          tts.stop();
                          setSpeakingCode(null);
                          setBalloonIdx(0);
                          setStep(nextStep);
                        }}
                        className="font-pixel text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 border-2 border-slate-950 shadow-[0_3px_0_#040318] cursor-pointer"
                      >
                        {reward.nextButtonLabel}
                      </button>
                    </div>
                  </div>
                );
              })()}

            {/* ETAPA 9: Animação Final e Encerramento */}
            {step === 9 && (
              <div className="space-y-4">
                <StageAnimationView equipmentId={equipmentId} />

                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-cyan-200">
                    {script.animationCaption}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-pixel text-emerald-300 bg-emerald-950/50 border border-emerald-500/70 px-3.5 py-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{script.completionNotice}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="font-pixel text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-6 py-3 border-2 border-slate-950 shadow-[0_3px_0_#040318] cursor-pointer"
                  >
                    {script.backButtonLabel}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
