// -------------------- Smooth Scroll --------------------
function scrollToSection(id){
  const el = document.getElementById(id);
  if(el){
    const yOffset = -90;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({top: y, behavior: 'smooth'});
  }
}

// -------------------- Scroll Slide Animation --------------------
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

// -------------------- OPTIMIZED SUDOKU --------------------
let sudokuSolution = [], sudokuPuzzle = [], sudokuSelected = null, sudokuLives = 3, sudokuTimer = 0, sudokuInterval;
let bestTime = localStorage.getItem("sudokuBestTime") || null;

function startSudoku(){
  const area = document.getElementById("gameArea");
  area.innerHTML = "";
  document.getElementById("sudokuNumbers").style.display = "flex";
  document.getElementById("sudokuTimerDisplay").style.display = "block";

  const difficulty = document.getElementById("difficulty").value;
  sudokuLives = 3;
  sudokuTimer = 0;
  
  // Use optimized board generation
  sudokuSolution = generateSimpleSolvedBoard();
  sudokuPuzzle = makePuzzle(sudokuSolution, difficulty);

  renderSudoku();
  startSudokuTimer();
  updateBestTimeDisplay();
}

// Optimized board generation - much faster!
function generateSimpleSolvedBoard(){
  // Pre-made valid Sudoku solutions to avoid heavy computation
  const templates = [
    [[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]],
    [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]],
    [[6,2,8,4,5,1,7,9,3],[5,9,4,7,3,2,6,8,1],[7,1,3,6,8,9,5,4,2],[2,4,7,3,1,5,8,6,9],[9,6,1,8,2,7,3,5,4],[3,8,5,9,6,4,2,1,7],[1,5,6,2,4,3,9,7,8],[4,3,9,5,7,8,1,2,6],[8,7,2,1,9,6,4,3,5]]
  ];
  
  // Pick a random template and shuffle it slightly
  let board = templates[Math.floor(Math.random() * templates.length)].map(row => [...row]);
  
  // Simple shuffle by swapping rows within boxes
  for(let box = 0; box < 3; box++) {
    const offset = box * 3;
    if(Math.random() > 0.5) {
      [board[offset], board[offset + 1]] = [board[offset + 1], board[offset]];
    }
  }
  
  return board;
}

function makePuzzle(solution, difficulty){
  let copy = solution.map(r => r.slice());
  let holes = difficulty === 'easy' ? 35 : difficulty === 'medium' ? 45 : 55;
  let attempts = 0;
  
  while(holes > 0 && attempts < 100) {
    let r = Math.floor(Math.random() * 9);
    let c = Math.floor(Math.random() * 9);
    if(copy[r][c] !== 0) { 
      copy[r][c] = 0; 
      holes--; 
    }
    attempts++;
  }
  return copy;
}

// Optimized rendering with fragment
function renderSudoku(){
  const area = document.getElementById("gameArea");
  area.style.display = "grid";
  area.style.gridTemplateColumns = "repeat(9, 40px)";
  area.style.gridTemplateRows = "repeat(9, 40px)";
  area.style.gap = "0px";
  
  // Use document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  sudokuPuzzle.forEach((row, r) => {
    row.forEach((val, c) => {
      const cell = document.createElement("div");
      cell.classList.add("sudoku-cell");
      if((r + 1) % 3 === 0 && r !== 8) cell.classList.add("row-3");
      if((c + 1) % 3 === 0 && c !== 8) cell.classList.add("col-3");
      
      if(val !== 0) {
        cell.textContent = val;
        cell.style.fontWeight = "bold";
        cell.style.color = "#c0c0c0";
      }
      
      // Use dataset for single event listener
      cell.dataset.row = r;
      cell.dataset.col = c;
      
      fragment.appendChild(cell);
    });
  });
  
  area.innerHTML = '';
  area.appendChild(fragment);
  
  // Add single delegated event listener
  area.onclick = handleSudokuClick;
  
  renderSudokuNumpad();
}

function handleSudokuClick(e) {
  const cell = e.target.closest('.sudoku-cell');
  if(!cell) return;
  
  const r = parseInt(cell.dataset.row);
  const c = parseInt(cell.dataset.col);
  
  // Remove previous selection
  document.querySelectorAll('.sudoku-cell.selected').forEach(c => c.classList.remove('selected'));
  
  // Set new selection
  cell.classList.add('selected');
  sudokuSelected = {r, c, el: cell};
}

function renderSudokuNumpad(){
  const pad = document.getElementById("sudokuNumbers");
  pad.innerHTML = "";
  
  const fragment = document.createDocumentFragment();
  
  for(let i = 1; i <= 9; i++) {
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

function placeSudokuNumber(num){
  if(!sudokuSelected) return;
  const {r, c, el} = sudokuSelected;
  
  if(sudokuSolution[r][c] === num) {
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
    if(navigator.vibrate) navigator.vibrate(200);
    if(sudokuLives <= 0) { 
      clearInterval(sudokuInterval); 
      alert("Game Over!"); 
      startSudoku(); 
    }
  }
}

function eraseSudokuCell(){
  if(!sudokuSelected) return;
  const {r, c, el} = sudokuSelected;
  el.textContent = "";
  el.style.color = "#c0c0c0"; 
  el.classList.remove("wrong-cell");
  sudokuPuzzle[r][c] = 0;
}

function checkSudokuWin(){
  if(sudokuPuzzle.flat().every(v => v !== 0)) {
    clearInterval(sudokuInterval);
    if(!bestTime || sudokuTimer < bestTime) {
      bestTime = sudokuTimer;
      localStorage.setItem("sudokuBestTime", bestTime);
    }
    alert("Sudoku Completed! Time: " + sudokuTimer + "s");
    updateBestTimeDisplay();
  }
}

function startSudokuTimer(){
  clearInterval(sudokuInterval);
  sudokuTimer = 0;
  sudokuInterval = setInterval(() => {
    sudokuTimer++;
    document.getElementById("currentTime").textContent = sudokuTimer;
  }, 1000);
}

function updateBestTimeDisplay(){
  document.getElementById("bestTime").textContent = bestTime ? bestTime : "--";
}

function hideSudokuTimer(){
  document.getElementById("sudokuTimerDisplay").style.display = "none";
}

// -------------------- Tic Tac Toe --------------------
let tttBoard=[], tttCurrent="X", tttGameOver=false, tttBotThinking=false;

function startTicTacToe(){
  hideSudokuTimer();
  const area = document.getElementById("gameArea");
  area.innerHTML="";
  tttBoard = Array(9).fill("");
  tttCurrent = "X";
  tttGameOver = false;
  tttBotThinking = false;
  area.style.display="grid";
  area.style.gridTemplateColumns="repeat(3,90px)";
  area.style.gridTemplateRows="repeat(3,90px)";
  area.style.gridGap="10px";
  renderTTT();
}

function renderTTT(){
  const area = document.getElementById("gameArea");
  area.innerHTML="";
  tttBoard.forEach((v,i)=>{
    const cell = document.createElement("button");
    cell.classList.add("ttt-btn");
    cell.dataset.index = i;
    cell.innerText = v;
    if(v!=="") cell.style.color="#c0c0c0";
    cell.onclick = ()=>playerMove(i);
    area.appendChild(cell);
  });
}

function playerMove(index){
  if(tttBoard[index]!="" || tttGameOver || tttBotThinking) return;
  tttBoard[index] = tttCurrent;
  renderTTT();
  if(checkWinner(tttCurrent)) return showWinner(tttCurrent);
  if(tttBoard.every(v=>v!="")) return showDraw();
  tttCurrent="O";
  botMove();
}

function botMove(){
  tttBotThinking = true;
  const empty = tttBoard.map((v,i)=>v===""?i:-1).filter(v=>v!=-1);
  setTimeout(()=>{
    let move=-1;
    // Win
    for(let i of empty){ tttBoard[i]="O"; if(checkWinner("O")){ move=i; tttBoard[i]=""; break;} tttBoard[i]=""; }
    // Block
    if(move===-1){ for(let i of empty){ tttBoard[i]="X"; if(checkWinner("X")){ move=i; tttBoard[i]=""; break;} tttBoard[i]=""; } }
    // Random
    if(move===-1) move=empty[Math.floor(Math.random()*empty.length)];
    tttBoard[move]="O";
    renderTTT();
    if(checkWinner("O")){ tttBotThinking=false; return showWinner("O"); }
    if(tttBoard.every(v=>v!="")){ tttBotThinking=false; return showDraw(); }
    tttCurrent="X";
    tttBotThinking=false;
  },500);
}

function checkWinner(p){
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return lines.some(([a,b,c])=>tttBoard[a]===p && tttBoard[b]===p && tttBoard[c]===p);
}

function showWinner(player){
  tttGameOver=true;
  const area = document.getElementById("gameArea");
  const popup = document.createElement("div");
  popup.textContent = player + " WINS!";
  popup.style.position="absolute";
  popup.style.top="50%";
  popup.style.left="50%";
  popup.style.transform="translate(-50%,-50%)";
  popup.style.fontSize="48px";
  popup.style.fontWeight="bold";
  popup.style.color="lime";
  popup.style.background="rgba(0,0,0,0.7)";
  popup.style.padding="20px 40px";
  popup.style.borderRadius="15px";
  popup.style.textAlign="center";
  popup.style.zIndex="1000";
  area.appendChild(popup);
  setTimeout(()=>{
    popup.remove();
    startTicTacToe();
  },1500);
}

function showDraw(){
  tttGameOver=true;
  const area = document.getElementById("gameArea");
  const popup = document.createElement("div");
  popup.textContent = "DRAW";
  popup.style.position="absolute";
  popup.style.top="50%";
  popup.style.left="50%";
  popup.style.transform="translate(-50%,-50%)";
  popup.style.fontSize="48px";
  popup.style.fontWeight="bold";
  popup.style.color="yellow";
  popup.style.background="rgba(0,0,0,0.7)";
  popup.style.padding="20px 40px";
  popup.style.borderRadius="15px";
  popup.style.textAlign="center";
  popup.style.zIndex="1000";
  area.appendChild(popup);
  setTimeout(()=>{
    popup.remove();
    startTicTacToe();
  },1500);
}

// -------------------- Emoji Droplets --------------------
const emojis = ["♠️","♣️","🖤"];
const container = document.getElementById("emojiContainer");

function createEmoji(){
  const span = document.createElement("span");
  span.classList.add("emoji");
  span.textContent = emojis[Math.floor(Math.random()*emojis.length)];
  span.style.left = Math.random()*80 + 10 + "vw";
  const size = Math.random()*30 + 15;
  span.style.fontSize = size + "px";
  span.style.filter = `blur(${Math.random()*2}px)`;
  span.style.animationDuration = (Math.random()*5 + 5) + "s";
  container.appendChild(span);
  setTimeout(()=>span.remove(),10000);
}
setInterval(createEmoji,300);

// -------------------- Water Ripple Effect --------------------
document.addEventListener("click", function(e){
  if(e.target.closest('#lobby') || 
     e.target.closest('#gameArea') || 
     e.target.closest('.sudoku-numbers') || 
     e.target.closest('#navbar')) {
    return;
  }
  createWaterRipple(e.pageX, e.pageY);
});

document.addEventListener("touchstart", function(e){
  if(e.target.closest('#lobby') || 
     e.target.closest('#gameArea') || 
     e.target.closest('.sudoku-numbers') || 
     e.target.closest('#navbar')) {
    return;
  }
  for(let i = 0; i < e.touches.length; i++){
    createWaterRipple(e.touches[i].pageX, e.touches[i].pageY);
  }
});

function createWaterRipple(x, y) {
  for(let i = 0; i < 2; i++){
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
  if(Math.random() > 0.8) {
    createSplashParticles(x, y);
  }
}

function createSplashParticles(x, y) {
  for(let i = 0; i < 3; i++){
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

// -------------------- Photo Animation --------------------
let isPhotoAnimating = false;

document.addEventListener('DOMContentLoaded', function() {
  initPhotoAnimation();
  if (typingElement) {
    setTimeout(typeWriter, 500);
  }
});

function initPhotoAnimation() {
  const container = document.querySelector('.facts-photos');
  if(!container) return;
  
  container.addEventListener('click', function(e) {
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
    
    clone.style.position = 'fixed';
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.zIndex = '10000';
    clone.style.margin = '0';
    clone.style.transformStyle = 'preserve-3d';
    clone.style.backfaceVisibility = 'hidden';
    clone.style.objectFit = 'contain';
    clone.style.imageRendering = 'auto';
    clone.style.WebkitFontSmoothing = 'antialiased';
    clone.style.willChange = 'transform, width, height';
    
    document.body.appendChild(clone);
    
    photo.style.opacity = '0';
    photo.style.transform = 'scale(0.7)';
    
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    
    img.onload = function() {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let targetWidth, targetHeight;
      
      if (aspectRatio > 1) {
        targetWidth = Math.min(maxWidth, img.naturalWidth * 0.95);
        targetHeight = targetWidth / aspectRatio;
        if (targetHeight > maxHeight) {
          targetHeight = maxHeight;
          targetWidth = targetHeight * aspectRatio;
        }
      } else {
        targetHeight = Math.min(maxHeight, img.naturalHeight * 0.95);
        targetWidth = targetHeight * aspectRatio;
        if (targetWidth > maxWidth) {
          targetWidth = maxWidth;
          targetHeight = targetWidth / aspectRatio;
        }
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
    if (i < positions.length) {
      photo.classList.add(positions[i]);
    }
  });
  
  allPhotos.forEach(photo => container.appendChild(photo));
  
  setTimeout(() => {
    isPhotoAnimating = false;
  }, 100);
}

// -------------------- Typing Animation --------------------
const typingElement = document.querySelector('.typing-text');
const textToType = "Ger Merwin E. Ytac";
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;
let deletingSpeed = 60;
let pauseBeforeDelete = 1500;
let pauseBeforeType = 500;

function typeWriter() {
  if (!typingElement) return;
  
  const currentText = textToType.substring(0, charIndex);
  typingElement.textContent = currentText;
  
  if (!isDeleting) {
    if (charIndex < textToType.length) {
      charIndex++;
      setTimeout(typeWriter, typingSpeed);
    } else {
      setTimeout(() => {
        isDeleting = true;
        typeWriter();
      }, pauseBeforeDelete);
    }
  } else {
    if (charIndex > 0) {
      charIndex--;
      setTimeout(typeWriter, deletingSpeed);
    } else {
      isDeleting = false;
      setTimeout(typeWriter, pauseBeforeType);
    }
  }
}
// ===== MUSIC PLAYER - ADD TO YOUR main.js =====

// Music Player Configuration
const playlist = [
  {
    name: "Golden Hour Instrumental",
    artist: "JVKE",
    src: "song1.mp3" // Replace with your actual music file path
  },
  {
    name: "Virus (intense)",
    artist: "Beethoven",
    src: "song2.mp3"
  },
  {
    name: "La maritza",
    artist: "Sylvie Vartan",
    src: "music/song3.mp3"
  }
];

let currentTrack = 0;
let isPlaying = false;

// Get DOM elements
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeIcon = document.getElementById('volumeIcon');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.querySelector('.progress-bar');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const trackNameEl = document.getElementById('trackName');
const trackArtistEl = document.getElementById('trackArtist');
const visualizer = document.getElementById('visualizer');

// Initialize player when DOM loads
document.addEventListener('DOMContentLoaded', function() {
  if (audioPlayer) {
    loadTrack(currentTrack);
    audioPlayer.volume = 0.7; // Set initial volume to 70%
  }
});

// Load track
function loadTrack(index) {
  const track = playlist[index];
  audioPlayer.src = track.src;
  trackNameEl.textContent = track.name;
  trackArtistEl.textContent = track.artist;
  
  // Reset progress
  progress.style.width = '0%';
  currentTimeEl.textContent = '0:00';
}

// Play/Pause
playBtn.addEventListener('click', function() {
  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
});

function playTrack() {
  audioPlayer.play();
  isPlaying = true;
  playIcon.classList.remove('fa-play');
  playIcon.classList.add('fa-pause');
  visualizer.classList.add('active');
}

function pauseTrack() {
  audioPlayer.pause();
  isPlaying = false;
  playIcon.classList.remove('fa-pause');
  playIcon.classList.add('fa-play');
  visualizer.classList.remove('active');
}

// Previous track
prevBtn.addEventListener('click', function() {
  currentTrack--;
  if (currentTrack < 0) {
    currentTrack = playlist.length - 1;
  }
  loadTrack(currentTrack);
  if (isPlaying) {
    playTrack();
  }
});

// Next track
nextBtn.addEventListener('click', function() {
  currentTrack++;
  if (currentTrack >= playlist.length) {
    currentTrack = 0;
  }
  loadTrack(currentTrack);
  if (isPlaying) {
    playTrack();
  }
});

// Auto play next track when current ends
audioPlayer.addEventListener('ended', function() {
  currentTrack++;
  if (currentTrack >= playlist.length) {
    currentTrack = 0;
  }
  loadTrack(currentTrack);
  playTrack();
});

// Mute/Unmute
muteBtn.addEventListener('click', function() {
  if (audioPlayer.muted) {
    audioPlayer.muted = false;
    volumeIcon.classList.remove('fa-volume-mute');
    volumeIcon.classList.add('fa-volume-up');
    volumeSlider.value = audioPlayer.volume * 100;
  } else {
    audioPlayer.muted = true;
    volumeIcon.classList.remove('fa-volume-up');
    volumeIcon.classList.add('fa-volume-mute');
  }
});

// Volume control
volumeSlider.addEventListener('input', function() {
  const volume = this.value / 100;
  audioPlayer.volume = volume;
  
  // Update mute button icon based on volume
  if (volume === 0) {
    volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down');
    volumeIcon.classList.add('fa-volume-mute');
    audioPlayer.muted = true;
  } else if (volume < 0.5) {
    volumeIcon.classList.remove('fa-volume-up', 'fa-volume-mute');
    volumeIcon.classList.add('fa-volume-down');
    audioPlayer.muted = false;
  } else {
    volumeIcon.classList.remove('fa-volume-down', 'fa-volume-mute');
    volumeIcon.classList.add('fa-volume-up');
    audioPlayer.muted = false;
  }
});

// Update progress bar
audioPlayer.addEventListener('timeupdate', function() {
  const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progress.style.width = progressPercent + '%';
  
  // Update time display
  currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
});

// Update duration when metadata loads
audioPlayer.addEventListener('loadedmetadata', function() {
  durationEl.textContent = formatTime(audioPlayer.duration);
});

// Seek functionality
progressBar.addEventListener('click', function(e) {
  const rect = progressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  const seekTime = (clickX / width) * audioPlayer.duration;
  audioPlayer.currentTime = seekTime;
});

// Format time helper
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Save volume preference
volumeSlider.addEventListener('change', function() {
  localStorage.setItem('musicVolume', this.value);
});

// Load saved volume on page load
window.addEventListener('load', function() {
  const savedVolume = localStorage.getItem('musicVolume');
  if (savedVolume) {
    volumeSlider.value = savedVolume;
    audioPlayer.volume = savedVolume / 100;
  }
});
