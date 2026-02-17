// Removes the intro overlay after the animation finishes (about 5.5 seconds)
window.addEventListener('load', function () {
  setTimeout(function () {
    const overlay = document.getElementById('intro-overlay');
    if (overlay) overlay.remove();
  }, 5500);
});


// Smooth scrolls to any section by ID, with a little offset so the navbar doesn't cover it
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const yOffset = -90;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}


// Slide-in animation for the glass boxes when they enter the viewport
const boxes = document.querySelectorAll(".glass-box");

function handleScrollAnimation() {
  const triggerStart = window.innerHeight * 0.9;
  const triggerEnd = 0;

  boxes.forEach(box => {
    const boxTop = box.getBoundingClientRect().top;
    const boxBottom = box.getBoundingClientRect().bottom;

    if (boxTop < triggerStart && boxBottom > triggerEnd) {
      box.classList.add("show");
    } else {
      box.classList.remove("show");
    }
  });
}

window.addEventListener("scroll", handleScrollAnimation);
window.addEventListener("load", handleScrollAnimation);


// ---- Sudoku ----

let sudokuSolution = [], sudokuPuzzle = [], sudokuSelected = null;
let sudokuLives = 3, sudokuTimer = 0, sudokuInterval;
let bestTime = localStorage.getItem("sudokuBestTime") || null;

function startSudoku() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "";
  document.getElementById("sudokuNumbers").style.display = "flex";
  document.getElementById("sudokuTimerDisplay").style.display = "block";

  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
  sudokuLives = 3;
  sudokuTimer = 0;

  sudokuSolution = generateSimpleSolvedBoard();
  sudokuPuzzle = makePuzzle(sudokuSolution, difficulty);

  renderSudoku();
  startSudokuTimer();
  updateBestTimeDisplay();
}

// Using pre-made valid boards instead of generating one from scratch — way faster
function generateSimpleSolvedBoard() {
  const templates = [
    [[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]],
    [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]],
    [[6,2,8,4,5,1,7,9,3],[5,9,4,7,3,2,6,8,1],[7,1,3,6,8,9,5,4,2],[2,4,7,3,1,5,8,6,9],[9,6,1,8,2,7,3,5,4],[3,8,5,9,6,4,2,1,7],[1,5,6,2,4,3,9,7,8],[4,3,9,5,7,8,1,2,6],[8,7,2,1,9,6,4,3,5]]
  ];

  // Pick a random template then shuffle rows within each 3x3 box so it looks different each time
  let board = templates[Math.floor(Math.random() * templates.length)].map(row => [...row]);
  for (let box = 0; box < 3; box++) {
    const offset = box * 3;
    if (Math.random() > 0.5) {
      [board[offset], board[offset + 1]] = [board[offset + 1], board[offset]];
    }
  }
  return board;
}

// Removes cells from the solved board based on difficulty
function makePuzzle(solution, difficulty) {
  let copy = solution.map(r => r.slice());
  let holes = difficulty === 'easy' ? 35 : difficulty === 'medium' ? 45 : 55;
  let attempts = 0;

  while (holes > 0 && attempts < 100) {
    let r = Math.floor(Math.random() * 9);
    let c = Math.floor(Math.random() * 9);
    if (copy[r][c] !== 0) {
      copy[r][c] = 0;
      holes--;
    }
    attempts++;
  }
  return copy;
}

// Builds the grid using a document fragment so it renders in one go
function renderSudoku() {
  const area = document.getElementById("gameArea");
  area.style.display = "grid";
  area.style.gridTemplateColumns = "repeat(9, 40px)";
  area.style.gridTemplateRows = "repeat(9, 40px)";
  area.style.gap = "0px";

  const fragment = document.createDocumentFragment();

  sudokuPuzzle.forEach((row, r) => {
    row.forEach((val, c) => {
      const cell = document.createElement("div");
      cell.classList.add("sudoku-cell");

      // Add thicker borders to separate the 3x3 boxes
      if ((r + 1) % 3 === 0 && r !== 8) cell.classList.add("row-3");
      if ((c + 1) % 3 === 0 && c !== 8) cell.classList.add("col-3");

      if (val !== 0) {
        cell.textContent = val;
        cell.style.fontWeight = "bold";
        cell.style.color = "#c0c0c0";
      }

      cell.dataset.row = r;
      cell.dataset.col = c;
      fragment.appendChild(cell);
    });
  });

  area.innerHTML = '';
  area.appendChild(fragment);
  area.onclick = handleSudokuClick; // single delegated listener instead of one per cell
  renderSudokuNumpad();
}

function handleSudokuClick(e) {
  const cell = e.target.closest('.sudoku-cell');
  if (!cell) return;

  const r = parseInt(cell.dataset.row);
  const c = parseInt(cell.dataset.col);

  document.querySelectorAll('.sudoku-cell.selected').forEach(c => c.classList.remove('selected'));
  cell.classList.add('selected');
  sudokuSelected = { r, c, el: cell };
}

function renderSudokuNumpad() {
  const pad = document.getElementById("sudokuNumbers");
  pad.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => placeSudokuNumber(i);
    fragment.appendChild(btn);
  }

  const erase = document.createElement("button");
  erase.textContent = "⌫";
  erase.onclick = eraseSudokuCell;
  fragment.appendChild(erase);

  pad.appendChild(fragment);
}

function placeSudokuNumber(num) {
  if (!sudokuSelected) return;
  const { r, c, el } = sudokuSelected;

  if (sudokuSolution[r][c] === num) {
    el.textContent = num;
    el.style.color = "#c0c0c0";
    el.classList.remove("wrong-cell");
    sudokuPuzzle[r][c] = num;
    checkSudokuWin();
  } else {
    el.textContent = num;
    el.style.color = "red";
    el.classList.add("wrong-cell");
    sudokuLives--;
    if (navigator.vibrate) navigator.vibrate(200); // little buzz on mobile for wrong answers
    if (sudokuLives <= 0) {
      clearInterval(sudokuInterval);
      alert("Game Over!");
      startSudoku();
    }
  }
}

function eraseSudokuCell() {
  if (!sudokuSelected) return;
  const { r, c, el } = sudokuSelected;
  el.textContent = "";
  el.style.color = "#c0c0c0";
  el.classList.remove("wrong-cell");
  sudokuPuzzle[r][c] = 0;
}

// Check if every cell is filled — if yes, the player won
function checkSudokuWin() {
  if (sudokuPuzzle.flat().every(v => v !== 0)) {
    clearInterval(sudokuInterval);
    if (!bestTime || sudokuTimer < bestTime) {
      bestTime = sudokuTimer;
      localStorage.setItem("sudokuBestTime", bestTime);
    }
    alert("Sudoku Completed! Time: " + sudokuTimer + "s");
    updateBestTimeDisplay();
  }
}

function startSudokuTimer() {
  clearInterval(sudokuInterval);
  sudokuTimer = 0;
  sudokuInterval = setInterval(() => {
    sudokuTimer++;
    document.getElementById("sudokuCurrentTime").textContent = sudokuTimer;
  }, 1000);
}

function updateBestTimeDisplay() {
  document.getElementById("bestTime").textContent = bestTime ? bestTime : "--";
}

function hideSudokuTimer() {
  document.getElementById("sudokuTimerDisplay").style.display = "none";
}


// ---- Tic Tac Toe ----

let tttBoard = [], tttCurrent = "X", tttGameOver = false, tttBotThinking = false;

function startTicTacToe() {
  hideSudokuTimer();
  const area = document.getElementById("gameArea");
  area.innerHTML = "";
  tttBoard = Array(9).fill("");
  tttCurrent = "X";
  tttGameOver = false;
  tttBotThinking = false;
  area.style.display = "grid";
  area.style.gridTemplateColumns = "repeat(3, 90px)";
  area.style.gridTemplateRows = "repeat(3, 90px)";
  area.style.gridGap = "10px";
  renderTTT();
}

function renderTTT() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "";
  tttBoard.forEach((v, i) => {
    const cell = document.createElement("button");
    cell.classList.add("ttt-btn");
    cell.dataset.index = i;
    cell.innerText = v;
    if (v !== "") cell.style.color = "#c0c0c0";
    cell.onclick = () => playerMove(i);
    area.appendChild(cell);
  });
}

function playerMove(index) {
  if (tttBoard[index] !== "" || tttGameOver || tttBotThinking) return;
  tttBoard[index] = tttCurrent;
  renderTTT();
  if (checkWinner(tttCurrent)) return showWinner(tttCurrent);
  if (tttBoard.every(v => v !== "")) return showDraw();
  tttCurrent = "O";
  botMove();
}

// Bot logic — difficulty controls how smart it plays
function botMove() {
  tttBotThinking = true;
  const empty = tttBoard.map((v, i) => v === "" ? i : -1).filter(v => v !== -1);
  const difficulty = document.getElementById("difficulty").value;

  setTimeout(() => {
    let move = -1;

    if (difficulty === 'easy') {
      // Easy: completely random
      move = empty[Math.floor(Math.random() * empty.length)];

    } else if (difficulty === 'medium') {
      // Medium: 50% chance to play smart, otherwise random
      if (Math.random() < 0.5) {
        for (let i of empty) { tttBoard[i] = "O"; if (checkWinner("O")) { move = i; tttBoard[i] = ""; break; } tttBoard[i] = ""; }
        if (move === -1) { for (let i of empty) { tttBoard[i] = "X"; if (checkWinner("X")) { move = i; tttBoard[i] = ""; break; } tttBoard[i] = ""; } }
      }
      if (move === -1) move = empty[Math.floor(Math.random() * empty.length)];

    } else {
      // Hard: win if possible, block player if needed, then take center or corner
      for (let i of empty) { tttBoard[i] = "O"; if (checkWinner("O")) { move = i; tttBoard[i] = ""; break; } tttBoard[i] = ""; }
      if (move === -1) { for (let i of empty) { tttBoard[i] = "X"; if (checkWinner("X")) { move = i; tttBoard[i] = ""; break; } tttBoard[i] = ""; } }
      if (move === -1 && empty.includes(4)) move = 4;
      if (move === -1) { const corners = [0, 2, 6, 8].filter(c => empty.includes(c)); if (corners.length) move = corners[Math.floor(Math.random() * corners.length)]; }
      if (move === -1) move = empty[Math.floor(Math.random() * empty.length)];
    }

    tttBoard[move] = "O";
    renderTTT();
    if (checkWinner("O")) { tttBotThinking = false; return showWinner("O"); }
    if (tttBoard.every(v => v !== "")) { tttBotThinking = false; return showDraw(); }
    tttCurrent = "X";
    tttBotThinking = false;
  }, 500); // small delay so the bot doesn't feel instant
}

function checkWinner(p) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return lines.some(([a, b, c]) => tttBoard[a] === p && tttBoard[b] === p && tttBoard[c] === p);
}

// Shows the winner popup then restarts after 1.5s
function showWinner(player) {
  tttGameOver = true;
  const area = document.getElementById("gameArea");
  const popup = document.createElement("div");
  popup.textContent = player + " WINS!";
  popup.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;font-weight:bold;color:lime;background:rgba(0,0,0,0.7);padding:20px 40px;border-radius:15px;text-align:center;z-index:1000;";
  area.appendChild(popup);
  setTimeout(() => { popup.remove(); startTicTacToe(); }, 1500);
}

function showDraw() {
  tttGameOver = true;
  const area = document.getElementById("gameArea");
  const popup = document.createElement("div");
  popup.textContent = "DRAW";
  popup.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;font-weight:bold;color:yellow;background:rgba(0,0,0,0.7);padding:20px 40px;border-radius:15px;text-align:center;z-index:1000;";
  area.appendChild(popup);
  setTimeout(() => { popup.remove(); startTicTacToe(); }, 1500);
}


// ---- Falling Emoji Effect ----

const emojis = ["♠️", "♣️", "🖤"];
const container = document.getElementById("emojiContainer");

function createEmoji() {
  const span = document.createElement("span");
  span.classList.add("emoji");
  span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  span.style.left = Math.random() * 80 + 10 + "vw";
  const size = Math.random() * 30 + 15;
  span.style.fontSize = size + "px";
  span.style.filter = `blur(${Math.random() * 2}px)`;
  span.style.animationDuration = (Math.random() * 5 + 5) + "s";
  container.appendChild(span);
  setTimeout(() => span.remove(), 10000);
}
setInterval(createEmoji, 300);


// ---- Water Ripple on Click ----

// Skip the ripple if clicking inside the game area or navbar
document.addEventListener("click", function (e) {
  if (e.target.closest('#lobby') || e.target.closest('#gameArea') ||
      e.target.closest('.sudoku-numbers') || e.target.closest('#navbar')) return;
  createWaterRipple(e.pageX, e.pageY);
});

document.addEventListener("touchstart", function (e) {
  if (e.target.closest('#lobby') || e.target.closest('#gameArea') ||
      e.target.closest('.sudoku-numbers') || e.target.closest('#navbar')) return;
  for (let i = 0; i < e.touches.length; i++) {
    createWaterRipple(e.touches[i].pageX, e.touches[i].pageY);
  }
});

function createWaterRipple(x, y) {
  for (let i = 0; i < 2; i++) {
    const ripple = document.createElement("span");
    ripple.className = "water-ripple";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.style.animationDelay = (i * 0.12) + "s";
    const sizeVariation = 1 + (Math.random() * 0.1 - 0.05);
    ripple.style.setProperty('--size-multiplier', sizeVariation);
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1200);
  }
  // Occasionally spawn small splash particles too
  if (Math.random() > 0.8) createSplashParticles(x, y);
}

function createSplashParticles(x, y) {
  for (let i = 0; i < 3; i++) {
    const particle = document.createElement("span");
    particle.className = "water-particle";
    const angle = (Math.PI * 2 * i) / 3;
    const distance = 20 + Math.random() * 15;
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance;
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.setProperty('--end-x', endX + 'px');
    particle.style.setProperty('--end-y', endY + 'px');
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 700);
  }
}


// ---- Profile Photo Click Animation ----

let isPhotoAnimating = false;

document.addEventListener('DOMContentLoaded', function () {
  initPhotoAnimation();
  if (typingElement) setTimeout(typeWriter, 500);
});

function initPhotoAnimation() {
  const container = document.querySelector('.facts-photos');
  if (!container) return;

  container.addEventListener('click', function (e) {
    const photo = e.target.closest('.stacked-photo');
    if (!photo || isPhotoAnimating) return;

    isPhotoAnimating = true;

    const overlay = document.createElement('div');
    overlay.classList.add('photo-overlay');
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);

    const clone = photo.cloneNode(true);
    clone.classList.add('photo-popup');
    clone.classList.remove('photo-3', 'photo-4', 'photo-5', 'stacked-photo');

    const rect = photo.getBoundingClientRect();
    const img = new Image();
    img.src = photo.src;

    clone.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      z-index: 10000;
      margin: 0;
      transform-style: preserve-3d;
      backface-visibility: hidden;
      object-fit: contain;
    `;

    document.body.appendChild(clone);
    photo.style.opacity = '0';
    photo.style.transform = 'scale(0.7)';

    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;

    img.onload = function () {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let targetWidth, targetHeight;

      if (aspectRatio > 1) {
        targetWidth = Math.min(maxWidth, img.naturalWidth * 0.95);
        targetHeight = targetWidth / aspectRatio;
        if (targetHeight > maxHeight) { targetHeight = maxHeight; targetWidth = targetHeight * aspectRatio; }
      } else {
        targetHeight = Math.min(maxHeight, img.naturalHeight * 0.95);
        targetWidth = targetHeight * aspectRatio;
        if (targetWidth > maxWidth) { targetWidth = maxWidth; targetHeight = targetWidth / aspectRatio; }
      }

      setTimeout(() => {
        clone.style.left = '50%';
        clone.style.top = '50%';
        clone.style.width = targetWidth + 'px';
        clone.style.height = targetHeight + 'px';
        clone.style.transform = 'translate(-50%, -50%) rotateY(360deg)';
        clone.style.transition = 'all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        clone.style.filter = 'drop-shadow(0 30px 80px rgba(255, 255, 255, 0.6))';
      }, 50);
    };

    // Fallback in case image load event doesn't fire in time
    setTimeout(() => {
      if (!clone.style.transition) {
        const fallbackWidth = Math.min(window.innerWidth * 0.85, 600);
        const fallbackHeight = Math.min(window.innerHeight * 0.85, 800);
        clone.style.left = '50%';
        clone.style.top = '50%';
        clone.style.width = fallbackWidth + 'px';
        clone.style.height = fallbackHeight + 'px';
        clone.style.transform = 'translate(-50%, -50%) rotateY(360deg)';
        clone.style.transition = 'all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        clone.style.filter = 'drop-shadow(0 30px 80px rgba(255, 255, 255, 0.6))';
      }
    }, 100);

    // Close and reorder after 2 seconds
    setTimeout(() => {
      overlay.classList.remove('active');
      clone.style.transform = 'translate(-50%, -50%) rotateY(720deg) scale(0.3)';
      clone.style.opacity = '0';
      clone.style.filter = 'drop-shadow(0 10px 20px rgba(255, 255, 255, 0.3))';
      clone.style.transition = 'all 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      setTimeout(() => {
        clone.remove();
        overlay.remove();
        reorderPhotos(photo);
      }, 700);
    }, 2000);
  });
}

// Moves the clicked photo to the front of the stack
function reorderPhotos(clickedPhoto) {
  const container = document.querySelector('.facts-photos');
  const allPhotos = Array.from(container.querySelectorAll('.stacked-photo'));
  const clickedIndex = allPhotos.indexOf(clickedPhoto);

  allPhotos.splice(clickedIndex, 1);
  allPhotos.unshift(clickedPhoto);

  allPhotos.forEach(p => {
    p.classList.remove('photo-3', 'photo-4', 'photo-5');
    p.style.opacity = '1';
    p.style.transform = '';
  });

  const positions = ['photo-3', 'photo-4', 'photo-5'];
  allPhotos.forEach((photo, i) => {
    if (i < positions.length) photo.classList.add(positions[i]);
  });

  allPhotos.forEach(photo => container.appendChild(photo));
  setTimeout(() => { isPhotoAnimating = false; }, 100);
}


// ---- Typing Animation ----

const typingElement = document.querySelector('.typing-text');
const textToType = "Ger Merwin E. Ytac";
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const deletingSpeed = 60;
const pauseBeforeDelete = 1500;
const pauseBeforeType = 500;

function typeWriter() {
  if (!typingElement) return;

  typingElement.textContent = textToType.substring(0, charIndex);

  if (!isDeleting) {
    if (charIndex < textToType.length) {
      charIndex++;
      setTimeout(typeWriter, typingSpeed);
    } else {
      // Done typing — wait then start deleting
      setTimeout(() => { isDeleting = true; typeWriter(); }, pauseBeforeDelete);
    }
  } else {
    if (charIndex > 0) {
      charIndex--;
      setTimeout(typeWriter, deletingSpeed);
    } else {
      // Done deleting — wait then start typing again
      isDeleting = false;
      setTimeout(typeWriter, pauseBeforeType);
    }
  }
}


// ---- Music Player ----

const playlist = [
  { name: "Golden Hour Instrumental", artist: "JVKE",          src: "song1.mp3" },
  { name: "Virus (intense)",           artist: "Beethoven",     src: "song2.mp3" },
  { name: "La maritza",                artist: "Sylvie Vartan", src: "song3.mp3" }
];

let currentTrack = 0;
let isPlaying = false;

const audioPlayer   = document.getElementById('audioPlayer');
const playBtn       = document.getElementById('playBtn');
const playIcon      = document.getElementById('playIcon');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const muteBtn       = document.getElementById('muteBtn');
const volumeIcon    = document.getElementById('volumeIcon');
const volumeSlider  = document.getElementById('volumeSlider');
const progressBar   = document.querySelector('.progress-bar');
const progress      = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl    = document.getElementById('duration');
const trackNameEl   = document.getElementById('trackName');
const trackArtistEl = document.getElementById('trackArtist');
const visualizer    = document.getElementById('visualizer');

document.addEventListener('DOMContentLoaded', function () {
  if (audioPlayer) {
    loadTrack(currentTrack);
    audioPlayer.volume = 0.7;
  }
});

function loadTrack(index) {
  const track = playlist[index];
  audioPlayer.src = track.src;
  trackNameEl.textContent = track.name;
  trackArtistEl.textContent = track.artist;
  progress.style.width = '0%';
  currentTimeEl.textContent = '0:00';
}

playBtn.addEventListener('click', function () {
  isPlaying ? pauseTrack() : playTrack();
});

function playTrack() {
  audioPlayer.play();
  isPlaying = true;
  playIcon.classList.replace('fa-play', 'fa-pause');
  visualizer.classList.add('active');
}

function pauseTrack() {
  audioPlayer.pause();
  isPlaying = false;
  playIcon.classList.replace('fa-pause', 'fa-play');
  visualizer.classList.remove('active');
}

prevBtn.addEventListener('click', function () {
  currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrack);
  if (isPlaying) playTrack();
});

nextBtn.addEventListener('click', function () {
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack(currentTrack);
  if (isPlaying) playTrack();
});

// Auto-advance to next song when current one ends
audioPlayer.addEventListener('ended', function () {
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack(currentTrack);
  playTrack();
});

muteBtn.addEventListener('click', function () {
  audioPlayer.muted = !audioPlayer.muted;
  if (audioPlayer.muted) {
    volumeIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
  } else {
    volumeIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
    volumeSlider.value = audioPlayer.volume * 100;
  }
});

volumeSlider.addEventListener('input', function () {
  const volume = this.value / 100;
  audioPlayer.volume = volume;
  audioPlayer.muted = false;

  // Swap the icon based on volume level
  volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down', 'fa-volume-mute');
  if (volume === 0) {
    volumeIcon.classList.add('fa-volume-mute');
    audioPlayer.muted = true;
  } else if (volume < 0.5) {
    volumeIcon.classList.add('fa-volume-down');
  } else {
    volumeIcon.classList.add('fa-volume-up');
  }
});

audioPlayer.addEventListener('timeupdate', function () {
  const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progress.style.width = progressPercent + '%';
  currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
});

audioPlayer.addEventListener('loadedmetadata', function () {
  durationEl.textContent = formatTime(audioPlayer.duration);
});

// Click anywhere on the progress bar to seek
progressBar.addEventListener('click', function (e) {
  const rect = progressBar.getBoundingClientRect();
  const seekTime = ((e.clientX - rect.left) / rect.width) * audioPlayer.duration;
  audioPlayer.currentTime = seekTime;
});

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Remember the volume setting between visits
volumeSlider.addEventListener('change', function () {
  localStorage.setItem('musicVolume', this.value);
});

window.addEventListener('load', function () {
  const savedVolume = localStorage.getItem('musicVolume');
  if (savedVolume) {
    volumeSlider.value = savedVolume;
    audioPlayer.volume = savedVolume / 100;
  }
});


// ---- Stacked Document Pages ----

document.addEventListener('DOMContentLoaded', function () {
  const pages = document.querySelectorAll('.document-page');
  const prevDocBtn = document.getElementById('prevDocBtn');
  const nextDocBtn = document.getElementById('nextDocBtn');
  const currentPageSpan = document.getElementById('currentDocPage');
  const totalPagesSpan = document.getElementById('totalDocPages');

  let currentPage = 1;
  const totalPages = pages.length;
  let isAnimating = false;

  if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

  function updateUI() {
    if (prevDocBtn) prevDocBtn.disabled = currentPage === 1 || isAnimating;
    if (nextDocBtn) nextDocBtn.disabled = currentPage === totalPages || isAnimating;
    if (currentPageSpan) currentPageSpan.textContent = currentPage;
  }

  // Repositions all pages in the stack based on which page is currently on top
  function restackPages() {
    pages.forEach((page, index) => {
      const pageNum = index + 1;
      const position = pageNum - currentPage;

      page.classList.remove('read', 'toss-1', 'toss-2', 'toss-3', 'toss-4', 'return-1', 'return-2', 'return-3', 'return-4');

      if (pageNum < currentPage) {
        // Already read — hide behind the stack
        page.style.opacity = '0';
        page.style.pointerEvents = 'none';
        page.style.zIndex = '0';
      } else {
        page.style.pointerEvents = 'auto';

        // Offset each page slightly so you can see the stack
        if (position === 0) {
          page.style.zIndex = '5';
          page.style.transform = 'translateX(-50%) translateY(0px) rotate(0deg)';
          page.style.opacity = '1';
          page.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)';
        } else if (position === 1) {
          page.style.zIndex = '4';
          page.style.transform = 'translateX(-50%) translateY(8px) rotate(-1deg)';
          page.style.opacity = '0.95';
          page.style.boxShadow = '0 3px 15px rgba(0,0,0,0.12), 0 1px 6px rgba(0,0,0,0.08)';
        } else if (position === 2) {
          page.style.zIndex = '3';
          page.style.transform = 'translateX(-50%) translateY(16px) rotate(1.5deg)';
          page.style.opacity = '0.9';
          page.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)';
        } else if (position === 3) {
          page.style.zIndex = '2';
          page.style.transform = 'translateX(-50%) translateY(24px) rotate(-0.8deg)';
          page.style.opacity = '0.85';
          page.style.boxShadow = '0 1px 10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)';
        } else {
          page.style.zIndex = '1';
          page.style.transform = 'translateX(-50%) translateY(32px) rotate(0.5deg)';
          page.style.opacity = '0.8';
          page.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)';
        }
      }
    });
  }

  function nextPage() {
    if (currentPage >= totalPages || isAnimating) return;
    isAnimating = true;
    updateUI();

    const currentPageEl = pages[currentPage - 1];
    const randomToss = Math.floor(Math.random() * 4) + 1;
    currentPageEl.classList.add(`toss-${randomToss}`, 'read');
    currentPageEl.style.zIndex = '10';

    setTimeout(() => {
      currentPage++;
      restackPages();
      isAnimating = false;
      updateUI();
    }, 900);
  }

  function prevPage() {
    if (currentPage === 1 || isAnimating) return;
    isAnimating = true;
    updateUI();

    currentPage--;
    const returningPageEl = pages[currentPage - 1];
    const randomReturn = Math.floor(Math.random() * 4) + 1;
    returningPageEl.style.opacity = '1';
    returningPageEl.style.pointerEvents = 'auto';
    returningPageEl.style.zIndex = '10';
    returningPageEl.classList.add(`return-${randomReturn}`);

    setTimeout(() => {
      returningPageEl.classList.remove(`return-${randomReturn}`);
      restackPages();
      isAnimating = false;
      updateUI();
    }, 900);
  }

  if (nextDocBtn) nextDocBtn.addEventListener('click', nextPage);
  if (prevDocBtn) prevDocBtn.addEventListener('click', prevPage);

  // Arrow keys also work for navigating pages
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') nextPage();
    else if (e.key === 'ArrowLeft') prevPage();
  });

  restackPages();
  updateUI();
});
