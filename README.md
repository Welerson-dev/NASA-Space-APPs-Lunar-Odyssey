# Lunar Odyssey

Projeto desenvolvido para o NASA Space Apps Challenge.

## Versão em Português

### Sobre o Projeto
Hoje existe uma grande dificuldade para os jovens descobrirem um novo interesse em ciência e astronomia, pois os materiais didáticos disponíveis costumam ser densos. O Lunar Odyssey apresenta esses dados científicos de forma intuitiva e gamificada, instigando o jovem a buscar conhecimento por conta própria.

O projeto adota uma estética em pixel art com visão Top Down (visão de cima) e trilhas pela superfície lunar que conectam a nave central aos equipamentos históricos reais deixados pela NASA na Lua.

### História e Dinâmica do Jogo
1. Introdução: o jogador inicia em uma missão de reconhecimento lunar quando sua nave sofre uma pane inesperada.
2. Objetivo: para consertar a nave e retornar para a Terra, o astronauta precisa explorar o solo lunar e coletar 4 peças de reparo nos equipamentos deixados pela NASA.
3. Deslocamento: o jogador caminha pelas trilhas lunares clicando no mapa ou utilizando o teclado (teclas WASD ou setas direcionais) até alcançar cada artefato.
4. Sonda Surveyor 3: ao interagir com o equipamento à direita, o jogador conhece a história do pouso de 1967, responde a dois desafios interativos e coleta o Sistema de Câmera de TV (peça 1 de 4) e a Concha Coletora de Solo (peça 2 de 4), preenchendo metade da barra de reparo.
5. Gerador RTG (SNAP 27): ao explorar o equipamento à esquerda, o jogador aprende sobre a geração de energia nuclear nas missões Apollo, responde às perguntas e coleta os Termopares de Telureto de Chumbo (peça 3 de 4) e a Unidade de Condicionamento de Energia (peça 4 de 4), completando a barra de reparo.
6. Finalização e Decolagem: com as 4 peças coletadas, o jogador retorna ao foguete central, assiste à animação de decolagem rumo à Terra e acessa a tela final com resumos históricos e links oficiais da NASA para aprofundar seus estudos.

### Funcionalidades da Versão Final
* Suporte bilíngue completo: alternância instantânea entre Português (PT) e Inglês (EN) em toda a interface, diálogos, perguntas e telas finais.
* Narração em áudio por Inteligência Artificial: faixas de voz dedicadas em português e inglês sincronizadas com cada etapa da história, contando também com síntese de voz nativa como suporte complementar.
* Mapa lunar interativo em visão Top Down: movimentação fluida por clique ou teclado, detecção de proximidade e animações de indicação nos equipamentos.
* Efeitos sonoros retrô: áudio sintetizado em tempo real via Web Audio API para passos, cliques, recompensas e decolagem.
* Demonstrações visuais animadas: cada equipamento apresenta animações exclusivas ao final da jornada explicativa.

### Tecnologias Utilizadas
* React 19 e TypeScript
* Vite e Tailwind CSS
* Web Audio API e Web Speech API

### Como Executar Localmente

Pré requisitos: Node.js instalado.

1. Instale as dependências:
```bash
npm install
```

2. Configure a variável de ambiente no arquivo .env.local (opcional):
```env
GEMINI_API_KEY=sua_chave_aqui
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

***

## English Version

### About the Project
Nowadays it is difficult for young students to discover a genuine interest in science and astronomy because most available educational materials are dense. Lunar Odyssey presents scientific and historical space data in an intuitive, gamified way to inspire young learners to explore knowledge on their own.

The application uses a pixel art Top Down perspective with lunar pathways connecting the central spacecraft to authentic historical equipment left on the Moon by NASA.

### Story and Gameplay Flow
1. Introduction: the player begins a lunar reconnaissance mission when the spacecraft suffers an unexpected breakdown.
2. Objective: to repair the ship and return to Earth, the astronaut must explore the lunar surface and collect 4 repair parts from historical NASA artifacts.
3. Movement: the player walks along the lunar trails by clicking on the map or using keyboard controls (WASD or arrow keys) to reach each site.
4. Surveyor 3 Probe: interacting with the probe on the right teaches the player about the 1967 landing through narrated dialogues and two interactive quizzes, rewarding the TV Camera System (part 1 of 4) and the Soil Scoop Sampler (part 2 of 4) to fill half of the repair bar.
5. RTG Power Generator (SNAP 27): exploring the generator on the left explains how nuclear power sustained the Apollo lunar experiments, rewarding the Lead Telluride Thermocouples (part 3 of 4) and the Power Conditioning Unit (part 4 of 4) to complete the repair bar.
6. Takeoff and Conclusion: once all 4 parts are collected, the player returns to the central rocket, watches the animated launch back to Earth, and reaches the final screen featuring historical summaries and official NASA links for further learning.

### Final Version Features
* Full bilingual support: instant switching between Portuguese (PT) and English (EN) across all menus, dialogues, quizzes, and summary cards.
* AI voice narration: dedicated voiceover audio tracks in both Portuguese and English synchronized with dialogue balloons, supported by browser Web Speech synthesis fallback.
* Interactive Top Down lunar map: smooth click to walk and keyboard navigation, proximity detection, and hover animations on interactive targets.
* Retro sound effects: real time synthesized audio via Web Audio API for footsteps, UI interactions, rewards, and rocket launch.
* Animated visual demonstrations: custom stage animations illustrating the historical context of each lunar artifact.

### Tech Stack
* React 19 and TypeScript
* Vite and Tailwind CSS
* Web Audio API and Web Speech API

### How to Run Locally

Prerequisites: Node.js installed.

1. Install dependencies:
```bash
npm install
```

2. Set your environment variable in .env.local (optional):
```env
GEMINI_API_KEY=your_api_key_here
```

3. Start the development server:
```bash
npm run dev
```
