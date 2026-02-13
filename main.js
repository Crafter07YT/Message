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

// -------------------- Sudoku --------------------
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
  sudokuSolution = generateSolvedBoard();
  sudokuPuzzle = makePuzzle(sudokuSolution, difficulty);

  renderSudoku();
  startSudokuTimer();
  updateBestTimeDisplay();
}

function generateSolvedBoard(){
  let board = Array.from({length:9},()=>Array(9).fill(0));
  function solve(){
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        if(board[r][c]===0){
          let nums=[1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
          for(let n of nums){
            if(valid(board,r,c,n)){
              board[r][c]=n;
              if(solve()) return true;
              board[r][c]=0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  solve();
  return board;
}

function valid(board,r,c,n){
  for(let i=0;i<9;i++) if(board[r][i]===n||board[i][c]===n) return false;
  const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
  for(let i=0;i<3;i++) for(let j=0;j<3;j++) if(board[br+i][bc+j]===n) return false;
  return true;
}

function makePuzzle(solution,difficulty){
  let copy = solution.map(r=>r.slice());
  let holes = difficulty==='easy'?35:difficulty==='medium'?45:55;
  while(holes>0){
    let r=Math.floor(Math.random()*9), c=Math.floor(Math.random()*9);
    if(copy[r][c]!==0){ copy[r][c]=0; holes--; }
  }
  return copy;
}

function renderSudoku(){
  const area = document.getElementById("gameArea");
  area.style.display = "grid";
  area.style.gridTemplateColumns = "repeat(9,40px)";
  area.style.gridTemplateRows = "repeat(9,40px)";
  area.style.gap = "0px";

  sudokuPuzzle.forEach((row,r)=>{
    row.forEach((val,c)=>{
      const cell = document.createElement("div");
      cell.classList.add("sudoku-cell");
      if((r+1)%3===0 && r!==8) cell.classList.add("row-3");
      if((c+1)%3===0 && c!==8) cell.classList.add("col-3");
      if(val!==0){
        cell.textContent = val;
        cell.style.fontWeight = "bold";
        cell.style.color = "#c0c0c0"; // aesthetic gray
      }
      cell.addEventListener("click", ()=>{ sudokuSelected={r,c,el:cell}; });
      area.appendChild(cell);
    });
  });
  renderSudokuNumpad();
}

function renderSudokuNumpad(){
  const pad = document.getElementById("sudokuNumbers");
  pad.innerHTML="";
  for(let i=1;i<=9;i++){
    const btn=document.createElement("button");
    btn.textContent=i;
    btn.onclick=()=>placeSudokuNumber(i);
    pad.appendChild(btn);
  }
  const erase = document.createElement("button");
  erase.textContent="⌫";
  erase.onclick=eraseSudokuCell;
  pad.appendChild(erase);
}

function placeSudokuNumber(num){
  if(!sudokuSelected) return;
  const {r,c,el} = sudokuSelected;
  if(sudokuSolution[r][c]===num){
    el.textContent=num;
    el.style.color="#c0c0c0";
    el.classList.remove("wrong-cell");
    sudokuPuzzle[r][c]=num;
    checkSudokuWin();
  } else {
    el.textContent=num;
    el.style.color="red";
    el.classList.add("wrong-cell");
    sudokuLives--;
    if(navigator.vibrate) navigator.vibrate(200);
    if(sudokuLives<=0){ clearInterval(sudokuInterval); alert("Game Over!"); startSudoku(); }
  }
}

function eraseSudokuCell(){
  if(!sudokuSelected) return;
  const {r,c,el} = sudokuSelected;
  el.textContent="";
  el.style.color="#c0c0c0"; 
  el.classList.remove("wrong-cell");
  sudokuPuzzle[r][c]=0;
}

function checkSudokuWin(){
  if(sudokuPuzzle.flat().every(v=>v!==0)){
    clearInterval(sudokuInterval);
    if(!bestTime || sudokuTimer < bestTime){
      bestTime = sudokuTimer;
      localStorage.setItem("sudokuBestTime", bestTime);
    }
    alert("Sudoku Completed! Time: "+sudokuTimer+"s");
    updateBestTimeDisplay();
  }
}

function startSudokuTimer(){
  clearInterval(sudokuInterval);
  sudokuTimer=0;
  sudokuInterval=setInterval(()=>{
    sudokuTimer++;
    document.getElementById("currentTime").textContent = sudokuTimer;
  },1000);
}

function updateBestTimeDisplay(){
  document.getElementById("bestTime").textContent = bestTime ? bestTime : "--";
}

function hideSudokuTimer(){
  document.getElementById("sudokuTimerDisplay").style.display="none";
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
    if(v!=="") cell.style.color="#c0c0c0"; // aesthetic gray
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

// -------------------- Emoji Droplets (above boxes) --------------------
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

// ===== ENHANCED WATER RIPPLE EFFECT =====
// Replace your existing ripple code in main.js with this:

document.addEventListener("click", function(e){
  // Don't create ripples if clicking inside game lobby or navbar
  if(e.target.closest('#lobby') || 
     e.target.closest('#gameArea') || 
     e.target.closest('.sudoku-numbers') || 
     e.target.closest('#navbar')) {
    return;
  }
  
  createWaterRipple(e.pageX, e.pageY);
});

// Also add touch support for mobile
document.addEventListener("touchstart", function(e){
  // Don't create ripples if touching inside game lobby or navbar
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
  // Create 2 ripple waves (reduced from 3 for subtlety)
  for(let i = 0; i < 2; i++){
    const ripple = document.createElement("span");
    ripple.className = "water-ripple";
    
    // Position at click/touch point (using pageX/pageY for scrolling support)
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    
    // Delay each wave slightly for cascading effect
    ripple.style.animationDelay = (i * 0.12) + "s";
    
    // Slight size variation
    const sizeVariation = 1 + (Math.random() * 0.1 - 0.05);
    ripple.style.setProperty('--size-multiplier', sizeVariation);
    
    document.body.appendChild(ripple);
    
    // Remove after animation completes
    setTimeout(() => ripple.remove(), 1200);
  }
  
  // Rarely add small splash particles (20% chance, was 50%)
  if(Math.random() > 0.8) {
    createSplashParticles(x, y);
  }
}

function createSplashParticles(x, y) {
  // Reduced to 3 particles (was 5)
  for(let i = 0; i < 3; i++){
    const particle = document.createElement("span");
    particle.className = "water-particle";
    
    const angle = (Math.PI * 2 * i) / 3;
    const distance = 20 + Math.random() * 15; // Smaller distance
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


// ===== ADD THIS TO YOUR main.js FILE =====

// Photo Popup Animation - Playing Card Style (High Quality)
let isPhotoAnimating = false; // Global lock to prevent multiple clicks

document.addEventListener('DOMContentLoaded', function() {
  initPhotoAnimation();
});

function initPhotoAnimation() {
  const container = document.querySelector('.facts-photos');
  
  container.addEventListener('click', function(e) {
    const photo = e.target.closest('.stacked-photo');
    if (!photo || isPhotoAnimating) return;
    
    // Lock all photos from being clicked
    isPhotoAnimating = true;
    
    // Create overlay backdrop
    const overlay = document.createElement('div');
    overlay.classList.add('photo-overlay');
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('active'), 10);
    
    // Create a clone for the popup effect
    const clone = photo.cloneNode(true);
    clone.classList.add('photo-popup');
    clone.classList.remove('photo-3', 'photo-4', 'photo-5', 'stacked-photo');
    
    // Get the photo's current position and natural dimensions
    const rect = photo.getBoundingClientRect();
    
    // Calculate proper aspect ratio sizing
    const img = new Image();
    img.src = photo.src;
    
    // Set initial position with high quality settings
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
    
    // Hide original photo with subtle shrink
    photo.style.opacity = '0';
    photo.style.transform = 'scale(0.7)';
    
    // Calculate target size to fit screen while maintaining aspect ratio
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    
    img.onload = function() {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let targetWidth, targetHeight;
      
      if (aspectRatio > 1) {
        // Landscape
        targetWidth = Math.min(maxWidth, img.naturalWidth * 0.95);
        targetHeight = targetWidth / aspectRatio;
        
        if (targetHeight > maxHeight) {
          targetHeight = maxHeight;
          targetWidth = targetHeight * aspectRatio;
        }
      } else {
        // Portrait
        targetHeight = Math.min(maxHeight, img.naturalHeight * 0.95);
        targetWidth = targetHeight * aspectRatio;
        
        if (targetWidth > maxWidth) {
          targetWidth = maxWidth;
          targetHeight = targetWidth / aspectRatio;
        }
      }
      
      // Playing card animation: flip and fly to center (SMOOTH)
      setTimeout(() => {
        clone.style.left = '50%';
        clone.style.top = '50%';
        clone.style.width = targetWidth + 'px';
        clone.style.height = targetHeight + 'px';
        clone.style.transform = 'translate(-50%, -50%) rotateY(360deg)';
        clone.style.transition = 'all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // Smoother easing
        clone.style.filter = 'drop-shadow(0 30px 80px rgba(255, 255, 255, 0.6))'; // Better quality glow
      }, 50);
    };
    
    // Fallback if image doesn't load
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
    
    // After 2 seconds, flip back and fade out
    setTimeout(() => {
      overlay.classList.remove('active');
      clone.style.transform = 'translate(-50%, -50%) rotateY(720deg) scale(0.3)';
      clone.style.opacity = '0';
      clone.style.filter = 'drop-shadow(0 10px 20px rgba(255, 255, 255, 0.3))';
      clone.style.transition = 'all 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      
      // After fade, remove clone and reorder original photos
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
  
  // Find the index of clicked photo
  const clickedIndex = allPhotos.indexOf(clickedPhoto);
  
  // Remove clicked photo from array and add to beginning (bottom of z-index stack)
  allPhotos.splice(clickedIndex, 1);
  allPhotos.unshift(clickedPhoto); // Add to beginning = bottom of stack
  
  // Clear all position classes
  allPhotos.forEach(p => {
    p.classList.remove('photo-3', 'photo-4', 'photo-5');
    p.style.opacity = '1';
    p.style.transform = '';
  });
  
  // Reassign classes based on new order
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
// ===== TYPING ANIMATION - ADD TO YOUR main.js ===== 

// Typing animation configuration
const typingElement = document.querySelector('.typing-text');
const textToType = "Ger Merwin E. Ytac";
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100; // Milliseconds per character when typing
let deletingSpeed = 60; // Milliseconds per character when deleting
let pauseBeforeDelete = 1500; // Pause after finishing typing (2 seconds)
let pauseBeforeType = 500; // Pause after finishing deleting (0.5 seconds)

function typeWriter() {
  if (!typingElement) return;
  
  const currentText = textToType.substring(0, charIndex);
  typingElement.textContent = currentText;
  
  if (!isDeleting) {
    // TYPING MODE
    if (charIndex < textToType.length) {
      charIndex++;
      setTimeout(typeWriter, typingSpeed);
    } else {
      // Finished typing, wait before deleting
      setTimeout(() => {
        isDeleting = true;
        typeWriter();
      }, pauseBeforeDelete);
    }
  } else {
    // DELETING MODE
    if (charIndex > 0) {
      charIndex--;
      setTimeout(typeWriter, deletingSpeed);
    } else {
      // Finished deleting, wait before typing again
      isDeleting = false;
      setTimeout(typeWriter, pauseBeforeType);
    }
  }
}

// Start the typing animation when page loads
document.addEventListener('DOMContentLoaded', function() {
  if (typingElement) {
    setTimeout(typeWriter, 500); // Small delay before starting
  }
});
