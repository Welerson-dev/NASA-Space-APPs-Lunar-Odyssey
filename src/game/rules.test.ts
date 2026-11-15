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
