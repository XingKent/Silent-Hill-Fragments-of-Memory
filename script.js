// Constantes e Variáveis Globais
const CARD_DATA = [
    { name: 'James', img: 'img/james.jpg', type: 'human' },
    { name: 'Mary', img: 'img/mary.jpg', type: 'human' },
    { name: 'Nurse', img: 'img/nurse.jpg', type: 'monster' },
    { name: 'Lying Figure', img: '', type: 'monster' },
    { name: 'Radio', img: '', type: 'item' },
    { name: 'Flashlight', img: '', type: 'item' },
    { name: 'Robbie', img: '', type: 'other' },
    { name: 'Pyramid Head', img: 'img/pyramid_head.jpg', type: 'boss' }
];

let game;

// Elementos do DOM
const elements = {
    board: document.getElementById('game-board'),
    stepCounter: document.getElementById('step-counter'),
    timeCounter: document.getElementById('time-counter'),
    sanityBar: document.getElementById('sanity-bar-fill'),
    restartBtn: document.getElementById('restart-btn'),
    victoryScreen: document.getElementById('victory-screen'),
    playAgainBtn: document.getElementById('play-again-btn'),
    body: document.body
};

const sounds = {
    static: document.getElementById('static-sound'),
    siren: document.getElementById('siren-sound'),
    monster: document.getElementById('monster-sound'),
    flip: document.getElementById('flip-sound'),
    match: document.getElementById('match-sound'),
    victory: document.getElementById('victory-sound')
};

// Construtor do Estado do Jogo
function GameState() {
    this.cards = [];
    this.flippedCards = [];
    this.matchedCount = 0;
    this.steps = 0;
    this.timer = 0;
    this.sanity = 100;
    this.isLocked = false;
    this.isGameOver = false;
    this.timerInterval = null;
}

// Funções do Jogo
function createCardElement(cardData) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.dataset.name = cardData.name;
    cardEl.dataset.type = cardData.type;

    cardEl.innerHTML = `
        <div class="card-inner">
            <div class="card-face card-back"></div>
            <div class="card-face card-front" style="background-image: url('${cardData.img}')"></div>
        </div>`;
    
    cardEl.addEventListener('click', () => handleCardClick(cardEl, cardData));
    cardEl.addEventListener('mouseenter', () => handleCardHover(cardData.type));
    
    return cardEl;
}

function handleCardClick(cardEl, cardData) {
    if (game.isLocked || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched') || game.isGameOver) return;
    
    playSound(sounds.flip);
    cardEl.classList.add('flipped');
    game.flippedCards.push({ element: cardEl, data: cardData });

    if (game.flippedCards.length === 2) {
        processTurn();
    }
}

function processTurn() {
    game.isLocked = true;
    updateStats('steps');
    const [card1, card2] = game.flippedCards;
    
    if (card1.data.name === card2.data.name) {
        setTimeout(handleMatch, 500);
    } else {
        setTimeout(handleMismatch, 1200);
    }
}

function handleMatch() {
    playSound(sounds.match);
    game.flippedCards.forEach(c => {
        c.element.classList.add('matched', 'pulse-matched');
    });
    game.matchedCount++;
    game.flippedCards = [];
    game.isLocked = false;
    checkWinCondition();
}

function handleMismatch() {
    playSound(sounds.monster, 0.7);
    game.flippedCards.forEach(c => {
        c.element.classList.remove('flipped');
        c.element.classList.add('glitch');
        setTimeout(() => c.element.classList.remove('glitch'), 400);
    });
    game.flippedCards = [];
    updateSanity(-15);
    game.isLocked = false;
}

function updateSanity(change) {
    // 1. Calcula o novo valor da sanidade
    game.sanity = Math.max(0, game.sanity + change);

    // 2. Atualiza a LARGURA da barra de preenchimento
    elements.sanityBar.style.width = `${game.sanity}%`;

    // 3. Atualiza a COR da barra com base na porcentagem
    if (game.sanity > 60) {
        elements.sanityBar.style.backgroundColor = '#00a600'; // Verde
    } else if (game.sanity > 30) {
        elements.sanityBar.style.backgroundColor = '#d49d00'; // Amarelo/Âmbar
    } else {
        elements.sanityBar.style.backgroundColor = '#a00000'; // Vermelho
    }

    // 4. Lógica para entrar no "Otherworld" e "Game Over"
    if (game.sanity <= 50 && !elements.body.classList.contains('otherworld')) {
        enterOtherworld();
    }
    if (game.sanity <= 0) {
        triggerGameOver("Your sanity has been shattered...");
    }
}

function enterOtherworld() {
    playSound(sounds.siren, 0.4);
    elements.body.classList.add('otherworld');
    sounds.static.volume = 0.2;
}

function handleCardHover(type) {
    if (game.isGameOver) return;
    if (type === 'monster' || type === 'boss') {
        sounds.static.volume = 0.15;
    } else {
        sounds.static.volume = 0.05;
    }
}

function playSound(sound, volume = 1.0) {
    sound.volume = volume;
    sound.currentTime = 0;
    sound.play().catch(error => console.error("Audio play failed:", error)); // Adicionado para evitar erros no console
}

function updateStats(type) {
    if (type === 'steps') {
        game.steps++;
        elements.stepCounter.textContent = game.steps;
    } else if (type === 'time') {
        game.timer++;
        const minutes = String(Math.floor(game.timer / 60)).padStart(2, '0');
        const seconds = String(game.timer % 60).padStart(2, '0');
        elements.timeCounter.textContent = `${minutes}:${seconds}`;
        if (game.timer > 0 && game.timer % 15 === 0) updateSanity(-2); // Perda passiva de sanidade
    }
}

function checkWinCondition() {
    const totalPairs = CARD_DATA.length;
    if (game.matchedCount === totalPairs) {
        game.isGameOver = true;
        clearInterval(game.timerInterval);
        sounds.static.pause();
        setTimeout(() => {
            playSound(sounds.victory, 0.5);
            elements.victoryScreen.classList.remove('hidden');
            elements.victoryScreen.classList.add('flex');
        }, 1000);
    }
}

function triggerGameOver(message) {
    game.isGameOver = true;
    clearInterval(game.timerInterval);
    sounds.static.pause();
    setTimeout(() => {
        alert(message);
        init();
    }, 1000);
}

function init() {
    game = new GameState();
    elements.victoryScreen.classList.add('hidden');
    elements.victoryScreen.classList.remove('flex');
    elements.board.innerHTML = '';
    elements.body.classList.remove('otherworld');
    
    // Para e reseta todos os sons
    Object.values(sounds).forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
    });
    
    // Duplica as cartas e embaralha
    const gameCardsData = [...CARD_DATA, ...CARD_DATA]
        .sort(() => 0.5 - Math.random());
    
    gameCardsData.forEach(cardData => {
        const cardEl = createCardElement(cardData);
        elements.board.appendChild(cardEl);
    });
    
    // Reseta a interface do usuário
    elements.stepCounter.textContent = '0';
    elements.timeCounter.textContent = '00:00';
    updateSanity(100 - game.sanity); // Reseta a sanidade para 100
    
    // Inicia o timer e o som ambiente
    if (game.timerInterval) clearInterval(game.timerInterval);
    game.timerInterval = setInterval(() => updateStats('time'), 1000);
    playSound(sounds.static, 0.05);
}

// Event Listeners para os botões
elements.restartBtn.addEventListener('click', init);
elements.playAgainBtn.addEventListener('click', init);

// Inicia o jogo assim que a página carrega
init(); 