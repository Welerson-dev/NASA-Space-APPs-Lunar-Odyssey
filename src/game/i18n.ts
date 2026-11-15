import {
  EQUIPMENT_SCRIPTS,
  EquipmentId,
  EquipmentProgress,
  EquipmentScript,
  FINAL_CARDS,
  FINAL_SCREEN_TITLE,
  FinalCardInfo,
  INTRO_MISSION_TEXT,
  NEIL_ARMSTRONG_QUOTE,
  RepairInventory,
  countCollectedParts,
  getMissionBubbleText,
} from './missionData';
import { AudioClip, Language } from './tts';

const SURVEYOR3_BLOCK_A_EN_AUDIO =
  '/assets/aistudio/ElevenLabs_2026-11-15T13_35_44_David_-_Real_and_Laid_Back_pvc_s50_sim75_v4_8bed7a25.mp3';
const EN_AUDIO_3 = '/assets/aistudio/3_017c2413.mp3';
const EN_AUDIO_4 = '/assets/aistudio/4_526953bc.mp3';
const EN_AUDIO_5 = '/assets/aistudio/5_487b62a8.mp3';
const EN_AUDIO_6 = '/assets/aistudio/6_17107dca.mp3';
const EN_AUDIO_7 = '/assets/aistudio/7_0181c58b.mp3';
const EN_AUDIO_8 = '/assets/aistudio/8_2f8f4d9e.mp3';
const EN_AUDIO_9 = '/assets/aistudio/9_74ec9603.mp3';
const EN_AUDIO_10 = '/assets/aistudio/10_d303bcfb.mp3';
const EN_AUDIO_11 = '/assets/aistudio/11_590ca3c0.mp3';
const EN_AUDIO_12 = '/assets/aistudio/12_1dce6267.mp3';
const EN_AUDIO_14 = '/assets/aistudio/14_0d055909.mp3';

export const EQUIPMENT_SCRIPTS_EN: Record<EquipmentId, EquipmentScript> = {
  surveyor3: {
    id: 'surveyor3',
    shortName: 'Surveyor 3',
    title: 'Surveyor 3, "The Lunar Soil Tester"',
    subtitle:
      'NASA robotic probe that landed on the Moon in 1967 to test whether the surface could support astronauts',
    quickFactsLabel: 'Quick Facts',
    quickFacts:
      'Landing: Apr 20, 1967 · Mass: approx. 998 kg (2,200 lb) · Site: southeast Oceanus Procellarum (3° S, 23.41° W)',
    stagePartsSummary: 'TV Camera System (1/4) and Soil Scoop Sampler (2/4)',
    startButtonLabel: 'Continue to reward',
    blockA: [
      {
        code: 'S3-A1',
        text: 'Look what we found! This is Surveyor 3, a robot probe that NASA sent to the Moon in 1967.',
        audioClip: { src: SURVEYOR3_BLOCK_A_EN_AUDIO, start: 0, end: 7.05 } satisfies AudioClip,
      },
      {
        code: 'S3-A2',
        text: 'Before sending astronauts, NASA had a worry: would the ground on the Moon hold the weight of a spacecraft?',
        audioClip: { src: SURVEYOR3_BLOCK_A_EN_AUDIO, start: 7.25, end: 13.35 } satisfies AudioClip,
      },
      {
        code: 'S3-A3',
        text: 'Surveyor 3 was launched on April 17th, 1967, and landed on April 20th, with no one on board.',
        audioClip: { src: SURVEYOR3_BLOCK_A_EN_AUDIO, start: 13.55, end: 20.68 } satisfies AudioClip,
      },
      {
        code: 'S3-A4',
        text: "But the landing was anything but smooth. Very shiny rocks confused the radar, and the engine didn't shut off at the right moment.",
        audioClip: { src: SURVEYOR3_BLOCK_A_EN_AUDIO, start: 20.85, end: 28.38 } satisfies AudioClip,
      },
      {
        code: 'S3-A5',
        text: "The engine kept running until about 4 meters above the ground. And that's when the fun began.",
        audioClip: { src: SURVEYOR3_BLOCK_A_EN_AUDIO, start: 28.55, end: 33.95 } satisfies AudioClip,
      },
      {
        code: 'S3-A6',
        text: 'The probe bounced twice, first to 10 meters high and then to 3 meters, and only on the third touchdown did it settle.',
        audioClip: { src: SURVEYOR3_BLOCK_A_EN_AUDIO, start: 34.15, end: 41.35 } satisfies AudioClip,
      },
      {
        code: 'S3-A7',
        text: 'Less than an hour later, it was already sending pictures. In all, 6,326 images! But before you grab the part, a question for you.',
        audioClip: { src: SURVEYOR3_BLOCK_A_EN_AUDIO, start: 41.55 } satisfies AudioClip,
      },
    ],
    question1: {
      id: 'q1',
      prompt:
        'During descent, Surveyor 3’s engine did not shut off on time. What happened during the landing?',
      options: [
        { letter: 'A', text: 'It landed perfectly on the very first try.' },
        {
          letter: 'B',
          text: 'It bounced twice on the surface and only settled on the third touchdown.',
        },
        { letter: 'C', text: 'It crashed and became unusable immediately.' },
      ],
      correctLetter: 'B',
      feedbackCorrect:
        'That’s right! Reflective rocks confused the radar, so the engine stayed on down to about 4.3 meters. The probe bounced to 10 m and 3 m before settling.',
      feedbackIncorrect:
        'Almost! The right answer is B. The probe bounced twice before settling and kept working, sending back 6,326 images.',
      collectButtonLabel: 'Collect Part: TV Camera System',
    },
    reward1: {
      partKey: 'peca1_cameraTV',
      partName: 'TV Camera System',
      speechCode: 'S3-R1',
      speechText:
        'We did it! This is the television camera system: two lenses under a mirror that could swivel in every direction. It\'s perfect for giving our ship its "eyes" back.',
      audioClip: {
        src: '/assets/aistudio/ElevenLabs_2026-11-15T13_37_15_David_-_Real_and_Laid_Back_pvc_s50_sim75_v4_26ec33e5.mp3',
      } satisfies AudioClip,
      cardTitle: 'TV Camera System recovered!',
      cardDescription:
        'Two lenses (25 mm and 100 mm) beneath a movable mirror. It captured 6,326 images of the Moon.',
      nextButtonLabel: 'Continue to next reward',
    },
    blockB: [
      {
        code: 'S3-B1',
        text: "Surveyor 3 didn't just take pictures. It had an arm that reached 1.5 meters away.",
        audioClip: { src: EN_AUDIO_3, start: 0, end: 5.65 } satisfies AudioClip,
      },
      {
        code: 'S3-B2',
        text: 'At the tip, a scoop dug up to 18 centimeters deep, all commanded from here on Earth.',
        audioClip: { src: EN_AUDIO_3, start: 5.95, end: 11.98 } satisfies AudioClip,
      },
      {
        code: 'S3-B3',
        text: 'It dug 4 trenches, and ran 4 bearing tests and 13 impact tests on the soil.',
        audioClip: { src: EN_AUDIO_3, start: 12.25, end: 17.65 } satisfies AudioClip,
      },
      {
        code: 'S3-B4',
        text: "And the scientists' verdict: the lunar soil is like wet sand.",
        audioClip: { src: EN_AUDIO_3, start: 17.92, end: 21.90 } satisfies AudioClip,
      },
      {
        code: 'S3-B5',
        text: "It can support about 0.7 kilograms per square centimeter, and that's firm enough for an Apollo lunar module to land. Now it's your turn.",
        audioClip: { src: EN_AUDIO_3, start: 22.12 } satisfies AudioClip,
      },
    ],
    question2: {
      id: 'q2',
      prompt:
        'After digging trenches and running tests, what did Surveyor 3 conclude about the Moon’s soil?',
      options: [
        {
          letter: 'A',
          text: 'That it was fluffy like talcum powder and would swallow any spacecraft.',
        },
        {
          letter: 'B',
          text: 'That it was hard as concrete and impossible to dig.',
        },
        {
          letter: 'C',
          text: 'That it felt like damp sand and was firm enough to support an Apollo module.',
        },
      ],
      correctLetter: 'C',
      feedbackCorrect:
        'Spot on! The soil behaved like damp sand, bearing roughly 0.7 kg per square centimeter. Apollo could land safely.',
      feedbackIncorrect:
        'Almost! The right answer is C. The probe successfully dug 4 trenches, proving it wasn’t concrete, and scientists confirmed it could support an Apollo lander.',
      collectButtonLabel: 'Collect Part: Soil Scoop Sampler',
    },
    reward2: {
      partKey: 'peca2_conchaColetora',
      partName: 'Soil Scoop Sampler',
      speechCode: 'S3-R2',
      speechText:
        'Here is the soil scoop, the tip of the arm that dug into the lunar ground. With it, our ship can collect material again.',
      audioClip: { src: EN_AUDIO_4 } satisfies AudioClip,
      cardTitle: 'Soil Scoop Sampler recovered!',
      cardDescription: 'The tip of the robotic arm that excavated the lunar soil.',
      nextButtonLabel: 'Continue to finale',
    },
    blockC: [
      {
        code: 'S3-C1',
        text: 'Surveyor 3 worked until May 4th, 1967. The last contact came two days after the lunar night began.',
        audioClip: { src: EN_AUDIO_5, start: 0, end: 7.60 } satisfies AudioClip,
      },
      {
        code: 'S3-C2',
        text: "And the story didn't end there. On November 18th, 1969, Apollo 12 landed about 180 meters away from it.",
        audioClip: { src: EN_AUDIO_5, start: 7.92 } satisfies AudioClip,
      },
      {
        code: 'S3-C3',
        text: 'The next day, astronauts Charles Conrad and Alan Bean walked over to the probe.',
        audioClip: { src: EN_AUDIO_6, start: 0, end: 4.70 } satisfies AudioClip,
      },
      {
        code: 'S3-C4',
        text: 'They took the scoop, the camera and other parts, so scientists could study what almost two and a half years on the Moon had done to them.',
        audioClip: { src: EN_AUDIO_6, start: 4.98, end: 12.35 } satisfies AudioClip,
      },
      {
        code: 'S3-C5',
        text: "So you just followed in their footsteps. Let's head to the next piece of equipment!",
        audioClip: { src: EN_AUDIO_6, start: 12.68 } satisfies AudioClip,
      },
    ],
    animationCaption:
      '1967: the probe bounces and settles. 1969: astronauts walk up to visit it.',
    completionNotice:
      'Surveyor 3 completed! Moving on to the next equipment.',
    backButtonLabel: 'Back to Map',
  },

  rtg: {
    id: 'rtg',
    shortName: 'RTG',
    title: 'RTG, "The Unstoppable Nuclear Battery"',
    subtitle:
      'Generator that turns the natural heat of plutonium-238 into electricity with no moving parts',
    quickFactsLabel: 'Quick Facts (SNAP-27 model, used on the Moon)',
    quickFacts:
      'Fuel: plutonium-238 oxide · Output: ~70 W · Generator mass: 17 kg · 442 thermocouples · Apollo 12, 14, 15, 16, and 17',
    stagePartsSummary:
      'Array of 442 Thermocouples (3/4) and Power Conditioning Unit (4/4)',
    startButtonLabel: 'Continue to reward',
    blockA: [
      {
        code: 'RTG-A1',
        text: 'We\'ve reached the RTG, the "nuclear battery." It powered the science stations the astronauts left on the Moon.',
        audioClip: { src: EN_AUDIO_7, start: 0, end: 6.70 } satisfies AudioClip,
      },
      {
        code: 'RTG-A2',
        text: 'Inside it is plutonium-238, which heats up all by itself, naturally, as its atoms slowly break down.',
        audioClip: { src: EN_AUDIO_7, start: 6.95 } satisfies AudioClip,
      },
      {
        code: 'RTG-A3',
        text: 'That heat flows through hundreds of pairs of metals called thermocouples. One side stays hot, and the other stays cold.',
        audioClip: { src: EN_AUDIO_8, start: 0, end: 6.88 } satisfies AudioClip,
      },
      {
        code: 'RTG-A4',
        text: "That temperature difference creates an electric current. It's called the Seebeck effect, discovered in 1821 by the scientist Thomas Seebeck.",
        audioClip: { src: EN_AUDIO_8, start: 7.12 } satisfies AudioClip,
      },
      {
        code: 'RTG-A5',
        text: 'The bigger the difference between hot and cold, the more power it makes. Now, a question for you.',
        audioClip: { src: EN_AUDIO_9 } satisfies AudioClip,
      },
    ],
    question1: {
      id: 'q3',
      prompt:
        'How does an RTG turn the heat from plutonium-238 into electricity?',
      options: [
        {
          letter: 'A',
          text: 'With thermocouples: heat passes through pairs of metals with one hot side and one cold side, generating electric current.',
        },
        {
          letter: 'B',
          text: 'By burning fuel like a car engine.',
        },
        {
          letter: 'C',
          text: 'With hidden solar panels inside the generator.',
        },
      ],
      correctLetter: 'A',
      feedbackCorrect:
        'Correct! That is the Seebeck Effect, discovered in 1821. The temperature difference between the hot and cold sides generates electricity.',
      feedbackIncorrect:
        'Almost! The right answer is A. An RTG burns nothing and uses no sunlight—heat from natural plutonium-238 decay becomes electricity inside the thermocouples.',
      collectButtonLabel: 'Collect Part: 442 Thermocouples Array',
    },
    reward1: {
      partKey: 'peca3_termopares',
      partName: '442 Thermocouples Array',
      speechCode: 'RTG-R3',
      speechText:
        'Here are the 442 thermocouples made of lead telluride. They turn heat into electricity, and the fuel stays untouched in the equipment.',
      audioClip: { src: EN_AUDIO_10 } satisfies AudioClip,
      cardTitle: 'Thermocouples recovered!',
      cardDescription:
        '442 lead-telluride pairs turning temperature difference into electricity. The nuclear fuel stays untouched in the equipment.',
      nextButtonLabel: 'Continue to next reward',
    },
    blockB: [
      {
        code: 'RTG-B1',
        text: 'When people hear "nuclear battery," many think of a bomb. But it\'s nothing like that.',
        audioClip: { src: EN_AUDIO_11 } satisfies AudioClip,
      },
      {
        code: 'RTG-B2',
        text: 'The RTG is not a fission reactor, and the plutonium in it is not the kind used in weapons.',
        audioClip: { src: EN_AUDIO_12, start: 0, end: 5.95 } satisfies AudioClip,
      },
      {
        code: 'RTG-B3',
        text: "It's just natural heat turning into electricity. This model, the SNAP-27, produced about 70 watts.",
        audioClip: { src: EN_AUDIO_12, start: 6.10, end: 12.90 } satisfies AudioClip,
      },
      {
        code: 'RTG-B4',
        text: 'It powered the science stations on the Apollo 12, 14, 15, 16 and 17 missions.',
        audioClip: { src: EN_AUDIO_12, start: 13.10, end: 19.28 } satisfies AudioClip,
      },
      {
        code: 'RTG-B5',
        text: 'Best of all, it has no moving parts at all. But why does that matter? Give it a try.',
        audioClip: { src: EN_AUDIO_12, start: 19.50 } satisfies AudioClip,
      },
    ],
    question2: {
      id: 'q4',
      prompt: 'Why is the RTG considered so extraordinarily reliable?',
      options: [
        { letter: 'A', text: 'Because astronauts recharge it every month.' },
        {
          letter: 'B',
          text: 'Because it has no moving parts that can break or wear out.',
        },
        {
          letter: 'C',
          text: 'Because it is a tiny controlled nuclear bomb.',
        },
      ],
      correctLetter: 'B',
      feedbackCorrect:
        'Exactly! With no moving parts, there is far less that can fail. The Voyager probes launched in 1977 are living proof.',
      feedbackIncorrect:
        'Almost! The right answer is B. An RTG is neither a bomb nor a reactor—natural decay heat drives electricity with no moving parts to wear out.',
      collectButtonLabel: 'Collect Part: Power Conditioning Unit',
    },
    reward2: {
      partKey: 'peca4_condicionamentoEnergia',
      partName: 'Power Conditioning Unit',
      speechCode: 'RTG-R4',
      speechText:
        'Done! The power conditioning unit delivers the right voltage and power to each system. Now our ship is complete.',
      cardTitle:
        'Power Conditioning Unit recovered from the RTG/ALSEP assembly!',
      cardDescription:
        'Delivers the right voltage and power to every onboard system. Repair bar complete!',
      nextButtonLabel: 'Continue to finale',
    },
    blockC: [
      {
        code: 'RTG-C1',
        text: "With no moving parts, there's nothing to wear out. The Voyager probes, launched in 1977, still run on this kind of power.",
        audioClip: { src: EN_AUDIO_14, start: 0, end: 8.05 } satisfies AudioClip,
      },
      {
        code: 'RTG-C2',
        text: 'The RTGs on the Apollo stations were designed to last two years. But every one of them worked for 5 to 8 years.',
        audioClip: { src: EN_AUDIO_14, start: 8.30, end: 15.52 } satisfies AudioClip,
      },
      {
        code: 'RTG-C3',
        text: "The stations were shut down in 1977. And remember Apollo 12? It's the same mission that visited Surveyor 3.",
        audioClip: { src: EN_AUDIO_14, start: 15.76, end: 22.98 } satisfies AudioClip,
      },
      {
        code: 'RTG-C4',
        text: "The Moon keeps a lot of history. Now it's time to head home!",
        audioClip: { src: EN_AUDIO_14, start: 23.20 } satisfies AudioClip,
      },
    ],
    animationCaption: 'RTG completed! Your ship is ready to return to Earth.',
    completionNotice: 'RTG completed! Your ship is ready to return to Earth.',
    backButtonLabel: 'Back to Map',
  },
};

export const FINAL_CARDS_EN: FinalCardInfo[] = [
  {
    id: 'surveyor3',
    title: 'Surveyor 3',
    summary:
      'Robotic probe that proved the lunar soil could support the weight of an Apollo Lunar Module.',
    links: [
      {
        label: 'Learn more at NASA: Surveyor 3 Mission',
        url: 'https://science.nasa.gov/mission/surveyor-3/',
      },
    ],
  },
  {
    id: 'rtg',
    title: 'Radioisotope Thermoelectric Generator (RTG)',
    summary: 'The nuclear battery that powered Apollo’s lunar science stations.',
    links: [
      {
        label: 'Learn more at NASA: Radioisotope Power Systems (RTG)',
        url: 'https://science.nasa.gov/planetary-science/programs/radioisotope-power-systems/power-radioisotope-thermoelectric-generators/',
      },
      {
        label: 'How an RTG Works: The Seebeck Effect (NASA)',
        url: 'https://science.nasa.gov/resource/how-does-a-radioisotope-thermoelectric-generator-rtg-work-the-seebeck-effect/',
      },
      {
        label: 'RTG on the Cassini Mission (NASA)',
        url: 'https://science.nasa.gov/mission/cassini/radioisotope-thermoelectric-generator/',
      },
    ],
  },
];

export function getEquipmentScript(
  id: EquipmentId,
  lang: Language
): EquipmentScript {
  return lang === 'en' ? EQUIPMENT_SCRIPTS_EN[id] : EQUIPMENT_SCRIPTS[id];
}

export function getFinalCards(lang: Language): FinalCardInfo[] {
  return lang === 'en' ? FINAL_CARDS_EN : FINAL_CARDS;
}

export function getLocalizedMissionBubbleText(
  inventory: RepairInventory,
  progress: Record<EquipmentId, EquipmentProgress>,
  lang: Language
): string {
  if (lang === 'pt') {
    return getMissionBubbleText(inventory, progress);
  }
  const collected = countCollectedParts(inventory);
  if (collected >= 4) {
    return 'Ship repaired (4/4)! Return to the ship in the center and click or press E to fly back to Earth.';
  }
  if (progress.surveyor3.completed && !progress.rtg.completed) {
    return 'Surveyor 3 completed! Now head to the RTG on the left to collect the remaining parts.';
  }
  if (progress.rtg.completed && !progress.surveyor3.completed) {
    return 'RTG completed! Now head to Surveyor 3 on the right to collect the remaining parts.';
  }
  if (collected > 0) {
    const remaining = 4 - collected;
    return `${remaining} part(s) remaining! Explore the RTG (left) and Surveyor 3 (right) on the Moon.`;
  }
  return 'Your ship broke down! Explore the RTG (left) and Surveyor 3 (right) to collect 4 repair parts.';
}

export interface UiStrings {
  introBadge: string;
  introTitle: string;
  introText: string;
  startMissionBtn: string;
  mapAlt: string;
  astronautAlt: string;
  shipLabel: string;
  shipReadyLabel: string;
  interactPrompt: string;
  completedBadge: string;
  shipRepairHud: string;
  materialsUnit: string;
  missionObjectiveTitle: string;
  soundOn: string;
  soundMuted: string;
  soundEnableAria: string;
  soundMuteAria: string;
  damagedShipStatus: (count: number, total: number) => string;
  shipReadyBanner: string;
  controlsHint: string;
  takeoffIgnition: string;
  takeoffReturning: string;
  modalSummaryHeader: string;
  modalStepOf9: (step: number) => string;
  autoVoiceOn: string;
  autoVoiceOff: string;
  mapButton: string;
  stagePartsTitle: string;
  blockATitle: string;
  blockBTitle: string;
  blockCTitle: string;
  speechProgress: (idx: number, total: number) => string;
  listenBtn: string;
  stopBtn: string;
  listenAria: (code: string) => string;
  previousBtn: string;
  continueBtn: string;
  quizHeading: string;
  viewPartPrefix: string;
  materialAddedPrefix: string;
  neilQuote: string;
  lunarSurfaceAlt: string;
  apolloModuleAlt: string;
  usFlagAlt: string;
  s3Year1967: string;
  s3Year1969Flag: string;
  s3Year1969Apollo: string;
  seebeckHeader: string;
  seebeckWatts: string;
  seebeckPlutonium: string;
  seebeckHotSide: string;
  seebeckPairs: string;
  seebeckThermocouples: string;
  seebeckColdFins: string;
  seebeckColdSide: string;
  seebeckPower: string;
  seebeckNoMovingParts: string;
  finalBadge: string;
  finalTitle: string;
  playAgainBtn: string;
}

export const UI_TEXT: Record<Language, UiStrings> = {
  pt: {
    introBadge: 'AVENTURA EDUCATIVA 16-BIT',
    introTitle: 'Missão na Lua',
    introText: INTRO_MISSION_TEXT,
    startMissionBtn: 'Iniciar Missão',
    mapAlt: 'Mapa Lunar',
    astronautAlt: 'Astronauta',
    shipLabel: 'Nave',
    shipReadyLabel: 'Nave Pronta!',
    interactPrompt: '[Pressione E ou Clique para Interagir]',
    completedBadge: 'Concluído ✓',
    shipRepairHud: 'Reparo da Nave',
    materialsUnit: 'materiais',
    missionObjectiveTitle: 'OBJETIVO DA MISSÃO',
    soundOn: 'Som [M]',
    soundMuted: 'Mudo [M]',
    soundEnableAria: 'Ativar efeitos sonoros',
    soundMuteAria: 'Silenciar efeitos sonoros',
    damagedShipStatus: (count, total) =>
      `Nave avariada (${count}/${total} materiais). Explore o RTG e a Surveyor 3 para coletar as peças restantes.`,
    shipReadyBanner:
      'Nave reparada! Aproxime-se e clique na nave para voltar à Terra.',
    controlsHint:
      'WASD / Setas ou Clique no mapa para andar · E / Espaço / Clique perto para interagir',
    takeoffIgnition: 'IGNIÇÃO DOS MOTORES... DECOLANDO!',
    takeoffReturning: 'RETORNANDO PARA A TERRA...',
    modalSummaryHeader: 'Resumo · Concluído ✓',
    modalStepOf9: (step) => `Etapa ${step}/9`,
    autoVoiceOn: 'Auto-voz: ON',
    autoVoiceOff: 'Auto-voz: OFF',
    mapButton: 'Mapa',
    stagePartsTitle: 'Peças desta etapa',
    blockATitle: 'Bloco A · Exploração',
    blockBTitle: 'Bloco B · Descoberta',
    blockCTitle: 'Bloco C · História',
    speechProgress: (idx, total) => `Fala ${idx} de ${total}`,
    listenBtn: 'Ouvir',
    stopBtn: 'Parar',
    listenAria: (code) => `Ouvir fala ${code}`,
    previousBtn: 'Anterior',
    continueBtn: 'Continuar',
    quizHeading: 'DESAFIO DE CONHECIMENTO',
    viewPartPrefix: 'Ver Peça',
    materialAddedPrefix: '+1 MATERIAL ADICIONADO',
    neilQuote: NEIL_ARMSTRONG_QUOTE,
    lunarSurfaceAlt: 'Superfície lunar',
    apolloModuleAlt: 'Módulo Lunar Apollo',
    usFlagAlt: 'Bandeira americana na Lua',
    s3Year1967: '1967 · SURVEYOR 3 (2 QUICOS)',
    s3Year1969Flag: '1969 · BANDEIRA NA LUA & HOMENAGEM APOLLO',
    s3Year1969Apollo: '1969 · APOLLO 12 VISITANDO A SONDA',
    seebeckHeader: 'EFEITO SEEBECK · MODELO SNAP-27',
    seebeckWatts: '~70 W contínuos',
    seebeckPlutonium: 'Plutônio 238',
    seebeckHotSide: 'Lado Quente',
    seebeckPairs: '442 Pares',
    seebeckThermocouples: 'Termopares',
    seebeckColdFins: 'Aletas Frias',
    seebeckColdSide: 'Lado Frio',
    seebeckPower: 'Energia ~70W',
    seebeckNoMovingParts: 'Sem peças móveis',
    finalBadge: '4/4 MATERIAIS INSTALADOS · RETORNO CONCLUÍDO',
    finalTitle: FINAL_SCREEN_TITLE,
    playAgainBtn: 'Jogar Novamente',
  },
  en: {
    introBadge: '16-BIT EDUCATIONAL ADVENTURE',
    introTitle: 'Moon Mission',
    introText:
      'You were on a reconnaissance mission on the Moon when your spacecraft broke down! To repair it and return to Earth, explore the historic NASA equipment left on the lunar surface and collect 4 repair parts.',
    startMissionBtn: 'Start Mission',
    mapAlt: 'Lunar Map',
    astronautAlt: 'Astronaut',
    shipLabel: 'Ship',
    shipReadyLabel: 'Ship Ready!',
    interactPrompt: '[Press E or Click to Interact]',
    completedBadge: 'Completed ✓',
    shipRepairHud: 'Ship Repair',
    materialsUnit: 'materials',
    missionObjectiveTitle: 'MISSION OBJECTIVE',
    soundOn: 'Sound [M]',
    soundMuted: 'Mute [M]',
    soundEnableAria: 'Enable sound effects',
    soundMuteAria: 'Mute sound effects',
    damagedShipStatus: (count, total) =>
      `Ship damaged (${count}/${total} materials). Explore the RTG and Surveyor 3 to collect the remaining parts.`,
    shipReadyBanner:
      'Ship repaired! Walk close and click the ship to return to Earth.',
    controlsHint:
      'WASD / Arrows or Click map to walk · E / Space / Click nearby to interact',
    takeoffIgnition: 'ENGINE IGNITION... LIFTOFF!',
    takeoffReturning: 'RETURNING TO EARTH...',
    modalSummaryHeader: 'Summary · Completed ✓',
    modalStepOf9: (step) => `Step ${step}/9`,
    autoVoiceOn: 'Auto-voice: ON',
    autoVoiceOff: 'Auto-voice: OFF',
    mapButton: 'Map',
    stagePartsTitle: 'Parts in this stage',
    blockATitle: 'Block A · Exploration',
    blockBTitle: 'Block B · Discovery',
    blockCTitle: 'Block C · History',
    speechProgress: (idx, total) => `Line ${idx} of ${total}`,
    listenBtn: 'Listen',
    stopBtn: 'Stop',
    listenAria: (code) => `Listen to line ${code}`,
    previousBtn: 'Previous',
    continueBtn: 'Continue',
    quizHeading: 'KNOWLEDGE CHALLENGE',
    viewPartPrefix: 'View Part',
    materialAddedPrefix: '+1 MATERIAL ADDED',
    neilQuote: 'One small step for man, one giant leap for mankind.',
    lunarSurfaceAlt: 'Lunar surface',
    apolloModuleAlt: 'Apollo Lunar Module',
    usFlagAlt: 'American flag on the Moon',
    s3Year1967: '1967 · SURVEYOR 3 (2 BOUNCES)',
    s3Year1969Flag: '1969 · FLAG ON THE MOON & APOLLO TRIBUTE',
    s3Year1969Apollo: '1969 · APOLLO 12 VISITING THE PROBE',
    seebeckHeader: 'SEEBECK EFFECT · SNAP-27 MODEL',
    seebeckWatts: '~70 W continuous',
    seebeckPlutonium: 'Plutonium-238',
    seebeckHotSide: 'Hot Side',
    seebeckPairs: '442 Pairs',
    seebeckThermocouples: 'Thermocouples',
    seebeckColdFins: 'Cooling Fins',
    seebeckColdSide: 'Cold Side',
    seebeckPower: 'Power ~70W',
    seebeckNoMovingParts: 'No moving parts',
    finalBadge: '4/4 MATERIALS INSTALLED · RETURN COMPLETE',
    finalTitle:
      'Mission Accomplished! You repaired your spacecraft and explored NASA history on the Moon.',
    playAgainBtn: 'Play Again',
  },
};
