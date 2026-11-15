# Lunar Odyssey

Projeto desenvolvido para o NASA Space Apps Challenge.

## Versão em Português

### Sobre o Projeto
Hoje existe uma grande dificuldade para os jovens descobrirem interesse genuíno em ciência e astronomia, pois os materiais didáticos tradicionais costumam ser densos e pouco atrativos. O Lunar Odyssey surge como uma solução interativa em formato de software educativo, apresentando dados científicos de maneira intuitiva e instigante.

A experiência utiliza uma visão Top Down com trilhas dinâmicas, permitindo ao usuário explorar a superfície da Lua e interagir diretamente com artefatos históricos espaciais.

### História e Dinâmica
1. O jogador inicia em uma missão de reconhecimento na Lua.
2. Durante o percurso, a nave sofre uma avaria grave.
3. Para consertar o veículo espacial, o astronauta precisa buscar peças de reposição pelo solo lunar.
4. Os recursos necessários são encontrados explorando equipamentos reais deixados pela NASA, como a sonda Surveyor 3 e o gerador RTG.
5. Em cada equipamento, o jogador aprende sobre a história e a função do instrumento através de diálogos interativos narrados por inteligência artificial.
6. Ao progredir na conversa, o jogador responde perguntas e coleta peças de metal para preencher a barra de reparo da nave (4 módulos no total).
7. Com todos os reparos concluídos, o jogador retorna ao foguete principal e assiste à decolagem com destino à Terra, acessando materiais adicionais de estudo.

### Funcionalidades
* Mapa lunar interativo em perspectiva Top Down com movimentação por pontos.
* Narrativa guiada com inteligência artificial e suporte a narração por áudio.
* Sistema progressivo de recompensas e barra de reparo.
* Conteúdo educativo baseado em missões reais da NASA.

### Como Executar

Requisitos: Node.js instalado no sistema.

1. Instale as dependências:
```bash
npm install
```

2. Configure a chave de API no arquivo .env.local:
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
Nowadays it is challenging for young students to spark interest in science and space exploration because conventional educational resources are often dense and text heavy. Lunar Odyssey provides an interactive educational experience designed to present complex space data intuitively, encouraging self directed learning.

The game features a Top Down perspective where players traverse lunar pathways and discover historical NASA equipment.

### Story and Gameplay
1. The player begins a lunar reconnaissance mission.
2. An unexpected failure damages the spacecraft.
3. The astronaut must venture across the Moon to recover spare parts to fix the ship.
4. Essential components are found by inspecting authentic NASA equipment left on the Moon, including the Surveyor 3 lander and the RTG power unit.
5. Each artifact offers interactive AI narrated stories and educational quizzes explaining its scientific purpose.
6. Progressing through the learning path rewards the player with repair parts to fill the ship progress bar (4 metal modules in total).
7. Once repairs are completed, the astronaut boards the rocket, launches back to Earth, and accesses curated links for further research.

### Features
* Interactive Top Down lunar map navigation.
* AI powered dialog system with speech narration.
* Educational quizzes and progress tracking repair bar.
* Accurate historical data based on NASA lunar missions.

### How to Run

Prerequisites: Node.js installed.

1. Install dependencies:
```bash
npm install
```

2. Set your API key in .env.local:
```env
GEMINI_API_KEY=your_api_key_here
```

3. Start the local server:
```bash
npm run dev
```
