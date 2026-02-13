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

// -------------------- Ripple Effect (Multiple Water Waves) --------------------
document.addEventListener("click", function(e){
  for(let i=0;i<3;i++){
    const ripple = document.createElement("span");
    ripple.className="ripple";
    ripple.style.left = e.clientX + "px";
    ripple.style.top = e.clientY + "px";
    ripple.style.animationDelay = (i*0.15) + "s";
    ripple.style.width = "0px";
    ripple.style.height = "0px";
    ripple.style.borderRadius="50%";
    ripple.style.position="absolute";
    ripple.style.background = "rgba(255,255,255,0.3)";
    ripple.style.pointerEvents="none";
    ripple.style.animation = "waterRipple 0.8s ease-out forwards";
    document.body.appendChild(ripple);
    setTimeout(()=>ripple.remove(),1200);
  }
});