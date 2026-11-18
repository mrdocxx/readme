/* A Little Something for You — interactions and mini-games */
"use strict";

const get = (id) => document.getElementById(id);
const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

/* Pick a flower */
document.querySelectorAll(".flower").forEach((button) => {
  button.addEventListener("click", () => {
    get("flower-result").textContent = button.dataset.message;
  });
});

/* Random compliments */
const compliments = [
  "You have the kind of smile that makes a room feel softer.",
  "You make being yourself look like the loveliest thing in the world.",
  "The world got a little brighter when you showed up in it.",
  "You are someone’s favorite reason to smile—and definitely mine.",
  "Your laugh deserves its own little soundtrack."
];

get("compliment-button").addEventListener("click", () => {
  const box = get("compliment-result");
  let next = randomItem(compliments);
  if (box.dataset.last === next) {
    next = compliments[(compliments.indexOf(next) + 1) % compliments.length];
  }
  box.dataset.last = next;
  box.textContent = next;
});

/* Mood picker */
const moodNotes = {
  sunny: "Keep that sunshine close—you make happy moments even sweeter. ☀️",
  cloudy: "No need to fix the feeling. Take it gently, one little moment at a time. I’m here for you. 🌧️",
  tired: "Permission to rest, get cozy, and let the world wait a bit. You’ve done enough for today. 🧸",
  excited: "I love seeing you light up! Tell me everything—I’m ready for the happy recap. ✨"
};

document.querySelectorAll(".mood").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mood").forEach((item) => item.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    get("mood-result").textContent = moodNotes[button.dataset.mood];
  });
});

/* Catch the hearts */
const field = get("heart-field");
const scoreLabel = get("score");
const statusLabel = get("game-status");
const startButton = get("start-game");

let score = 0;
let playing = false;
let spawnTimer = null;
let gameTimer = null;
const heartCleanupTimers = new Set();

function endHeartGame() {
  playing = false;
  clearInterval(spawnTimer);
  clearTimeout(gameTimer);
  heartCleanupTimers.forEach(clearTimeout);
  heartCleanupTimers.clear();
  field.replaceChildren();
  statusLabel.textContent = `Time! You caught ${score} ${score === 1 ? "heart" : "hearts"} — sending every one right back to you. 💗`;
  startButton.disabled = false;
  startButton.textContent = "Play again";
}

function addHeart() {
  if (!playing) return;

  const heart = document.createElement("button");
  heart.className = "catch-heart";
  heart.type = "button";
  heart.textContent = randomItem(["💗", "💖", "💕", "💘"]);
  heart.setAttribute("aria-label", "Catch a heart");
  heart.style.left = `${5 + Math.random() * 82}%`;
  heart.style.top = `${8 + Math.random() * 65}%`;

  heart.addEventListener("click", () => {
    if (!playing) return;
    score += 1;
    scoreLabel.textContent = `Score: ${score}`;
    heart.remove();
  }, { once: true });

  field.append(heart);

  const cleanupTimer = setTimeout(() => {
    heart.remove();
    heartCleanupTimers.delete(cleanupTimer);
  }, 1150);

  heartCleanupTimers.add(cleanupTimer);
}

startButton.addEventListener("click", () => {
  if (playing) return;

  clearInterval(spawnTimer);
  clearTimeout(gameTimer);
  heartCleanupTimers.forEach(clearTimeout);
  heartCleanupTimers.clear();

  score = 0;
  scoreLabel.textContent = "Score: 0";
  playing = true;
  startButton.disabled = true;
  statusLabel.textContent = "Go go go! 💞";

  addHeart();
  spawnTimer = setInterval(addHeart, 650);
  gameTimer = setTimeout(endHeartGame, 15000);
});

/* Matching pairs */
const memoryEmojis = ["🌷", "🍓", "🌙", "🦋"];
let openCards = [];
let memoryLocked = false;
let matches = 0;
let memoryFlipTimer = null;

function setupMemory() {
  const board = get("memory-board");
  clearTimeout(memoryFlipTimer);
  board.replaceChildren();
  openCards = [];
  memoryLocked = false;
  matches = 0;
  get("match-count").textContent = "0 / 4 pairs";
  get("memory-status").textContent = "Ready for a tiny brain break?";

  const deck = [...memoryEmojis, ...memoryEmojis];

  // Fisher–Yates shuffle.
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  deck.forEach((emoji, index) => {
    const card = document.createElement("button");
    card.className = "memory-card";
    card.type = "button";
    card.textContent = "?";
    card.setAttribute("aria-label", `Hidden card ${index + 1}`);
    card.dataset.emoji = emoji;

    card.addEventListener("click", () => {
      if (memoryLocked || card.classList.contains("revealed") || card.classList.contains("matched")) return;

      card.textContent = emoji;
      card.classList.add("revealed");
      card.setAttribute("aria-label", emoji);
      openCards.push(card);

      if (openCards.length !== 2) return;

      const [first, second] = openCards;

      if (first.dataset.emoji === second.dataset.emoji) {
        first.classList.replace("revealed", "matched");
        second.classList.replace("revealed", "matched");
        first.disabled = true;
        second.disabled = true;
        matches += 1;
        get("match-count").textContent = `${matches} / 4 pairs`;
        openCards = [];

        if (matches === 4) {
          get("memory-status").textContent = "You did it! Your brain is cute and clever. 🎉";
        }
      } else {
        memoryLocked = true;
        memoryFlipTimer = setTimeout(() => {
          for (const item of openCards) {
            item.textContent = "?";
            item.classList.remove("revealed");
            item.setAttribute("aria-label", "Hidden card");
          }
          openCards = [];
          memoryLocked = false;
          memoryFlipTimer = null;
        }, 750);
      }
    });

    board.append(card);
  });
}

get("reset-memory").addEventListener("click", setupMemory);
setupMemory();

/* Rock, paper, scissors */
const rpsMoves = ["rock", "paper", "scissors"];

document.querySelectorAll(".rps").forEach((button) => {
  button.addEventListener("click", () => {
    const you = button.dataset.choice;
    const me = randomItem(rpsMoves);
    const result = you === me
      ? "It’s a tie! Great minds think alike."
      : ((you === "rock" && me === "scissors") ||
         (you === "paper" && me === "rock") ||
         (you === "scissors" && me === "paper"))
        ? "You win this round! I’m proud of you. 🎉"
        : "I win this one, but you’re still my favorite. 💗";

    get("rps-result").textContent = `You picked ${you}; I picked ${me}. ${result}`;
  });
});

/* Guess my number */
let secretNumber = Math.floor(Math.random() * 10) + 1;

get("guess-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = get("guess-input");
  const guess = Number(input.value);
  const result = get("guess-result");

  if (!Number.isInteger(guess) || guess < 1 || guess > 10) {
    result.textContent = "Please choose a whole number from 1 to 10.";
    input.select();
    return;
  }

  if (guess === secretNumber) {
    result.textContent = "You got it! You’re a mind reader. ✨";
    secretNumber = Math.floor(Math.random() * 10) + 1;
  } else {
    result.textContent = guess < secretNumber
      ? "A little higher! Try again. ⬆️"
      : "A little lower! Try again. ⬇️";
  }
  input.select();
});

/* Tic-tac-toe */
let ticCells = Array(9).fill("");
let ticOver = false;
const winLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function ticWinner() {
  const line = winLines.find((indexes) =>
    indexes.every((index) => ticCells[index] && ticCells[index] === ticCells[indexes[0]])
  );
  return line ? ticCells[line[0]] : "";
}

function drawTic() {
  const board = get("tic-board");
  board.replaceChildren();

  ticCells.forEach((mark, index) => {
    const cell = document.createElement("button");
    cell.className = "tic-cell";
    cell.type = "button";
    cell.textContent = mark;
    cell.setAttribute("aria-label", `Square ${index + 1}${mark ? `: ${mark}` : ""}`);
    cell.disabled = Boolean(mark) || ticOver;
    cell.addEventListener("click", () => ticMove(index));
    board.append(cell);
  });
}

function ticMove(index) {
  if (ticOver || ticCells[index]) return;

  ticCells[index] = "X";

  if (ticWinner()) {
    ticOver = true;
    get("tic-status").textContent = "You win! I knew you were clever. 🎉";
  } else if (ticCells.every(Boolean)) {
    ticOver = true;
    get("tic-status").textContent = "A draw! That was a good match. 💗";
  } else {
    const freeCells = ticCells
      .map((value, cellIndex) => value ? null : cellIndex)
      .filter((cellIndex) => cellIndex !== null);

    ticCells[randomItem(freeCells)] = "O";

    if (ticWinner()) {
      ticOver = true;
      get("tic-status").textContent = "I got lucky this time. Rematch? 😊";
    } else if (ticCells.every(Boolean)) {
      ticOver = true;
      get("tic-status").textContent = "A draw! That was a good match. 💗";
    } else {
      get("tic-status").textContent = "Your turn!";
    }
  }
  drawTic();
}

get("tic-reset").addEventListener("click", () => {
  ticCells = Array(9).fill("");
  ticOver = false;
  get("tic-status").textContent = "Your turn!";
  drawTic();
});
drawTic();

/* Unscramble the word */
const words = ["smile", "sweet", "heart", "sunny", "cuddle", "flower", "sparkle", "cookie"];
let answer = "";
let nextWordTimer = null;

function shuffleWord(word) {
  const letters = word.split("");

  for (let attempt = 0; attempt < 20; attempt += 1) {
    for (let i = letters.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    const mixed = letters.join("");
    if (mixed !== word) return mixed;
  }

  const reversed = word.split("").reverse().join("");
  return reversed !== word ? reversed : word.split("").sort().join("");
}

function newWord() {
  clearTimeout(nextWordTimer);
  answer = randomItem(words);
  get("scramble-word").textContent = shuffleWord(answer).toUpperCase();
  get("word-result").textContent = "A new word each round!";
  get("word-input").value = "";
}

get("word-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = get("word-input");

  if (input.value.trim().toLowerCase() === answer) {
    get("word-result").textContent = "You unscrambled it! You’re so good at this. 🌟";
    nextWordTimer = setTimeout(newWord, 1300);
  } else {
    get("word-result").textContent = "Almost! Give it another try. 💭";
  }
});
get("new-word").addEventListener("click", newWord);
newWord();

/* Reaction test: leave the button enabled while waiting to catch early taps. */
const reactionPad = get("reaction-pad");
const reactionResult = get("reaction-result");
let reactionTimer = null;
let reactionStart = 0;
let reactionState = "ready";

reactionPad.addEventListener("click", () => {
  if (reactionState === "ready" || reactionState === "done") {
    clearTimeout(reactionTimer);
    reactionState = "waiting";
    reactionPad.className = "reaction-pad waiting";
    reactionPad.textContent = "Wait for green…";
    reactionResult.textContent = "";

    reactionTimer = setTimeout(() => {
      reactionState = "go";
      reactionStart = performance.now();
      reactionPad.className = "reaction-pad go";
      reactionPad.textContent = "TAP NOW!";
    }, 900 + Math.random() * 2200);
    return;
  }

  if (reactionState === "waiting") {
    clearTimeout(reactionTimer);
    reactionState = "done";
    reactionPad.className = "reaction-pad";
    reactionPad.textContent = "Try again";
    reactionResult.textContent = "Too soon! Wait until it turns green 😄";
    return;
  }

  if (reactionState === "go") {
    const ms = Math.round(performance.now() - reactionStart);
    reactionState = "done";
    reactionPad.className = "reaction-pad";
    reactionPad.textContent = "Play again";
    reactionResult.textContent = `${ms} ms! ${ms < 300 ? "Lightning fast! ⚡" : "Nice reflexes! 💗"}`;
  }
});

/* This or that */
const choices = [
  ["🌧️ Rainy movie day", "☀️ Sunny picnic"],
  ["🍓 Strawberries", "🍰 Chocolate cake"],
  ["🌅 Sunrise", "🌇 Sunset"],
  ["🐱 Cats", "🐶 Dogs"],
  ["🎶 Sing together", "💃 Dance together"]
];
let choiceIndex = 0;

function showChoice() {
  const pair = choices[choiceIndex];
  get("would-question").textContent = "Pick your favorite:";
  document.querySelectorAll(".would-choice").forEach((button, index) => {
    button.textContent = pair[index];
    button.disabled = false;
  });
  get("would-result").textContent = "There are no wrong answers!";
}

document.querySelectorAll(".would-choice").forEach((button) => {
  button.addEventListener("click", () => {
    get("would-result").textContent =
      `Excellent choice: ${button.textContent}! I’d have fun with you either way. 💕`;
    document.querySelectorAll(".would-choice").forEach((item) => {
      item.disabled = true;
    });
  });
});

get("new-would").addEventListener("click", () => {
  choiceIndex = (choiceIndex + 1) % choices.length;
  showChoice();
});
showChoice();

/* Birthday countdown — follows the visitor's browser-local timezone. */
const birthdayDays = get("birthday-days");
const birthdayHours = get("birthday-hours");
const birthdayMinutes = get("birthday-minutes");
const birthdaySeconds = get("birthday-seconds");

function updateBirthdayCountdown() {
  const now = new Date();
  let year = now.getFullYear();
  let nextBirthday = new Date(year, 7, 6, 0, 0, 0);
  if (now >= nextBirthday) nextBirthday = new Date(year + 1, 7, 6, 0, 0, 0);

  let remaining = Math.max(0, nextBirthday - now);
  const day = 86400000;
  const hour = 3600000;
  const minute = 60000;

  birthdayDays.textContent = Math.floor(remaining / day);
  remaining %= day;
  birthdayHours.textContent = String(Math.floor(remaining / hour)).padStart(2, "0");
  remaining %= hour;
  birthdayMinutes.textContent = String(Math.floor(remaining / minute)).padStart(2, "0");
  birthdaySeconds.textContent = String(Math.floor((remaining % minute) / 1000)).padStart(2, "0");
}
updateBirthdayCountdown();
setInterval(updateBirthdayCountdown, 1000);

/* Birthday surprise unlock */
const birthdayGift = get("birthday-gift");
const giftLockStatus = get("gift-lock-status");
const birthdayNote = get("birthday-note");
let giftUnlocked = false;

function updateGiftLock() {
  const now = new Date();
  let year = now.getFullYear();
  let unlockAt = new Date(year, 7, 5, 23, 59, 0);
  let birthdayAt = new Date(year, 7, 6, 0, 0, 0);

  if (now >= birthdayAt) {
    year += 1;
    unlockAt = new Date(year, 7, 5, 23, 59, 0);
    birthdayAt = new Date(year, 7, 6, 0, 0, 0);
  }

  giftUnlocked = now >= unlockAt && now < birthdayAt;
  birthdayGift.disabled = !giftUnlocked;

  if (giftUnlocked) {
    birthdayGift.textContent = birthdayNote.hidden
      ? "🎁 Open your birthday surprise"
      : "💝 Your surprise is open!";
    giftLockStatus.textContent = "It’s time! Your birthday surprise is ready. ♡";
  } else {
    birthdayGift.textContent = "🔒 Opens August 5 at 11:59 PM";
    giftLockStatus.textContent = "Your surprise is tucked away until August 5 at 11:59 PM. ♡";
  }
}

birthdayGift.addEventListener("click", (event) => {
  if (!giftUnlocked) return;
  const open = birthdayNote.hidden;
  birthdayNote.hidden = !open;
  event.currentTarget.setAttribute("aria-expanded", String(open));
  event.currentTarget.textContent = open
    ? "💝 Your surprise is open!"
    : "🎁 Open your birthday surprise";
});
updateGiftLock();
setInterval(updateGiftLock, 1000);

/* Falling sparkle surprise */
get("surprise").addEventListener("click", () => {
  const icons = ["💗", "✨", "🌸", "💖", "💕", "🌷"];

  for (let i = 0; i < 34; i += 1) {
    const item = document.createElement("span");
    item.className = "sprinkle";
    item.textContent = randomItem(icons);
    item.style.left = `${Math.random() * 100}vw`;
    item.style.top = `${-10 - Math.random() * 30}vh`;
    item.style.animationDelay = `${Math.random() * 0.7}s`;
    document.body.append(item);
    setTimeout(() => item.remove(), 2800);
  }
});

/* Come to me — reveal the note and float hearts */
const comeButton = get("come-button");
const comeResponse = get("come-response");
const comeCard = get("come-card");

comeButton.addEventListener("click", () => {
  comeResponse.hidden = false;
  comeButton.textContent = "A hug is waiting for you ♡";
  comeButton.disabled = true;

  const hearts = ["♡", "♥", "💕", "💗", "♡"];

  for (let i = 0; i < 22; i += 1) {
    const heart = document.createElement("span");
    heart.className = "come-floating-heart";
    heart.textContent = randomItem(hearts);
    heart.style.setProperty("--heart-left", `${Math.random() * 90 + 5}%`);
    heart.style.setProperty("--heart-size", `${14 + Math.random() * 17}px`);
    heart.style.setProperty("--heart-duration", `${2.5 + Math.random() * 2}s`);
    heart.style.animationDelay = `${Math.random() * 0.7}s`;
    comeCard.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove(), { once: true });
  }
});
