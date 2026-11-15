export interface Point2D {
  x: number;
  y: number;
}

export type EquipmentId = 'surveyor3' | 'rtg';

export type PartKey =
  | 'peca1_cameraTV'
  | 'peca2_conchaColetora'
  | 'peca3_termopares'
  | 'peca4_condicionamentoEnergia';

export interface RepairInventory {
  peca1_cameraTV: boolean;
  peca2_conchaColetora: boolean;
  peca3_termopares: boolean;
  peca4_condicionamentoEnergia: boolean;
}

export type StageStep =
  | 1 // Tela 1: Card Inicial
  | 2 // Bloco A (balões sequenciais)
  | 3 // Pergunta 1
  | 4 // Recompensa 1
  | 5 // Bloco B (balões sequenciais)
  | 6 // Pergunta 2
  | 7 // Recompensa 2
  | 8 // Bloco C (final da história)
  | 9; // Animação final e encerramento

export interface EquipmentProgress {
  step: StageStep;
  balloonIdx: number;
  selectedQ1: 'A' | 'B' | 'C' | null;
  selectedQ2: 'A' | 'B' | 'C' | null;
  completed: boolean;
}

export interface DialogueBalloon {
  code: string;
  text: string;
}

export interface QuizOption {
  letter: 'A' | 'B' | 'C';
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctLetter: 'A' | 'B' | 'C';
  feedbackCorrect: string;
  feedbackIncorrect: string;
  collectButtonLabel: string;
}

export interface RewardCard {
  partKey: PartKey;
  partName: string;
  speechCode: string;
  speechText: string;
  cardTitle: string;
  cardDescription: string;
  nextButtonLabel: string;
}

export interface EquipmentScript {
  id: EquipmentId;
  shortName: string;
  title: string;
  subtitle: string;
  quickFactsLabel: string;
  quickFacts: string;
  stagePartsSummary: string;
  startButtonLabel: string;
  blockA: DialogueBalloon[];
  question1: QuizQuestion;
  reward1: RewardCard;
  blockB: DialogueBalloon[];
  question2: QuizQuestion;
  reward2: RewardCard;
  blockC: DialogueBalloon[];
  animationCaption: string;
  completionNotice: string;
  backButtonLabel: string;
}

// Percentage coordinates (0..100) aligned with public/mapa_lunar.png (1376x768)
export const MAP_ASPECT_RATIO = 1376 / 768;

export const NAVE_MAP_POS: Point2D = { x: 50, y: 55 };
export const ASTRONAUT_START_MAP_POS: Point2D = { x: 40, y: 60 };
export const RTG_MAP_POS: Point2D = { x: 19.5, y: 65 };
export const SURVEYOR_MAP_POS: Point2D = { x: 80, y: 66 };
export const EARTH_MAP_POS: Point2D = { x: 90.2, y: 14.5 };

export const PROXIMITY_RADIUS = 13.5;

export const NEIL_ARMSTRONG_QUOTE =
  'Um pequeno passo para um homem, um salto gigantesco para a humanidade.';

export function getMinSurfaceYPercent(xPercent: number): number {
  const dx = (xPercent - 46) / 50;
  return 24 + dx * dx * 18;
}

export function clampToLunarSurface(xPercent: number, yPercent: number): Point2D {
  const x = Math.max(5, Math.min(95, xPercent));
  const minY = getMinSurfaceYPercent(x);
  const y = Math.max(minY, Math.min(92, yPercent));
  return { x, y };
}

export function getMapDistance(a: Point2D, b: Point2D): number {
  return Math.hypot((a.x - b.x) * MAP_ASPECT_RATIO, a.y - b.y);
}

export function createInitialInventory(): RepairInventory {
  return {
    peca1_cameraTV: false,
    peca2_conchaColetora: false,
    peca3_termopares: false,
    peca4_condicionamentoEnergia: false,
  };
}

export function createInitialEquipmentProgress(): Record<EquipmentId, EquipmentProgress> {
  return {
    surveyor3: {
      step: 1,
      balloonIdx: 0,
      selectedQ1: null,
      selectedQ2: null,
      completed: false,
    },
    rtg: {
      step: 1,
      balloonIdx: 0,
      selectedQ1: null,
      selectedQ2: null,
      completed: false,
    },
  };
}

export function countCollectedParts(inventory: RepairInventory): number {
  return [
    inventory.peca1_cameraTV,
    inventory.peca2_conchaColetora,
    inventory.peca3_termopares,
    inventory.peca4_condicionamentoEnergia,
  ].filter(Boolean).length;
}

export function getMissionBubbleText(
  inventory: RepairInventory,
  progress: Record<EquipmentId, EquipmentProgress>
): string {
  const collected = countCollectedParts(inventory);
  if (collected >= 4) {
    return 'Nave consertada (4/4)! Volte até a nave no centro e clique ou pressione E para voltar à Terra.';
  }
  if (progress.surveyor3.completed && !progress.rtg.completed) {
    return 'Surveyor 3 concluída! Agora vá até o RTG à esquerda para coletar as peças restantes.';
  }
  if (progress.rtg.completed && !progress.surveyor3.completed) {
    return 'RTG concluído! Agora vá até a Surveyor 3 à direita para coletar as peças restantes.';
  }
  if (collected > 0) {
    const remaining = 4 - collected;
    return `Faltam ${remaining} peça(s)! Explore o RTG (esquerda) e a Surveyor 3 (direita) na Lua.`;
  }
  return 'Sua nave quebrou! Explore o RTG (esquerda) e a Surveyor 3 (direita) para coletar 4 peças de reparo.';
}

export const INTRO_MISSION_TEXT =
  'Você estava em uma missão de reconhecimento na Lua quando sua nave sofreu uma pane! Para consertá-la e voltar para a Terra, explore os equipamentos históricos deixados pela NASA na superfície lunar e colete 4 peças de reparo.';

export const EQUIPMENT_SCRIPTS: Record<EquipmentId, EquipmentScript> = {
  surveyor3: {
    id: 'surveyor3',
    shortName: 'Surveyor 3',
    title: 'Surveyor 3, "A Testadora do Solo Lunar"',
    subtitle:
      'Sonda robótica da NASA que pousou na Lua em 1967 para descobrir se o solo aguentaria astronautas',
    quickFactsLabel: 'Dados Rápidos',
    quickFacts:
      'Pouso: 20/04/1967 · Massa: cerca de 998 kg (2.200 libras) · Local: sudeste do Oceanus Procellarum (3° S, 23,41° O)',
    stagePartsSummary: 'Sistema de câmera de TV (1/4) e Concha coletora (2/4)',
    startButtonLabel: 'Avançar para recompensa',
    blockA: [
      {
        code: 'S3-A1',
        text: 'Olha só o que encontramos! Essa é a Surveyor 3, uma sonda robô que a NASA mandou para a Lua em 1967.',
      },
      {
        code: 'S3-A2',
        text: 'Antes de enviar astronautas, a NASA tinha um medo: será que o chão da Lua aguenta o peso de uma nave?',
      },
      {
        code: 'S3-A3',
        text: 'A Surveyor 3 foi lançada em 17 de abril de 1967, e pousou em 20 de abril, sem ninguém a bordo.',
      },
      {
        code: 'S3-A4',
        text: 'Mas o pouso não foi nada tranquilo. Rochas muito reflexivas confundiram o radar, e o motor não desligou na hora certa.',
      },
      {
        code: 'S3-A5',
        text: 'O motor ficou ligado até cerca de 4 metros de altura. E aí começou a brincadeira.',
      },
      {
        code: 'S3-A6',
        text: 'A sonda quicou duas vezes, a primeira a 10 metros de altura e a segunda a 3 metros, e só na terceira assentou.',
      },
      {
        code: 'S3-A7',
        text: 'Menos de uma hora depois, ela já mandava fotos. Ao todo, foram 6.326 imagens! Mas antes de pegar a peça, uma pergunta para você.',
      },
    ],
    question1: {
      id: 'q1',
      prompt:
        'Durante a descida, o motor da Surveyor 3 não desligou na hora certa. O que aconteceu com o pouso?',
      options: [
        { letter: 'A', text: 'Ela pousou perfeitamente de primeira.' },
        {
          letter: 'B',
          text: 'Ela quicou duas vezes na superfície e só na terceira assentou.',
        },
        { letter: 'C', text: 'Ela caiu e ficou inutilizada na hora.' },
      ],
      correctLetter: 'B',
      feedbackCorrect:
        'Isso mesmo! Rochas muito reflexivas confundiram o radar, e o motor não desligou a cerca de 4,3 metros de altura. A sonda quicou a 10 m e a 3 m antes de assentar.',
      feedbackIncorrect:
        'Quase! A resposta certa é B. A sonda quicou duas vezes antes de assentar e continuou funcionando: transmitiu 6.326 imagens.',
      collectButtonLabel: 'Coletar Peça: Sistema de câmera de TV',
    },
    reward1: {
      partKey: 'peca1_cameraTV',
      partName: 'Sistema de câmera de TV',
      speechCode: 'S3-R1',
      speechText:
        "Conseguimos! Esse é o sistema de câmera de TV: duas lentes sob um espelho que girava para todos os lados. É perfeito para dar 'olhos' à nossa nave.",
      cardTitle: 'Sistema de câmera de TV recuperado!',
      cardDescription:
        'Duas lentes (25 e 100 mm) sob um espelho móvel. Foram 6.326 imagens da Lua.',
      nextButtonLabel: 'Avançar para próxima recompensa',
    },
    blockB: [
      {
        code: 'S3-B1',
        text: 'A Surveyor 3 não só tirava fotos. Ela tinha um braço que alcançava 1,5 metro de distância.',
      },
      {
        code: 'S3-B2',
        text: 'Na ponta, uma concha cavava até 18 centímetros de profundidade, tudo comandado aqui da Terra.',
      },
      {
        code: 'S3-B3',
        text: 'Ela abriu 4 trincheiras, fez 4 testes de resistência e 13 testes de impacto no solo.',
      },
      {
        code: 'S3-B4',
        text: 'E o veredito dos cientistas: o solo da Lua parece areia molhada.',
      },
      {
        code: 'S3-B5',
        text: 'Ele suporta cerca de 0,7 quilo por centímetro quadrado, e isso é firme o bastante para um módulo da Apollo pousar. Agora é com você.',
      },
    ],
    question2: {
      id: 'q2',
      prompt:
        'Depois de cavar trincheiras e fazer testes, o que a Surveyor 3 concluiu sobre o solo da Lua?',
      options: [
        {
          letter: 'A',
          text: 'Que era fofo como poeira de talco e engoliria qualquer nave.',
        },
        {
          letter: 'B',
          text: 'Que era duro como concreto e impossível de escavar.',
        },
        {
          letter: 'C',
          text: 'Que tinha consistência parecida com areia molhada e era firme o bastante para sustentar um módulo da Apollo.',
        },
      ],
      correctLetter: 'C',
      feedbackCorrect:
        'Isso! O solo se comportava como areia molhada, com resistência de cerca de 0,7 kg por centímetro quadrado. A Apollo poderia pousar sem problemas.',
      feedbackIncorrect:
        'Quase! A resposta certa é C. A sonda conseguiu cavar 4 trincheiras, então o solo não era como concreto. E os cientistas concluíram que ele era firme o bastante para sustentar um módulo da Apollo.',
      collectButtonLabel: 'Coletar Peça: Concha coletora',
    },
    reward2: {
      partKey: 'peca2_conchaColetora',
      partName: 'Concha coletora',
      speechCode: 'S3-R2',
      speechText:
        'Aqui está a concha coletora, a ponta do braço que cavou o solo lunar. Com ela, nossa nave volta a coletar material.',
      cardTitle: 'Concha coletora recuperada!',
      cardDescription: 'A ponta do braço que cavou o solo lunar.',
      nextButtonLabel: 'Avançar para o final',
    },
    blockC: [
      {
        code: 'S3-C1',
        text: 'A Surveyor 3 trabalhou até 4 de maio de 1967. O último contato foi dois dias depois de começar a noite lunar.',
      },
      {
        code: 'S3-C2',
        text: 'E a história não acabou aí. Em 18 de novembro de 1969, a Apollo 12 pousou a cerca de 180 metros dela.',
      },
      {
        code: 'S3-C3',
        text: 'No dia seguinte, os astronautas Charles Conrad e Alan Bean foram caminhando até a sonda.',
      },
      {
        code: 'S3-C4',
        text: 'Eles recolheram a concha, a câmera e outras partes, para os cientistas estudarem o que quase dois anos e meio na Lua fizeram com elas.',
      },
      {
        code: 'S3-C5',
        text: 'Ou seja, você acabou de fazer o mesmo caminho que eles. Vamos para o próximo equipamento!',
      },
    ],
    animationCaption:
      '1967: a sonda quica e assenta. 1969: astronautas caminham até ela.',
    completionNotice:
      'Surveyor 3 concluída! Seguindo para o próximo equipamento.',
    backButtonLabel: 'Voltar ao Mapa',
  },

  rtg: {
    id: 'rtg',
    shortName: 'RTG',
    title: 'RTG, "A Bateria Nuclear que Não Para"',
    subtitle:
      'Gerador que transforma o calor natural do plutônio-238 em eletricidade, sem peças móveis',
    quickFactsLabel: 'Dados Rápidos (modelo SNAP-27, usado na Lua)',
    quickFacts:
      'Combustível: óxido de plutônio-238 · Potência: cerca de 70 W · Massa do gerador: 17 kg · 442 termopares · Missões Apollo 12, 14, 15, 16 e 17',
    stagePartsSummary:
      'Conjunto de 442 termopares (3/4) e Unidade de condicionamento de energia (4/4)',
    startButtonLabel: 'Avançar para recompensa',
    blockA: [
      {
        code: 'RTG-A1',
        text: "Chegamos ao RTG, a 'bateria nuclear'. Ele alimentava as estações científicas que os astronautas deixaram na Lua.",
      },
      {
        code: 'RTG-A2',
        text: 'Dentro dele fica o plutônio-238, que esquenta sozinho, naturalmente, enquanto seus átomos vão se desfazendo.',
      },
      {
        code: 'RTG-A3',
        text: 'Esse calor passa por centenas de pares de metais chamados termopares. Um lado fica quente, e o outro, frio.',
      },
      {
        code: 'RTG-A4',
        text: 'Essa diferença de temperatura gera corrente elétrica. É o Efeito Seebeck, descoberto em 1821 pelo cientista Thomas Seebeck.',
      },
      {
        code: 'RTG-A5',
        text: 'Quanto maior a diferença entre o quente e o frio, mais energia ele produz. Agora uma pergunta para você.',
      },
    ],
    question1: {
      id: 'q3',
      prompt:
        'Como o RTG transforma o calor do plutônio-238 em eletricidade?',
      options: [
        {
          letter: 'A',
          text: 'Com termopares: o calor passa por pares de metais, com um lado quente e outro frio, e isso gera corrente elétrica.',
        },
        {
          letter: 'B',
          text: 'Queimando o combustível, como um motor de carro.',
        },
        {
          letter: 'C',
          text: 'Com painéis solares escondidos dentro do gerador.',
        },
      ],
      correctLetter: 'A',
      feedbackCorrect:
        'Isso! É o Efeito Seebeck, descoberto em 1821. A diferença de temperatura entre o lado quente e o lado frio gera a eletricidade.',
      feedbackIncorrect:
        'Quase! A resposta certa é A. O RTG não queima nada e não usa luz do sol. O calor vem do decaimento natural do plutônio-238 e vira eletricidade nos termopares.',
      collectButtonLabel: 'Coletar Peça: Conjunto de 442 termopares',
    },
    reward1: {
      partKey: 'peca3_termopares',
      partName: 'Conjunto de 442 termopares',
      speechCode: 'RTG-R3',
      speechText:
        'Aqui estão os 442 termopares de telureto de chumbo. Eles transformam calor em eletricidade, e o combustível continua intocado no equipamento.',
      cardTitle: 'Termopares recuperados!',
      cardDescription:
        '442 pares de telureto de chumbo que transformam a diferença de temperatura em eletricidade. O combustível permanece intocado no equipamento.',
      nextButtonLabel: 'Avançar para próxima recompensa',
    },
    blockB: [
      {
        code: 'RTG-B1',
        text: "Quando alguém fala 'bateria nuclear', muita gente pensa em bomba. Mas não é nada disso.",
      },
      {
        code: 'RTG-B2',
        text: 'O RTG não é um reator de fissão, e o plutônio usado nele não é o tipo usado em armas.',
      },
      {
        code: 'RTG-B3',
        text: 'É só calor natural virando eletricidade. Esse modelo, o SNAP-27, produzia cerca de 70 watts.',
      },
      {
        code: 'RTG-B4',
        text: 'Ele equipou as estações científicas das missões Apollo 12, 14, 15, 16 e 17.',
      },
      {
        code: 'RTG-B5',
        text: 'O melhor: ele não tem nenhuma peça móvel. Mas por que isso importa? Responda aí.',
      },
    ],
    question2: {
      id: 'q4',
      prompt: 'Por que o RTG é considerado tão confiável?',
      options: [
        { letter: 'A', text: 'Porque os astronautas o recarregam todo mês.' },
        {
          letter: 'B',
          text: 'Porque não tem peças móveis que possam quebrar ou se desgastar.',
        },
        {
          letter: 'C',
          text: 'Porque é uma pequena bomba nuclear controlada.',
        },
      ],
      correctLetter: 'B',
      feedbackCorrect:
        'Exato! Sem peças móveis, há muito menos o que falhar. As sondas Voyager, lançadas em 1977, são a prova.',
      feedbackIncorrect:
        'Quase! A resposta certa é B. O RTG não é bomba nem reator: o calor vem do decaimento natural do plutônio, e sem peças móveis quase nada pode se desgastar.',
      collectButtonLabel: 'Coletar Peça: Unidade de condicionamento de energia',
    },
    reward2: {
      partKey: 'peca4_condicionamentoEnergia',
      partName: 'Unidade de condicionamento de energia',
      speechCode: 'RTG-R4',
      speechText:
        'Pronto! A unidade de condicionamento de energia entrega a tensão e a potência certas para cada sistema. Agora nossa nave está completa.',
      cardTitle:
        'Unidade de condicionamento de energia recuperada do conjunto RTG/ALSEP!',
      cardDescription:
        'Ela entrega a tensão e a potência certas para cada sistema. Barra de reparo completa!',
      nextButtonLabel: 'Avançar para o final',
    },
    blockC: [
      {
        code: 'RTG-C1',
        text: 'Sem peças móveis, não há o que se desgastar. As sondas Voyager, lançadas em 1977, ainda funcionam com esse tipo de energia.',
      },
      {
        code: 'RTG-C2',
        text: 'Os RTGs das estações da Apollo foram projetados para durar 2 anos. Mas todos funcionaram de 5 a 8 anos.',
      },
      {
        code: 'RTG-C3',
        text: 'As estações foram desligadas em 1977. E lembra da Apollo 12? É a mesma missão que visitou a Surveyor 3.',
      },
      {
        code: 'RTG-C4',
        text: 'A Lua guarda muita história. Agora é hora de voltar para casa!',
      },
    ],
    animationCaption: 'RTG concluído! Sua nave está pronta para voltar à Terra.',
    completionNotice: 'RTG concluído! Sua nave está pronta para voltar à Terra.',
    backButtonLabel: 'Voltar ao Mapa',
  },
};

export interface NasaLink {
  label: string;
  url: string;
}

export interface FinalCardInfo {
  id: EquipmentId;
  title: string;
  summary: string;
  links: NasaLink[];
}

export const FINAL_SCREEN_TITLE =
  'Missão Cumprida! Você reparou a nave e explorou a história da NASA na Lua.';

export const FINAL_CARDS: FinalCardInfo[] = [
  {
    id: 'surveyor3',
    title: 'Surveyor 3',
    summary:
      'Sonda que mostrou que o solo lunar aguentava o peso de um módulo da Apollo.',
    links: [
      {
        label: 'Saiba mais na NASA: Missão Surveyor 3',
        url: 'https://science.nasa.gov/mission/surveyor-3/',
      },
    ],
  },
  {
    id: 'rtg',
    title: 'Radioisotope Thermoelectric Generator (RTG)',
    summary: 'A bateria nuclear que alimentou as estações científicas da Apollo.',
    links: [
      {
        label: 'Saiba mais na NASA: Sistemas de Energia RTG',
        url: 'https://science.nasa.gov/planetary-science/programs/radioisotope-power-systems/power-radioisotope-thermoelectric-generators/',
      },
      {
        label: 'Como funciona o Efeito Seebeck (NASA)',
        url: 'https://science.nasa.gov/resource/how-does-a-radioisotope-thermoelectric-generator-rtg-work-the-seebeck-effect/',
      },
      {
        label: 'RTG na Missão Cassini (NASA)',
        url: 'https://science.nasa.gov/mission/cassini/radioisotope-thermoelectric-generator/',
      },
    ],
  },
];

export const TOTAL_REQUIRED_PARTS = 4;

export function isNaveReady(collectedPartsCount: number): boolean {
  return collectedPartsCount >= TOTAL_REQUIRED_PARTS;
}

export function evaluateQuizAnswer(
  question: QuizQuestion,
  selected: 'A' | 'B' | 'C'
): { isCorrect: boolean; feedback: string } {
  const isCorrect = selected === question.correctLetter;
  return {
    isCorrect,
    feedback: isCorrect ? question.feedbackCorrect : question.feedbackIncorrect,
  };
}
