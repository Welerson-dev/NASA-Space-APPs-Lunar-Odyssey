import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ASTRONAUT_START_MAP_POS,
  EQUIPMENT_SCRIPTS,
  FINAL_CARDS,
  NAVE_MAP_POS,
  NEIL_ARMSTRONG_QUOTE,
  PROXIMITY_RADIUS,
  RTG_MAP_POS,
  SURVEYOR_MAP_POS,
  TOTAL_REQUIRED_PARTS,
  clampToLunarSurface,
  countCollectedParts,
  createInitialEquipmentProgress,
  createInitialInventory,
  evaluateQuizAnswer,
  getMapDistance,
  getMissionBubbleText,
  isNaveReady,
} from './missionData';

test('Free-roam map coordinates place RTG left, Nave center, Surveyor 3 right, and clamp to lunar surface', () => {
  assert.ok(RTG_MAP_POS.x < NAVE_MAP_POS.x && SURVEYOR_MAP_POS.x > NAVE_MAP_POS.x);
  assert.ok(
    getMapDistance(ASTRONAUT_START_MAP_POS, NAVE_MAP_POS) > PROXIMITY_RADIUS
  );

  // Attempting to walk into space above the horizon clamps down onto lunar terrain
  const clampedSky = clampToLunarSurface(50, 2);
  assert.ok(clampedSky.y >= 24);

  const clampedOutOfBounds = clampToLunarSurface(-10, 120);
  assert.equal(clampedOutOfBounds.x, 5);
  assert.equal(clampedOutOfBounds.y, 92);
});

test('Isolated 4-part boolean inventory strictly separates Surveyor 3 and RTG parts', () => {
  const inv = createInitialInventory();
  assert.equal(countCollectedParts(inv), 0);
  assert.equal(isNaveReady(countCollectedParts(inv)), false);

  const s3 = EQUIPMENT_SCRIPTS.surveyor3;
  const rtg = EQUIPMENT_SCRIPTS.rtg;

  assert.equal(s3.reward1.partKey, 'peca1_cameraTV');
  assert.equal(s3.reward2.partKey, 'peca2_conchaColetora');
  assert.equal(rtg.reward1.partKey, 'peca3_termopares');
  assert.equal(rtg.reward2.partKey, 'peca4_condicionamentoEnergia');

  assert.equal(s3.question1.collectButtonLabel, 'Coletar Peça: Sistema de câmera de TV');
  assert.equal(s3.question2.collectButtonLabel, 'Coletar Peça: Concha coletora');
  assert.equal(rtg.question1.collectButtonLabel, 'Coletar Peça: Conjunto de 442 termopares');
  assert.equal(rtg.question2.collectButtonLabel, 'Coletar Peça: Unidade de condicionamento de energia');

  inv.peca1_cameraTV = true;
  assert.equal(countCollectedParts(inv), 1);
  inv.peca3_termopares = true;
  assert.equal(countCollectedParts(inv), 2);
  inv.peca2_conchaColetora = true;
  assert.equal(countCollectedParts(inv), 3);
  assert.equal(isNaveReady(countCollectedParts(inv)), false);

  inv.peca4_condicionamentoEnergia = true;
  assert.equal(countCollectedParts(inv), TOTAL_REQUIRED_PARTS);
  assert.equal(isNaveReady(countCollectedParts(inv)), true);

  const prog = createInitialEquipmentProgress();
  assert.equal(prog.surveyor3.step, 1);
  assert.equal(prog.rtg.step, 1);
  assert.equal(prog.surveyor3.completed, false);
  assert.equal(prog.rtg.completed, false);

  const emptyInv = createInitialInventory();
  assert.ok(getMissionBubbleText(emptyInv, prog).includes('Explore o RTG'));
  prog.surveyor3.completed = true;
  assert.ok(getMissionBubbleText(emptyInv, prog).includes('falta explorar o RTG'.replace('f', 'F')) || getMissionBubbleText(emptyInv, prog).includes('RTG'));
  assert.ok(getMissionBubbleText(inv, prog).includes('Nave consertada (4/4)'));
  assert.ok(NEIL_ARMSTRONG_QUOTE.includes('pequeno passo'));
});

test('Surveyor 3 and RTG scripts contain all blocks, speech codes, rewards, and 4 quizzes', () => {
  const s3 = EQUIPMENT_SCRIPTS.surveyor3;
  const rtg = EQUIPMENT_SCRIPTS.rtg;

  assert.equal(s3.blockA.length, 7);
  assert.equal(s3.blockA[0].code, 'S3-A1');
  assert.equal(s3.blockA[6].code, 'S3-A7');
  assert.equal(s3.blockB.length, 5);
  assert.equal(s3.blockC.length, 5);
  assert.equal(s3.reward1.speechCode, 'S3-R1');
  assert.equal(s3.reward2.speechCode, 'S3-R2');

  assert.equal(rtg.blockA.length, 5);
  assert.equal(rtg.blockA[0].code, 'RTG-A1');
  assert.equal(rtg.blockB.length, 5);
  assert.equal(rtg.blockC.length, 4);
  assert.equal(rtg.reward1.speechCode, 'RTG-R3');
  assert.equal(rtg.reward2.speechCode, 'RTG-R4');
});

test('All 4 multiple-choice questions evaluate right and wrong answers and final cards contain 4 NASA URLs', () => {
  const s3 = EQUIPMENT_SCRIPTS.surveyor3;
  const rtg = EQUIPMENT_SCRIPTS.rtg;

  assert.equal(evaluateQuizAnswer(s3.question1, 'B').isCorrect, true);
  assert.equal(evaluateQuizAnswer(s3.question1, 'A').isCorrect, false);
  assert.ok(evaluateQuizAnswer(s3.question1, 'A').feedback.includes('6.326 imagens'));

  assert.equal(evaluateQuizAnswer(s3.question2, 'C').isCorrect, true);
  assert.equal(evaluateQuizAnswer(s3.question2, 'B').isCorrect, false);

  assert.equal(evaluateQuizAnswer(rtg.question1, 'A').isCorrect, true);
  assert.equal(evaluateQuizAnswer(rtg.question1, 'C').isCorrect, false);

  assert.equal(evaluateQuizAnswer(rtg.question2, 'B').isCorrect, true);
  assert.equal(evaluateQuizAnswer(rtg.question2, 'C').isCorrect, false);

  const allUrls = FINAL_CARDS.flatMap((c) => c.links.map((l) => l.url));
  assert.equal(allUrls.length, 4);
  assert.ok(allUrls.every((u) => u.startsWith('https://science.nasa.gov/')));
});

import {
  EQUIPMENT_SCRIPTS_EN,
  FINAL_CARDS_EN,
  UI_TEXT,
  getEquipmentScript,
  getFinalCards,
  getLocalizedMissionBubbleText,
} from './i18n';
import { selectEnglishMaleVoice } from './tts';

test('English translations preserve exact structure, part keys, speech codes, quiz keys, and NASA URLs', () => {
  for (const id of ['surveyor3', 'rtg'] as const) {
    const pt = EQUIPMENT_SCRIPTS[id];
    const en = getEquipmentScript(id, 'en');
    assert.equal(getEquipmentScript(id, 'pt'), pt);
    assert.equal(en, EQUIPMENT_SCRIPTS_EN[id]);

    assert.equal(en.blockA.length, pt.blockA.length);
    assert.equal(en.blockB.length, pt.blockB.length);
    assert.equal(en.blockC.length, pt.blockC.length);
    assert.deepEqual(
      en.blockA.map((b) => b.code),
      pt.blockA.map((b) => b.code)
    );
    assert.deepEqual(
      en.blockB.map((b) => b.code),
      pt.blockB.map((b) => b.code)
    );
    assert.deepEqual(
      en.blockC.map((b) => b.code),
      pt.blockC.map((b) => b.code)
    );

    assert.equal(en.question1.correctLetter, pt.question1.correctLetter);
    assert.equal(en.question2.correctLetter, pt.question2.correctLetter);
    assert.equal(en.reward1.partKey, pt.reward1.partKey);
    assert.equal(en.reward2.partKey, pt.reward2.partKey);
    assert.equal(en.reward1.speechCode, pt.reward1.speechCode);
    assert.equal(en.reward2.speechCode, pt.reward2.speechCode);
  }

  assert.deepEqual(
    getFinalCards('en').flatMap((c) => c.links.map((l) => l.url)),
    FINAL_CARDS.flatMap((c) => c.links.map((l) => l.url))
  );
  assert.equal(FINAL_CARDS_EN.length, 2);

  const emptyInv = createInitialInventory();
  const prog = createInitialEquipmentProgress();
  assert.ok(getLocalizedMissionBubbleText(emptyInv, prog, 'en').includes('4 repair parts'));
  assert.ok(UI_TEXT.en.neilQuote.includes('One small step'));

  const s3BlockA = EQUIPMENT_SCRIPTS_EN.surveyor3.blockA;
  assert.ok(s3BlockA[0].text.includes('robot probe'));
  assert.ok(s3BlockA[6].text.includes('6,326 images'));
  for (let i = 0; i < s3BlockA.length; i++) {
    const clip = s3BlockA[i].audioClip;
    assert.ok(clip && clip.src.startsWith('/assets/aistudio/'));
    if (i > 0) {
      const prevClip = s3BlockA[i - 1].audioClip!;
      assert.ok((clip.start ?? 0) > (prevClip.end ?? 0));
    }
  }

  const s3Reward1 = EQUIPMENT_SCRIPTS_EN.surveyor3.reward1;
  assert.ok(s3Reward1.speechText.includes('television camera system'));
  assert.ok(s3Reward1.audioClip?.src.startsWith('/assets/aistudio/'));

  const s3BlockB = EQUIPMENT_SCRIPTS_EN.surveyor3.blockB;
  assert.ok(s3BlockB.every((b) => b.audioClip?.src.includes('3_017c2413.mp3')));
  assert.ok(EQUIPMENT_SCRIPTS_EN.surveyor3.reward2.audioClip?.src.includes('4_526953bc.mp3'));
  assert.ok(EQUIPMENT_SCRIPTS_EN.surveyor3.blockC[0].audioClip?.src.includes('5_487b62a8.mp3'));
  assert.ok(EQUIPMENT_SCRIPTS_EN.surveyor3.blockC[2].audioClip?.src.includes('6_17107dca.mp3'));

  const rtgEn = EQUIPMENT_SCRIPTS_EN.rtg;
  assert.ok(rtgEn.blockA[0].audioClip?.src.includes('7_0181c58b.mp3'));
  assert.ok(rtgEn.blockA[2].audioClip?.src.includes('8_2f8f4d9e.mp3'));
  assert.ok(rtgEn.blockA[4].audioClip?.src.includes('9_74ec9603.mp3'));
  assert.ok(rtgEn.reward1.audioClip?.src.includes('10_d303bcfb.mp3'));
  assert.ok(rtgEn.blockB[0].audioClip?.src.includes('11_590ca3c0.mp3'));
  assert.ok(rtgEn.blockB[1].audioClip?.src.includes('12_1dce6267.mp3'));
  assert.ok(rtgEn.reward2.speechText.includes('Now our ship is complete.'));
  assert.equal(rtgEn.reward2.audioClip, undefined);
  assert.ok(rtgEn.blockC.every((b) => b.audioClip?.src.includes('14_0d055909.mp3')));
});

test('selectEnglishMaleVoice prefers male English voices over female ones', () => {
  const mixedVoices = [
    { name: 'Google português do Brasil', lang: 'pt-BR' },
    { name: 'Samantha', lang: 'en-US' },
    { name: 'Microsoft Zira - English (United States)', lang: 'en-US' },
    { name: 'Microsoft David - English (United States)', lang: 'en-US' },
  ];
  assert.equal(
    selectEnglishMaleVoice(mixedVoices)?.name,
    'Microsoft David - English (United States)'
  );

  const macVoices = [
    { name: 'Karen', lang: 'en-AU' },
    { name: 'Daniel', lang: 'en-GB' },
  ];
  assert.equal(selectEnglishMaleVoice(macVoices)?.name, 'Daniel');

  const fallbackVoices = [
    { name: 'Samantha', lang: 'en-US' },
    { name: 'Custom English Voice', lang: 'en-US' },
  ];
  assert.equal(selectEnglishMaleVoice(fallbackVoices)?.name, 'Custom English Voice');
  assert.equal(selectEnglishMaleVoice([{ name: 'Luciana', lang: 'pt-BR' }]), undefined);
});

test('Portuguese scripts map all 12 .mpeg files cleanly with increasing segment boundaries and Anterior/Previous labels', () => {
  assert.equal(UI_TEXT.pt.previousBtn, 'Anterior');
  assert.equal(UI_TEXT.en.previousBtn, 'Previous');

  const s3 = EQUIPMENT_SCRIPTS.surveyor3;
  const rtg = EQUIPMENT_SCRIPTS.rtg;

  const assertMonotonicFile = (
    balloons: { code: string; audioClip?: { src: string; start?: number; end?: number } }[],
    expectedFile: string
  ) => {
    for (let i = 0; i < balloons.length; i++) {
      const clip = balloons[i].audioClip;
      assert.ok(clip, `Missing audioClip on ${balloons[i].code}`);
      assert.ok(clip.src.includes(expectedFile), `Expected ${expectedFile} on ${balloons[i].code}`);
      if (i > 0) {
        const prev = balloons[i - 1].audioClip!;
        assert.ok(
          (clip.start ?? 0) > (prev.end ?? 0),
          `Overlapping segment between ${balloons[i - 1].code} and ${balloons[i].code}`
        );
      }
    }
  };

  assertMonotonicFile(s3.blockA, '2_d01335d1.mpeg');
  assert.ok(s3.reward1.audioClip?.src.includes('3_f8ff1186.mpeg'));
  assertMonotonicFile(s3.blockB, '4_0f0a784e.mpeg');
  assert.ok(s3.reward2.audioClip?.src.includes('5_2a36ad77.mpeg'));
  assertMonotonicFile(s3.blockC.slice(0, 2), '6_d9aec375.mpeg');
  assertMonotonicFile(s3.blockC.slice(2), '7_449ae5f8.mpeg');

  assertMonotonicFile(rtg.blockA.slice(0, 2), '8_d6ba7fc3.mpeg');
  assertMonotonicFile(rtg.blockA.slice(2), '9_3e2a656d.mpeg');
  assert.ok(rtg.reward1.audioClip?.src.includes('10_7dbddcff.mpeg'));
  assertMonotonicFile(rtg.blockB, '11_60d39135.mpeg');
  assert.ok(rtg.reward2.audioClip?.src.includes('12_783f2ef1.mpeg'));
  assertMonotonicFile(rtg.blockC, '13_eb6ebcdd.mpeg');
});

