let sudokuSolution = [], sudokuPuzzle = [], sudokuSelected = null;
let sudokuLives = 3, sudokuTimer = 0, sudokuInterval;
let bestTime = localStorage.getItem("sudokuBestTime") || null;
let sudokuDifficulty = "easy";

window.addEventListener('load', function() {
  if (document.getElementById('gameArea') && document.querySelector('.sudoku-container')) {
    initSudoku();
  }
  if (document.getElementById('gameArea') && document.querySelector('.tictactoe-game-container')) {
    initTicTacToe();
  }
});

function initSudoku() {
  updateBestTimeDisplay();
  setupSudokuDifficultyButtons();
  startSudoku();
}

function setupSudokuDifficultyButtons() {
  const buttons = document.querySelectorAll('.sudoku-container .difficulty-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      buttons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      sudokuDifficulty = this.dataset.difficulty;
      startSudoku();
    });
  });
}

function startSudoku() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "";
  document.getElementById("sudokuNumbers").style.display = "flex";

  sudokuLives = 3;
  sudokuTimer = 0;

  sudokuSolution = generateSimpleSolvedBoard();
  sudokuPuzzle = makePuzzle(sudokuSolution, sudokuDifficulty);

  renderSudoku();
  startSudokuTimer();
  updateBestTimeDisplay();
  updateLivesDisplay();
}

function generateSimpleSolvedBoard() {
  const templates = [
    [[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]],
    [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]],
    [[6,2,8,4,5,1,7,9,3],[5,9,4,7,3,2,6,8,1],[7,1,3,6,8,9,5,4,2],[2,4,7,3,1,5,8,6,9],[9,6,1,8,2,7,3,5,4],[3,8,5,9,6,4,2,1,7],[1,5,6,2,4,3,9,7,8],[4,3,9,5,7,8,1,2,6],[8,7,2,1,9,6,4,3,5]]
  ];

  let board = templates[Math.floor(Math.random() * templates.length)].map(row => [...row]);
  for (let box = 0; box < 3; box++) {
    const offset = box * 3;
    if (Math.random() > 0.5) {
      [board[offset], board[offset + 1]] = [board[offset + 1], board[offset]];
    }
  }
  return board;
}

function makePuzzle(solution, difficulty) {
  let copy = solution.map(r => r.slice());
  let holes = difficulty === 'easy' ? 35 : difficulty === 'medium' ? 45 : 55;
  let attempts = 0;

  while (holes > 0 && attempts < 100) {
    let r = Math.floor(Math.random() * 9);
    let c = Math.floor(Math.random() * 9);
    if (copy[r][c] !== 0) { copy[r][c] = 0; holes--; }
    attempts++;
  }
  return copy;
}

function renderSudoku() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "";
  const fragment = document.createDocumentFragment();

  sudokuPuzzle.forEach((row, r) => {
    row.forEach((val, c) => {
      const cell = document.createElement("div");
      cell.classList.add("sudoku-cell");

      if ((r + 1) % 3 === 0 && r !== 8) cell.classList.add("row-3");
      if ((c + 1) % 3 === 0 && c !== 8) cell.classList.add("col-3");

      if (val !== 0) {
        cell.textContent = val;
        cell.classList.add("given");
      }

      cell.dataset.row = r;
      cell.dataset.col = c;
      fragment.appendChild(cell);
    });
  });

  area.innerHTML = '';
  area.appendChild(fragment);
  area.onclick = handleSudokuClick;
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

  if (el.classList.contains('given')) return;

  if (sudokuSolution[r][c] === num) {
    el.textContent = num;
    el.classList.remove("wrong-cell");
    el.classList.add("given");
    sudokuPuzzle[r][c] = num;
    checkSudokuWin();
  } else {
    el.textContent = num;
    el.classList.add("wrong-cell");
    el.classList.remove("given");
    sudokuLives--;
    updateLivesDisplay();
    if (navigator.vibrate) navigator.vibrate(200);
    if (sudokuLives <= 0) {
      clearInterval(sudokuInterval);
      showSudokuPopup("Game Over!", false);
      setTimeout(() => startSudoku(), 2000);
    }
  }
}

function eraseSudokuCell() {
  if (!sudokuSelected) return;
  const { r, c, el } = sudokuSelected;
  if (el.classList.contains('given') && sudokuPuzzle[r][c] !== 0) return;
  el.textContent = "";
  el.classList.remove("wrong-cell", "given");
  sudokuPuzzle[r][c] = 0;
}

function checkSudokuWin() {
  if (sudokuPuzzle.flat().every(v => v !== 0)) {
    clearInterval(sudokuInterval);
    if (!bestTime || sudokuTimer < bestTime) {
      bestTime = sudokuTimer;
      localStorage.setItem("sudokuBestTime", bestTime);
    }
    updateBestTimeDisplay();
    showSudokuPopup("Solved! ⏱ " + sudokuTimer + "s", true);
    setTimeout(() => startSudoku(), 2800);
  }
}

function showSudokuPopup(message, isWin) {
  const area = document.getElementById("gameArea");
  const popup = document.createElement("div");
  popup.className = "game-popup";
  popup.textContent = message;
  area.style.position = "relative";
  area.appendChild(popup);
  setTimeout(() => popup.remove(), isWin ? 2600 : 1800);
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

function updateLivesDisplay() {
  const hearts = "❤️".repeat(sudokuLives) + "🤍".repeat(3 - sudokuLives);
  document.getElementById("livesDisplay").textContent = hearts;
}


let tttBoard = [], tttCurrent = "X", tttGameOver = false, tttBotThinking = false;
let tttDifficulty = "easy";

function initTicTacToe() {
  setupTicTacToeDifficultyButtons();
  startTicTacToe();
}

function setupTicTacToeDifficultyButtons() {
  const buttons = document.querySelectorAll('.tictactoe-game-container .difficulty-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      buttons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      tttDifficulty = this.dataset.difficulty;
      startTicTacToe();
    });
  });
}

function startTicTacToe() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "";
  tttBoard = Array(9).fill("");
  tttCurrent = "X";
  tttGameOver = false;
  tttBotThinking = false;
  updateTurnIndicator();
  renderTTT();
}

function renderTTT() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "";
  tttBoard.forEach((v, i) => {
    const cell = document.createElement("button");
    cell.classList.add("ttt-btn");
    cell.dataset.index = i;
    cell.textContent = v;
    if (v === "O") cell.setAttribute("data-mark", "O");
    if (v !== "") cell.disabled = true;
    cell.onclick = () => playerMove(i);
    area.appendChild(cell);
  });
}

function updateTurnIndicator() {
  const indicator = document.getElementById("turnIndicator");
  if (!indicator) return;
  if (tttGameOver) {
    indicator.textContent = "Game Over!";
  } else if (tttBotThinking) {
    indicator.textContent = "Bot is thinking...";
  } else if (tttCurrent === "X") {
    indicator.textContent = "Your Turn (X)";
  } else {
    indicator.textContent = "Bot's Turn (O)";
  }
}

function playerMove(index) {
  if (tttBoard[index] !== "" || tttGameOver || tttBotThinking) return;
  tttBoard[index] = tttCurrent;
  renderTTT();
  if (checkWinner(tttCurrent)) return showTTTResult(tttCurrent + " Wins!");
  if (tttBoard.every(v => v !== "")) return showTTTResult("Draw!");
  tttCurrent = "O";
  updateTurnIndicator();
  botMove();
}

function botMove() {
  tttBotThinking = true;
  updateTurnIndicator();
  const empty = tttBoard.map((v, i) => v === "" ? i : -1).filter(v => v !== -1);

  setTimeout(() => {
    let move = -1;

    if (tttDifficulty === 'easy') {
      move = empty[Math.floor(Math.random() * empty.length)];

    } else if (tttDifficulty === 'medium') {
      if (Math.random() < 0.5) {
        for (let i of empty) { tttBoard[i] = "O"; if (checkWinner("O")) { move = i; tttBoard[i] = ""; break; } tttBoard[i] = ""; }
        if (move === -1) { for (let i of empty) { tttBoard[i] = "X"; if (checkWinner("X")) { move = i; tttBoard[i] = ""; break; } tttBoard[i] = ""; } }
      }
      if (move === -1) move = empty[Math.floor(Math.random() * empty.length)];

    } else {
      for (let i of empty) { tttBoard[i] = "O"; if (checkWinner("O")) { move = i; tttBoard[i] = ""; break; } tttBoard[i] = ""; }
      if (move === -1) { for (let i of empty) { tttBoard[i] = "X"; if (checkWinner("X")) { move = i; tttBoard[i] = ""; break; } tttBoard[i] = ""; } }
      if (move === -1 && empty.includes(4)) move = 4;
      if (move === -1) { const corners = [0, 2, 6, 8].filter(c => empty.includes(c)); if (corners.length) move = corners[Math.floor(Math.random() * corners.length)]; }
      if (move === -1) move = empty[Math.floor(Math.random() * empty.length)];
    }

    tttBoard[move] = "O";
    renderTTT();
    if (checkWinner("O")) { tttBotThinking = false; return showTTTResult("O Wins!"); }
    if (tttBoard.every(v => v !== "")) { tttBotThinking = false; return showTTTResult("Draw!"); }
    tttCurrent = "X";
    tttBotThinking = false;
    updateTurnIndicator();
  }, 500);
}

function checkWinner(p) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return lines.some(([a, b, c]) => tttBoard[a] === p && tttBoard[b] === p && tttBoard[c] === p);
}

function showTTTResult(message) {
  tttGameOver = true;
  updateTurnIndicator();
  const area = document.getElementById("gameArea");
  const popup = document.createElement("div");
  popup.className = "game-popup";
  popup.textContent = message;
  area.style.position = "relative";
  area.appendChild(popup);
  setTimeout(() => { popup.remove(); startTicTacToe(); }, 2000);
}
