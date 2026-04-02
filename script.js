//SONS:
//Som que toca quando você erra o par = playSound(sounds.monster, 0.1)
//Som ambiente (estática) = playSound(sounds.static, 0.05)
//Som da Sirene = playSound(sounds.siren, 0.4)
//Som de Vitória = playSound(sounds.victory, 0.5)
//Final do Cachorro = playSound(sounds.dog, 0.6)

document.addEventListener("DOMContentLoaded", () => {
  // --- DADOS DO JOGO ---
  const ALL_CARDS = [
    { name: "James", img: "img/james.jpg", type: "human" },
    { name: "Mary", img: "img/mary.jpg", type: "human" },
    { name: "Nurse", img: "img/nurse.jpg", type: "monster" },
    { name: "Lying Figure", img: "img/lyingf1.png", type: "monster" },
    { name: "Radio", img: "img/radio.webp", type: "item" },
    { name: "Flashlight", img: "img/flashlight.webp", type: "item" },
    { name: "Robbie", img: "img/robbie.jpg", type: "other" },
    { name: "Abstract Daddy", img: "img/abstdad.jpg", type: "boss" },
    { name: "Pyramid Head", img: "img/pyramid_head.jpg", type: "boss" },
    { name: "Maria", img: "img/maria.jpg", type: "human" },
  ];

  // --- VERIFICAÇOES DE JOGO ---
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // --- CONFIGURAÇÕES DE DIFICULDADE ---
  const difficultySettings = {
    easy: {
      pairs: 6,
      sanityLoss: 5,
      gridClasses: "grid-cols-3 sm:grid-cols-4",
    },
    medium: { pairs: 8, sanityLoss: 10, gridClasses: "grid-cols-4" },
    hard: {
      pairs: 10,
      sanityLoss: 15,
      gridClasses: "grid-cols-4 md:grid-cols-5",
    },
  };

  // --- ELEMENTOS DO DOM ---
  const elements = {
    board: document.getElementById("game-board"),
    stepCounter: document.getElementById("step-counter"),
    timeCounter: document.getElementById("time-counter"),
    sanityBar: document.getElementById("sanity-bar-fill"),
    restartBtn: document.getElementById("restart-btn"),
    victoryScreen: document.getElementById("victory-screen"),
    playAgainBtn: document.getElementById("play-again-btn"),
    startMenu: document.getElementById("start-menu"),
    gameContainer: document.getElementById("game-container"),
    difficultyBtns: document.querySelectorAll(".difficulty-btn"),
    body: document.body,
    radioTrigger: document.getElementById("radio-trigger"),
    dogEndingScreen: document.getElementById("dog-ending-screen"),
    dogEndingCloseBtn: document.getElementById("dog-ending-close-btn"),
    dogVideo: document.getElementById("dog-video-bg"),
    screenGameOver: document.getElementById("screen-game-over"),
    videoGameOver: document.getElementById("video-game-over"),
    gameOverCloseBtn: document.getElementById("game-over-close-btn"),
    navTitle: document.getElementById("nav-title"),
  };

  // --- ELEMENTOS DE ÁUDIO ---
  const sounds = {
    static: document.getElementById("static-sound"),
    siren: document.getElementById("siren-sound"),
    monster: document.getElementById("monster-sound"),
    flip: document.getElementById("flip-sound"),
    victory: document.getElementById("victory-sound"),
  };

  // --- ESTADO DO JOGO ---
  let game = null;
  let userHasInteracted = false;

  // --- CONSTRUTOR DE ESTADO ---
  function GameState(difficulty) {
    const settings = difficultySettings[difficulty];
    this.difficulty = difficulty;
    this.pairsToMatch = settings.pairs;
    this.sanityLossPerMistake = settings.sanityLoss;
    this.gridClasses = settings.gridClasses;
    this.flippedCards = [];
    this.matchedCount = 0;
    this.steps = 0;
    this.timer = 0;
    this.sanity = 100;
    this.isLocked = false;
    this.isGameOver = false;
    this.timerInterval = null;
  }

  // --- UTILITARIOS DE MIDIA ---

  function fadeOutSound(sound, duration = 1000) {
    if (!sound || sound.paused) return;
    const step = sound.volume / (duration / 50);
    const fade = setInterval(() => {
      if (sound.volume > step) {
        sound.volume = Math.max(0, sound.volume - step);
      } else {
        sound.volume = 0;
        sound.pause();
        sound.currentTime = 0;
        clearInterval(fade);
      }
    }, 50);
  }

  function stopAllMedia(exclude = []) {
    Object.entries(sounds).forEach(([key, sound]) => {
      if (!exclude.includes(key) && sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    });
    if (!exclude.includes("dogVideo") && elements.dogVideo) {
      elements.dogVideo.pause();
      elements.dogVideo.currentTime = 0;
    }
    if (!exclude.includes("videoGameOver") && elements.videoGameOver) {
      elements.videoGameOver.pause();
      elements.videoGameOver.currentTime = 0;
    }
  }

  function playSound(sound, volume = 1.0) {
    if (!sound) return;
    sound.volume = volume;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  // --- TELAS: MOSTRAR / ESCONDER ---
  function showScreen(el, useFlexDisplay = true) {
    el.classList.remove("hidden");
    if (useFlexDisplay) el.classList.add("flex");
  }

  function hideScreen(el) {
    el.classList.add("hidden");
    el.classList.remove("flex");
  }

  // --- LOGICA PRINCIPAL ---
  function initGame(difficulty) {
    if (game?.timerInterval) clearInterval(game.timerInterval);

    stopAllMedia();
    playSound(sounds.static, 0.05);
    userHasInteracted = true;

    game = new GameState(difficulty);

    hideScreen(elements.startMenu);
    hideScreen(elements.victoryScreen);
    hideScreen(elements.dogEndingScreen);
    hideScreen(elements.screenGameOver);
    showScreen(elements.gameContainer);

    elements.body.classList.remove("otherworld");

    createCards();

    elements.stepCounter.textContent = "0";
    elements.timeCounter.textContent = "00:00";
    updateSanity(0);

    game.timerInterval = setInterval(() => updateStats("time"), 1000);
  }

  function showStartMenu() {
    if (game?.timerInterval) {
      clearInterval(game.timerInterval);
      game.timerInterval = null;
    }

    stopAllMedia();

    hideScreen(elements.gameContainer);
    hideScreen(elements.victoryScreen);
    hideScreen(elements.dogEndingScreen);
    hideScreen(elements.screenGameOver);
    showScreen(elements.startMenu);

    elements.startMenu.scrollIntoView({ behavior: "auto" });
  }

  function triggerDogEnding() {
    if (!game || game.isGameOver) return;

    game.isGameOver = true;
    clearInterval(game.timerInterval);
    stopAllMedia();

    hideScreen(elements.gameContainer);
    showScreen(elements.dogEndingScreen);

    elements.dogVideo?.play();
    playSound(sounds.dog, 0.3);
  }

  // --- CRIAÇAO DE CARTAS ---
  function createCards() {
    const cardPool = ALL_CARDS.slice(0, game.pairsToMatch);
    const gameCardsData = [...cardPool, ...cardPool].sort(
      () => 0.5 - Math.random(),
    );

    elements.board.innerHTML = "";
    elements.board.className = `grid gap-4 mx-auto w-full max-w-5xl flex-grow ${game.gridClasses}`;

    gameCardsData.forEach((cardData) => {
      elements.board.appendChild(createCardElement(cardData));
    });
  }

  function createCardElement(cardData) {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.dataset.name = cardData.name;
    cardEl.dataset.type = cardData.type;
    cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-back"></div>
                <div class="card-face card-front" style="background-image: url('${cardData.img}')"></div>
            </div>`;

    cardEl.addEventListener("click", () => handleCardClick(cardEl, cardData));
    if (!isTouchDevice) {
      cardEl.addEventListener("mouseenter", () =>
        handleCardHover(cardData.type),
      );
    }

    return cardEl;
  }

  // --- HANDLERS DE CARTA ---
  function handleCardClick(cardEl, cardData) {
    if (
      game.isLocked ||
      cardEl.classList.contains("flipped") ||
      cardEl.classList.contains("matched") ||
      game.isGameOver
    )
      return;

    playSound(sounds.flip);
    cardEl.classList.add("flipped");
    game.flippedCards.push({ element: cardEl, data: cardData });

    if (game.flippedCards.length === 2) processTurn();
  }

  function processTurn() {
    game.isLocked = true;
    updateStats("steps");

    const [card1, card2] = game.flippedCards;

    if (card1.data.name === card2.data.name) {
      setTimeout(handleMatch, 500);
    } else {
      setTimeout(handleMismatch, 1200);
    }
  }

  function handleMatch() {
    game.flippedCards.forEach((c) => {
      c.element.classList.add("matched", "pulse-matched");
    });
    game.matchedCount++;
    game.flippedCards = [];
    game.isLocked = false;
    checkWinCondition();
  }

  function handleMismatch() {
    playSound(sounds.monster, 0.1);
    game.flippedCards.forEach((c) => {
      c.element.classList.remove("flipped");
      c.element.classList.add("glitch");
      setTimeout(() => c.element.classList.remove("glitch"), 400);
    });
    game.flippedCards = [];
    updateSanity(-game.sanityLossPerMistake);
    game.isLocked = false;
  }

  // --- SANIDADE ---
  function updateSanity(change) {
    game.sanity = Math.max(0, Math.min(100, game.sanity + change));

    elements.sanityBar.style.width = `${game.sanity}%`;
    elements.sanityBar.style.backgroundColor =
      game.sanity > 60 ? "#00a600" : game.sanity > 30 ? "#d49d00" : "#a00000";

    if (game.sanity <= 50 && !elements.body.classList.contains("otherworld")) {
      enterOtherworld();
    }
    if (game.sanity <= 0 && !game.isGameOver) {
      triggerGameOver();
    }
  }

  function enterOtherworld() {
    playSound(sounds.siren, 0.4);
    elements.body.classList.add("otherworld");
    sounds.static.volume = 0.2;
  }

  function handleCardHover(type) {
    if (!game || game.isGameOver || !userHasInteracted) return;
    sounds.static.volume = type === "monster" || type === "boss" ? 0.15 : 0.05;
  }

  // --- STATS ---
  function updateStats(type) {
    if (game.isGameOver) return;
    if (type === "steps") {
      game.steps++;
      elements.stepCounter.textContent = game.steps;
    } else if (type === "time") {
      game.timer++;
      const mm = String(Math.floor(game.timer / 60)).padStart(2, "0");
      const ss = String(game.timer % 60).padStart(2, "0");
      elements.timeCounter.textContent = `${mm}:${ss}`;
      if (game.timer > 0 && game.timer % 15 === 0) updateSanity(-2);
    }
  }

  // --- CONDIÇÕES DE FIM ---
  function checkWinCondition() {
    if (game.matchedCount === game.pairsToMatch) triggerGameWin();
  }

  function triggerGameWin() {
    game.isGameOver = true;
    clearInterval(game.timerInterval);

    // fade suave na estatica antes de exibir vitoria
    fadeOutSound(sounds.static, 1500);
    stopAllMedia(["static"]);

    elements.body.classList.remove("otherworld");

    setTimeout(() => {
      playSound(sounds.victory, 0.5);
      showScreen(elements.victoryScreen);
    }, 1000);
  }

  function triggerGameOver() {
    game.isGameOver = true;
    clearInterval(game.timerInterval);
    stopAllMedia();

    elements.body.classList.remove("otherworld");

    setTimeout(() => {
      elements.screenGameOver.classList.remove("hidden");
      elements.screenGameOver.classList.add("flex");

      if (elements.videoGameOver) {
        elements.videoGameOver.play();
        elements.videoGameOver.muted = true;
      }
    }, 1000);

    stopAllMedia(["videoGameOver"]);
  }

  // --- EVENT LISTENERS ---
  elements.difficultyBtns.forEach((btn) => {
    btn.addEventListener("click", () => initGame(btn.dataset.difficulty));
  });

  elements.restartBtn.addEventListener("click", () => {
    if (game) initGame(game.difficulty);
  });

  elements.playAgainBtn.addEventListener("click", showStartMenu);
  elements.radioTrigger.addEventListener("click", triggerDogEnding);
  elements.dogEndingCloseBtn.addEventListener("click", showStartMenu);

  elements.gameOverCloseBtn.addEventListener("click", () => {
    hideScreen(elements.screenGameOver);
    showStartMenu();
  });

  elements.navTitle.addEventListener("click", () => {
    if (confirm("Deseja abandonar as memórias e voltar ao menu principal?")) {
      showStartMenu();
    }
  });
});
