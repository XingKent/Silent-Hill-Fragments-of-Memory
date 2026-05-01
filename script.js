// COLAS PARA OS FINAIS:
// Leave: terminar o jogo com mais de 20% de sanidade (final padrão)
// Maria: 5 cliques no titulo enquanto ta no Otherworld
// Rebirth: clicar na sequencia Abstract Daddy -> Mary -> Abstract Daddy
// In Water: temrinar o jogo com menos de 20% de sanidade
// UFO: clicar na sequencia Pyramid Head -> Pyramid Head -> Abstract Daddy -> James (só no Hard/Nightmare, e cartas precisam ter sido reveladas antes)
// Dog: clicar em 'radio' no rodapé 

document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // DADOS: FRASES ATMOSFÉRICAS (30 frases do SH2 original/remake)
  // ============================================================
  const ATMOSPHERIC_PHRASES = [
    "In my restless dreams, I see that town...",
    "You promised you'd take me there again someday.",
    "I was weak. That's why I needed you.",
    "There was a monster in that room. And it was me.",
    "This town... it's calling me back.",
    "Is it real? Or is it all in my head?",
    "I can hear something in the dark. It's getting closer.",
    "The fog swallows everything. Even the truth.",
    "I didn't kill her. I just... let her die.",
    "She looks just like Mary. But she isn't Mary.",
    "Why did you come here, James?",
    "Sometimes the only way out is through the dark.",
    "The radio crackles. Something is near.",
    "Nothing here is real. Nothing here is safe.",
    "I thought coming here would ease the pain.",
    "She was in pain. I wanted it to end.",
    "This place knows what I've done.",
    "The walls are bleeding again.",
    "She needs me. That's why she called me here.",
    "Everything in this town is a reflection of guilt.",
    "I thought I deserved to be punished.",
    "The monster you fear most wears your face.",
    "How long have I been walking in circles?",
    "There's a letter in my pocket. She wrote it months after she died.",
    "This isn't about finding her. It never was.",
    "Pyramid Head doesn't hunt me. He judges me.",
    "The truth was always there. I just refused to see it.",
    "I'm sorry, Mary. I'm so sorry.",
    "Silent Hill is different for everyone. It knows what you did.",
    "The fog doesn't hide the town. The town hides in you.",
  ];

  // ============================================================
  // DADOS DAS CARTAS
  // ============================================================
  const ALL_CARDS = [
    { name: "James",           img: "img/james.jpg",        type: "human",   powerup: "heal"    },
    { name: "Mary",            img: "img/mary.jpg",         type: "human",   powerup: null      },
    { name: "Nurse",           img: "img/nurse.jpg",        type: "monster", powerup: null      },
    { name: "Lying Figure",    img: "img/lyingf1.png",      type: "monster", powerup: null      },
    { name: "Radio",           img: "img/radio.webp",       type: "item",    powerup: "freeze"  },
    { name: "Flashlight",      img: "img/flashlight.webp",  type: "item",    powerup: "reveal"  },
    { name: "Robbie",          img: "img/robbie.jpg",       type: "other",   powerup: "chaos"   },
    { name: "Abstract Daddy",  img: "img/abstdad.jpg",      type: "boss",    powerup: null      },
    { name: "Pyramid Head",    img: "img/pyramid_head.jpg", type: "boss",    powerup: "execute" },
    { name: "Maria",           img: "img/maria.jpg",        type: "human",   powerup: "shuffle" },
    { name: "Eddie",           img: "img/eddie.jpg",        type: "human",   powerup: "rage"    },
    { name: "Angela",          img: "img/angela.jpg",       type: "human",   powerup: "vanish"  },
    { name: "Laura",           img: "img/laura.jpg",        type: "other",   powerup: "forget"  },
    { name: "Mannequin",       img: "img/mannequin.jpg",    type: "monster", powerup: null      },
    { name: "Maria Boss",      img: "img/maria_boss.jpg",   type: "boss",    powerup: null      },
  ];

  // ============================================================
  // CONFIGURAÇÕES
  // ============================================================
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const difficultySettings = {
    easy:      { pairs: 6,  sanityLoss: 5,  gridClasses: "grid-cols-3 sm:grid-cols-4" },
    medium:    { pairs: 8,  sanityLoss: 10, gridClasses: "grid-cols-4" },
    hard:      { pairs: 10, sanityLoss: 15, gridClasses: "grid-cols-4 md:grid-cols-5" },
    nightmare: { pairs: 15, sanityLoss: 20, gridClasses: "grid-cols-5" },
  };

  // ============================================================
  // ELEMENTOS DOM
  // ============================================================
  const elements = {
    board:               document.getElementById("game-board"),
    stepCounter:         document.getElementById("step-counter"),
    timeCounter:         document.getElementById("time-counter"),
    sanityBar:           document.getElementById("sanity-bar-fill"),
    restartBtn:          document.getElementById("restart-btn"),
    victoryScreen:       document.getElementById("victory-screen"),
    playAgainBtn:        document.getElementById("play-again-btn"),
    startMenu:           document.getElementById("start-menu"),
    gameContainer:       document.getElementById("game-container"),
    difficultyBtns:      document.querySelectorAll(".difficulty-btn"),
    body:                document.body,
    radioTrigger:        document.getElementById("radio-trigger"),
    dogEndingScreen:     document.getElementById("dog-ending-screen"),
    dogEndingCloseBtn:   document.getElementById("dog-ending-close-btn"),
    dogVideo:            document.getElementById("dog-video-bg"),
    screenGameOver:      document.getElementById("screen-game-over"),
    videoGameOver:       document.getElementById("video-game-over"),
    gameOverCloseBtn:    document.getElementById("game-over-close-btn"),
    navTitle:            document.getElementById("nav-title"),
    menuBtn:             document.getElementById("menu-btn"),
    atmosphericMsg:      document.getElementById("atmospheric-msg"),
    nightmareBadge:      document.getElementById("nightmare-badge"),
    powerupNotification: document.getElementById("powerup-notification"),
    endingLabel:         document.getElementById("ending-label"),
    ufoEndingScreen:     document.getElementById("ufo-ending-screen"),
    ufoVideo:            document.getElementById("ufo-video-bg"),
    ufoCloseBtn:         document.getElementById("ufo-ending-close-btn"),
    trueEndingScreen:    document.getElementById("true-ending-screen"),
    trueEndingVideo:     document.getElementById("true-ending-video"),
    trueEndingSource:    document.getElementById("true-ending-source"),
    trueEndingSkipBtn:   document.getElementById("true-ending-skip-btn"),
  };

  // ============================================================
  // ÁUDIO
  // ============================================================
  const sounds = {
    static:  document.getElementById("static-sound"),
    siren:   document.getElementById("siren-sound"),
    monster: document.getElementById("monster-sound"),
    flip:    document.getElementById("flip-sound"),
    victory: document.getElementById("victory-sound"),
  };

  // ============================================================
  // ESTADO DO JOGO
  // ============================================================
  let game = null;
  let userHasInteracted = false;

  // Estado dos easter eggs
  const easterEgg = {
    ufoSequence:     ["Pyramid Head", "Pyramid Head", "Abstract Daddy", "James"],
    ufoProgress:     [],
    rebirthSequence: ["Abstract Daddy", "Mary", "Abstract Daddy"],
    rebirthProgress: [],
    navTitleClicks:  0,
    navTitleTimer:   null,
    pendingEnding:   null, // 'leave' | 'maria' | 'inwater' | 'rebirth'
  };

  // Estado das mensagens atmosféricas
  let atmosphericState = {
    interval: null,
    usedIndices: [],
    hideTimeout: null,
  };

  // ============================================================
  // CONSTRUTOR DE ESTADO
  // ============================================================
  function GameState(difficulty) {
    const settings = difficultySettings[difficulty];
    this.difficulty = difficulty;
    this.isNightmare = difficulty === "nightmare";
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
    this.timerFrozen = false;
    this.chaosModeActive = false;
    this.chaosModeTimeout = null;
    this.rageModeActive = false;
    this.revealedCardNames = new Set(); // cartas viradas pelo player (para UFO easter egg)
  }

  // ============================================================
  // UTILITÁRIOS DE MÍDIA
  // ============================================================
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
    if (!exclude.includes("ufoVideo") && elements.ufoVideo) {
      elements.ufoVideo.pause();
      elements.ufoVideo.currentTime = 0;
    }
    if (!exclude.includes("trueEndingVideo") && elements.trueEndingVideo) {
      elements.trueEndingVideo.pause();
      elements.trueEndingVideo.currentTime = 0;
    }
  }

  function playSound(sound, volume = 1.0) {
    if (!sound) return;
    sound.volume = volume;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  // ============================================================
  // TELAS: MOSTRAR / ESCONDER
  // ============================================================
  function showScreen(el, useFlexDisplay = true) {
    el.classList.remove("hidden");
    if (useFlexDisplay) el.classList.add("flex");
  }

  function hideScreen(el) {
    el.classList.add("hidden");
    el.classList.remove("flex");
  }

  // ============================================================
  // MENSAGENS ATMOSFÉRICAS
  // ============================================================
  function startAtmosphericMessages() {
    stopAtmosphericMessages();
    atmosphericState.usedIndices = [];

    const scheduleNext = () => {
      const delay = 20000 + Math.random() * 10000; // 20-30s
      atmosphericState.interval = setTimeout(() => {
        showAtmosphericMessage();
        scheduleNext();
      }, delay);
    };

    // Primeira mensagem após 15s
    atmosphericState.interval = setTimeout(() => {
      showAtmosphericMessage();
      scheduleNext();
    }, 15000);
  }

  function stopAtmosphericMessages() {
    if (atmosphericState.interval) {
      clearTimeout(atmosphericState.interval);
      atmosphericState.interval = null;
    }
    if (atmosphericState.hideTimeout) {
      clearTimeout(atmosphericState.hideTimeout);
      atmosphericState.hideTimeout = null;
    }
    elements.atmosphericMsg.classList.add("hidden");
    elements.atmosphericMsg.classList.remove("atm-visible");
  }

  function showAtmosphericMessage() {
    if (!game || game.isGameOver) return;

    // Resetar se usou todas
    if (atmosphericState.usedIndices.length >= ATMOSPHERIC_PHRASES.length) {
      atmosphericState.usedIndices = [];
    }

    let idx;
    do {
      idx = Math.floor(Math.random() * ATMOSPHERIC_PHRASES.length);
    } while (atmosphericState.usedIndices.includes(idx));

    atmosphericState.usedIndices.push(idx);

    const msg = elements.atmosphericMsg;
    msg.textContent = ATMOSPHERIC_PHRASES[idx];
    msg.classList.remove("hidden", "atm-visible");
    // forçar reflow para reiniciar animação
    void msg.offsetWidth;
    msg.classList.add("atm-visible");

    atmosphericState.hideTimeout = setTimeout(() => {
      msg.classList.remove("atm-visible");
      setTimeout(() => msg.classList.add("hidden"), 1500);
    }, 6000);
  }

  // ============================================================
  // LÓGICA PRINCIPAL
  // ============================================================
  function initGame(difficulty) {
    if (game?.timerInterval) clearInterval(game.timerInterval);

    stopAllMedia();
    stopAtmosphericMessages();
    playSound(sounds.static, 0.05);
    userHasInteracted = true;

    game = new GameState(difficulty);
    easterEgg.ufoProgress = [];
    easterEgg.rebirthProgress = [];
    easterEgg.navTitleClicks = 0;

    hideScreen(elements.startMenu);
    hideScreen(elements.victoryScreen);
    hideScreen(elements.dogEndingScreen);
    hideScreen(elements.screenGameOver);
    hideScreen(elements.ufoEndingScreen);
    hideScreen(elements.trueEndingScreen);
    showScreen(elements.gameContainer);

    elements.body.classList.remove("otherworld");

    // Nightmare badge
    if (game.isNightmare) {
      elements.nightmareBadge.classList.remove("hidden");
    } else {
      elements.nightmareBadge.classList.add("hidden");
    }

    createCards();

    elements.stepCounter.textContent = "0";
    elements.timeCounter.textContent = "00:00";
    updateSanity(0);

    game.timerInterval = setInterval(() => updateStats("time"), 1000);
    startAtmosphericMessages();
  }

  function showStartMenu() {
    if (game?.timerInterval) {
      clearInterval(game.timerInterval);
      game.timerInterval = null;
    }

    stopAllMedia();
    stopAtmosphericMessages();

    hideScreen(elements.gameContainer);
    hideScreen(elements.victoryScreen);
    hideScreen(elements.dogEndingScreen);
    hideScreen(elements.screenGameOver);
    hideScreen(elements.ufoEndingScreen);
    hideScreen(elements.trueEndingScreen);
    showScreen(elements.startMenu);

    elements.startMenu.scrollIntoView({ behavior: "auto" });
  }

  // ============================================================
  // CRIAÇÃO DE CARTAS
  // ============================================================
  function createCards() {
    const cardPool = ALL_CARDS.slice(0, game.pairsToMatch);
    const gameCardsData = [...cardPool, ...cardPool].sort(() => 0.5 - Math.random());

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
    if (cardData.powerup && game.isNightmare) {
      cardEl.dataset.powerup = cardData.powerup;
      cardEl.classList.add("has-powerup");
    }
    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back"></div>
        <div class="card-face card-front" style="background-image: url('${cardData.img}')">
          ${cardData.powerup && game.isNightmare ? `<div class="powerup-indicator" title="${getPowerupLabel(cardData.powerup)}"></div>` : ""}
        </div>
      </div>`;

    cardEl.addEventListener("click", () => handleCardClick(cardEl, cardData));
    if (!isTouchDevice) {
      cardEl.addEventListener("mouseenter", () => handleCardHover(cardData.type));
    }

    return cardEl;
  }

  function getPowerupLabel(powerup) {
    const labels = {
      heal:    "Recover Sanity",
      freeze:  "Freeze Timer",
      reveal:  "Reveal Monsters",
      chaos:   "Chaos Mode",
      execute: "Execute Pair",
      shuffle: "Shuffle Cards",
      rage:    "Double Damage on Next Mistake",
      vanish:  "Eliminate the Abstract Daddy",
      forget:  "Remove a Pair of Characters",
    };
    return labels[powerup] || "";
  }

  // ============================================================
  // HANDLERS DE CARTA
  // ============================================================
  function handleCardClick(cardEl, cardData) {
    if (
      game.isLocked ||
      cardEl.classList.contains("flipped") ||
      cardEl.classList.contains("matched") ||
      game.isGameOver
    ) return;

    // Modo Caos: redireciona clique para carta adjacente aleatória
    if (game.chaosModeActive) {
      const allCards = [...elements.board.querySelectorAll(".card:not(.flipped):not(.matched)")];
      if (allCards.length > 1) {
        const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
        const randomName = randomCard.dataset.name;
        const randomData = ALL_CARDS.find(c => c.name === randomName);
        if (randomData) {
          showPowerupNotification("ROBBIE CONTROL — click redirected!");
          cardEl = randomCard;
          cardData = randomData;
        }
      }
    }

    playSound(sounds.flip);
    cardEl.classList.add("flipped");
    game.flippedCards.push({ element: cardEl, data: cardData });

    // Rastrear cartas viradas (para easter egg UFO e Rebirth)
    game.revealedCardNames.add(cardData.name);
    checkUFOEasterEggProgress(cardData.name);
    checkRebirthEasterEggProgress(cardData.name);

    if (game.flippedCards.length === 2) processTurn();
  }

  function processTurn() {
    game.isLocked = true;
    updateStats("steps");

    const [card1, card2] = game.flippedCards;

    if (card1.data.name === card2.data.name) {
      setTimeout(() => handleMatch(card1, card2), 500);
    } else {
      setTimeout(handleMismatch, 1200);
    }
  }

  function handleMatch(card1, card2) {
    game.flippedCards.forEach((c) => {
      c.element.classList.add("matched", "pulse-matched");
    });
    game.matchedCount++;
    game.flippedCards = [];
    game.isLocked = false;

    // Ativar power-up no Nightmare
    if (game.isNightmare && card1.data.powerup) {
      activatePowerup(card1.data.powerup, card1.data.name);
    }

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

    const loss = game.rageModeActive
      ? game.sanityLossPerMistake * 2
      : game.sanityLossPerMistake;
    if (game.rageModeActive) {
      game.rageModeActive = false;
      showPowerupNotification("EDDIE — Double damage applied!");
    }
    updateSanity(-loss);
    game.isLocked = false;
  }

  // ============================================================
  // POWER-UPS (NIGHTMARE)
  // ============================================================
  function activatePowerup(powerup, cardName) {
    switch (powerup) {
      case "heal":
        activateHeal();
        break;
      case "freeze":
        activateFreeze();
        break;
      case "reveal":
        activateReveal();
        break;
      case "chaos":
        activateChaos();
        break;
      case "execute":
        activateExecute();
        break;
      case "shuffle":
        activateShuffle();
        break;
      case "rage":
        activateRage();
        break;
      case "vanish":
        activateVanish();
        break;
      case "forget":
        activateForget();
        break;
    }
  }

  function activateHeal() {
    const healAmount = 20;
    updateSanity(healAmount);
    showPowerupNotification(`JAMES — Sanity recovered (+${healAmount}%)`);
  }

  function activateFreeze() {
    game.timerFrozen = true;
    showPowerupNotification("RADIO — Timer frozen for 20 seconds!");
    setTimeout(() => {
      game.timerFrozen = false;
      showPowerupNotification("Timer resumed.");
    }, 20000);
  }

  function activateReveal() {
    // Revela 1 carta aleatória de cada par de monstro ainda não combinado
    const monsterNames = ALL_CARDS
      .filter(c => c.type === "monster" || c.type === "boss")
      .map(c => c.name);

    const unmatched = [...elements.board.querySelectorAll(".card:not(.matched)")];
    const revealTargets = [];

    monsterNames.forEach(name => {
      const candidates = unmatched.filter(
        el => el.dataset.name === name && !el.classList.contains("flipped")
      );
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        revealTargets.push(pick);
      }
    });

    revealTargets.forEach(el => el.classList.add("flipped"));
    showPowerupNotification("FLASHLIGHT — Monsters revealed by 2s!");

    setTimeout(() => {
      revealTargets.forEach(el => {
        if (!el.classList.contains("matched")) {
          el.classList.remove("flipped");
        }
      });
    }, 2000);
  }

  function activateChaos() {
    if (game.chaosModeTimeout) clearTimeout(game.chaosModeTimeout);
    game.chaosModeActive = true;
    showPowerupNotification("ROBBIE — Chaos Mode activated for 10 seconds! Clicks are redirected!");
    game.chaosModeTimeout = setTimeout(() => {
      game.chaosModeActive = false;
      showPowerupNotification("Chaos Mode deactivated.");
    }, 10000);
  }

  function activateExecute() {
    // Remove 1 par aleatório não combinado do board
    const unmatchedNames = [];
    const seen = new Set();
    const unmatchedCards = [...elements.board.querySelectorAll(".card:not(.matched)")];

    unmatchedCards.forEach(el => {
      const name = el.dataset.name;
      if (seen.has(name)) {
        unmatchedNames.push(name);
      } else {
        seen.add(name);
      }
    });

    if (unmatchedNames.length === 0) return;

    const targetName = unmatchedNames[Math.floor(Math.random() * unmatchedNames.length)];
    const toRemove = unmatchedCards.filter(el => el.dataset.name === targetName);

    toRemove.forEach(el => {
      el.classList.add("executed");
      setTimeout(() => el.remove(), 600);
    });

    // Incrementar matched count pois par foi "resolvido"
    game.matchedCount++;
    showPowerupNotification(`PYRAMID HEAD — Pair of "${targetName}" executed!`);
    setTimeout(checkWinCondition, 700);
  }

  function activateShuffle() {
    const unmatchedCards = [...elements.board.querySelectorAll(".card:not(.matched):not(.flipped)")];
    if (unmatchedCards.length < 2) return;

    const positions = unmatchedCards.map(el => ({
      nextSibling: el.nextSibling,
      parent: el.parentNode,
    }));

    const shuffled = [...unmatchedCards].sort(() => 0.5 - Math.random());
    shuffled.forEach((card) => card.classList.add("shuffle-anim"));

    setTimeout(() => {
      shuffled.forEach((card, i) => {
        const ref = positions[i];
        if (ref.nextSibling) {
          ref.parent.insertBefore(card, ref.nextSibling);
        } else {
          ref.parent.appendChild(card);
        }
        card.classList.remove("shuffle-anim");
      });
    }, 500);

    showPowerupNotification("MARIA — Cards shuffled! She confuses you...");
  }

  function activateRage() {
    game.rageModeActive = true;
    showPowerupNotification("EDDIE — Next mistake will cause double damage!");
  }

  function activateVanish() {
    // Remove o par do Abstract Daddy se ainda não foi revelado/combinado
    const abstractCards = [...elements.board.querySelectorAll(".card:not(.matched)")]
      .filter(el => el.dataset.name === "Abstract Daddy" && !el.classList.contains("flipped"));

    if (abstractCards.length === 0) {
      showPowerupNotification("ANGELA — Abstract Daddy already found...");
      return;
    }

    abstractCards.forEach(el => {
      el.classList.add("executed");
      setTimeout(() => el.remove(), 600);
    });

    game.matchedCount++;
    showPowerupNotification("ANGELA — Abstract Daddy eliminated from the shadows!");
    setTimeout(checkWinCondition, 700);
  }

  function activateForget() {
    const humanTypes = ["human", "other"];
    const humanNames = ALL_CARDS
      .filter(c => humanTypes.includes(c.type))
      .map(c => c.name);

    // Pegar pares de personagens ainda não combinados no board
    const candidates = new Set();
    const seen = new Set();
    const unmatched = [...elements.board.querySelectorAll(".card:not(.matched)")];

    unmatched.forEach(el => {
      const name = el.dataset.name;
      if (!humanNames.includes(name)) return;
      if (seen.has(name)) {
        candidates.add(name);
      } else {
        seen.add(name);
      }
    });

    if (candidates.size === 0) {
      showPowerupNotification("LAURA — There are no more characters to forget...");
      return;
    }

    const candidateArr = [...candidates];
    const targetName = candidateArr[Math.floor(Math.random() * candidateArr.length)];
    const toRemove = unmatched.filter(el => el.dataset.name === targetName);

    toRemove.forEach(el => {
      el.classList.add("executed");
      setTimeout(() => el.remove(), 600);
    });

    game.matchedCount++;
    showPowerupNotification(`LAURA — She forgot "${targetName}"... and you did too.`);
    setTimeout(checkWinCondition, 700);
  }

  function showPowerupNotification(msg) {
    const notif = elements.powerupNotification;
    notif.textContent = msg;
    notif.classList.remove("hidden", "powerup-visible");
    void notif.offsetWidth;
    notif.classList.add("powerup-visible");
    setTimeout(() => {
      notif.classList.remove("powerup-visible");
      setTimeout(() => notif.classList.add("hidden"), 600);
    }, 3000);
  }

  // ============================================================
  // SANIDADE
  // ============================================================
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

  // ============================================================
  // STATS
  // ============================================================
  function updateStats(type) {
    if (game.isGameOver) return;
    if (type === "steps") {
      game.steps++;
      elements.stepCounter.textContent = game.steps;
    } else if (type === "time") {
      if (!game.timerFrozen) {
        game.timer++;
        const mm = String(Math.floor(game.timer / 60)).padStart(2, "0");
        const ss = String(game.timer % 60).padStart(2, "0");
        elements.timeCounter.textContent = `${mm}:${ss}`;
        if (game.timer > 0 && game.timer % 15 === 0) updateSanity(-2);
      }
    }
  }

  // ============================================================
  // CONDIÇÕES DE FIM
  // ============================================================
  function checkWinCondition() {
    if (game.matchedCount >= game.pairsToMatch) triggerGameWin();
  }

  function determineEnding() {
    // In Water: terminou com sanidade <= 20%
    if (game.sanity <= 20) return "inwater";
    // Leave: padrão
    return "leave";
  }

  function getEndingData(ending) {
    const data = {
      inwater: {
        label:       "ENDING: IN WATER",
        labelClass:  "ending-inwater",
        videoSrc:    "audio/ending_inwater.mp4",
        description: "James chose to join Mary in the depths.",
      },
      leave: {
        label:       "ENDING: LEAVE",
        labelClass:  "ending-leave",
        videoSrc:    "audio/ending_leave.mp4",
        description: "James walks away. A letter in his hand.",
      },
      maria: {
        label:       "ENDING: MARIA",
        labelClass:  "ending-maria",
        videoSrc:    "audio/ending_maria.mp4",
        description: "He left with her shadow. Not her memory.",
      },
      rebirth: {
        label:       "ENDING: REBIRTH",
        labelClass:  "ending-rebirth",
        videoSrc:    "audio/ending_rebirth.mp4",
        description: "Some doors are better left closed.",
      },
    };
    return data[ending] || data["leave"];
  }

  function triggerGameWin() {
    game.isGameOver = true;
    clearInterval(game.timerInterval);
    stopAtmosphericMessages();

    // Se há um ending secreto pendente (easter egg do nav title), usar ele
    const ending = easterEgg.pendingEnding || determineEnding();
    easterEgg.pendingEnding = null;

    fadeOutSound(sounds.static, 1500);
    stopAllMedia(["static"]);
    elements.body.classList.remove("otherworld");

    const endingData = getEndingData(ending);

    // Mostrar vídeo placeholder com skip, depois carta de Mary
    elements.trueEndingSource.src = endingData.videoSrc;
    elements.trueEndingVideo.load();
    showScreen(elements.trueEndingScreen);
    elements.trueEndingVideo.play().catch(() => {});

    // Ao terminar o vídeo, mostrar carta de Mary
    const onVideoEnd = () => {
      elements.trueEndingVideo.removeEventListener("ended", onVideoEnd);
      showMaryLetter(endingData);
    };
    elements.trueEndingVideo.addEventListener("ended", onVideoEnd);

    // Botão skip
    elements.trueEndingSkipBtn.onclick = () => {
      elements.trueEndingVideo.removeEventListener("ended", onVideoEnd);
      elements.trueEndingVideo.pause();
      hideScreen(elements.trueEndingScreen);
      showMaryLetter(endingData);
    };
  }

  function showMaryLetter(endingData) {
    hideScreen(elements.trueEndingScreen);
    stopAllMedia();

    setTimeout(() => {
      playSound(sounds.victory, 0.5);
      showScreen(elements.victoryScreen);

      const label = elements.endingLabel;
      label.textContent = endingData.label;
      label.className = `ending-label ${endingData.labelClass}`;
      label.classList.remove("hidden");
    }, 500);
  }

  function triggerGameOver() {
    game.isGameOver = true;
    clearInterval(game.timerInterval);
    stopAtmosphericMessages();
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

  // ============================================================
  // EASTER EGG: UFO (sequência de cartas)
  // Só ativo no Hard e Nightmare
  // Sequência: Pyramid Head -> Pyramid Head -> Abstract Daddy -> James
  // Cartas precisam ter sido reveladas primeiro
  // ============================================================
  function checkUFOEasterEggProgress(cardName) {
    if (!game) return;
    if (game.difficulty !== "hard" && game.difficulty !== "nightmare") return;

    const seq = easterEgg.ufoSequence;
    const prog = easterEgg.ufoProgress;

    const expected = seq[prog.length];
    if (cardName === expected) {
      prog.push(cardName);
      if (prog.length === seq.length) {
        // Verificar se todas as cartas da sequência já foram reveladas
        const allRevealed = seq.every(name => game.revealedCardNames.has(name));
        if (allRevealed) {
          setTimeout(triggerUFOEnding, 800);
        }
        easterEgg.ufoProgress = [];
      }
    } else {
      // Resetar se errou a sequência
      easterEgg.ufoProgress = cardName === seq[0] ? [cardName] : [];
    }
  }

  function triggerUFOEnding() {
    if (!game || game.isGameOver) return;
    game.isGameOver = true;
    clearInterval(game.timerInterval);
    stopAtmosphericMessages();
    stopAllMedia();

    hideScreen(elements.gameContainer);
    showScreen(elements.ufoEndingScreen);
    elements.ufoVideo?.play();
  }

  // ============================================================
  // EASTER EGG: REBIRTH (sequência de cartas — todos os modos)
  // Sequência: Abstract Daddy -> Mary -> Abstract Daddy
  // ============================================================
  function checkRebirthEasterEggProgress(cardName) {
    if (!game) return;

    const seq = easterEgg.rebirthSequence;
    const prog = easterEgg.rebirthProgress;

    const expected = seq[prog.length];
    if (cardName === expected) {
      prog.push(cardName);
      if (prog.length === seq.length) {
        easterEgg.rebirthProgress = [];
        easterEgg.pendingEnding = "rebirth";
        showPowerupNotification("The rituals are complete...");
      }
    } else {
      easterEgg.rebirthProgress = cardName === seq[0] ? [cardName] : [];
    }
  }

  // ============================================================
  // EASTER EGG: DOG ENDING (radio trigger — mantido)
  // ============================================================
  function triggerDogEnding() {
    if (!game || game.isGameOver) return;
    game.isGameOver = true;
    clearInterval(game.timerInterval);
    stopAtmosphericMessages();
    stopAllMedia();

    hideScreen(elements.gameContainer);
    showScreen(elements.dogEndingScreen);
    elements.dogVideo?.play();
  }

  // ============================================================
  // EASTER EGG: MARIA — clicar 5x no título no Otherworld
  // ============================================================
  function handleNavTitleClick(e) {
    if (!game || game.isGameOver) return;

    const isOtherworld = elements.body.classList.contains("otherworld");
    if (!isOtherworld) return;

    if (easterEgg.navTitleTimer) clearTimeout(easterEgg.navTitleTimer);
    easterEgg.navTitleTimer = setTimeout(() => {
      easterEgg.navTitleClicks = 0;
    }, 3000);

    easterEgg.navTitleClicks++;

    if (easterEgg.navTitleClicks >= 5) {
      easterEgg.navTitleClicks = 0;
      easterEgg.pendingEnding = "maria";
      showPowerupNotification("could she really be here...");
    }
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================
  elements.difficultyBtns.forEach((btn) => {
    btn.addEventListener("click", () => initGame(btn.dataset.difficulty));
  });

  elements.restartBtn.addEventListener("click", () => {
    if (game) initGame(game.difficulty);
  });

  elements.playAgainBtn.addEventListener("click", showStartMenu);
  elements.radioTrigger.addEventListener("click", triggerDogEnding);
  elements.dogEndingCloseBtn.addEventListener("click", showStartMenu);
  elements.ufoCloseBtn.addEventListener("click", showStartMenu);

  elements.gameOverCloseBtn.addEventListener("click", () => {
    hideScreen(elements.screenGameOver);
    showStartMenu();
  });

  elements.navTitle.addEventListener("click", (e) => {
    if (!game || game.isGameOver) return;
    handleNavTitleClick(e);
  });

  elements.menuBtn.addEventListener("click", showStartMenu);

});