let currentPlayer;
let BoardSize;
let gameOver = false;
let Moves;
let isReplaying = false;
let GameMode = document.getElementById("GameMode");
const boardContainer = document.getElementById("board");
const boardSizeInput = document.getElementById("BoardSize");

function Start() {
  isReplaying = false;
  currentPlayer = "X";
  Moves = [];
  document.getElementById("PlayerTurn").textContent =
    "Player " + currentPlayer + "'s Turn";
  document.getElementById("WhoWin").textContent = "";
  gameOver = false;

  CreateBoard();
}

function CreateBoard() {
  BoardSize = parseInt(boardSizeInput.value); //Parse Int BoardSize
  if (BoardSize < 3 || GameMode.value == "PVE") {
    BoardSize = 3;
  }
  board = Array.from({ length: BoardSize }, () =>
    Array.from({ length: BoardSize }, () => "")
  );
  boardContainer.innerHTML = "";
  boardContainer.style.gridTemplateColumns = `repeat(${BoardSize}, 1fr)`;

  for (let row = 0; row < BoardSize; row++) {
    //Create Row
    for (let col = 0; col < BoardSize; col++) {
      //Create Col in Each Row
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", MakeMove);
      cell.textContent = board[row][col];
      boardContainer.appendChild(cell);
    }
  }
}

function MakeMove() {
  const cell = event.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  if (board[row][col] == "" && !gameOver && !isReplaying) {
    board[row][col] = currentPlayer;
    cell.textContent = currentPlayer;

    Moves.push({ player: currentPlayer, row, col });

    if (CheckWin(row, col)) {
      document.getElementById("WhoWin").textContent =
        "Player " + currentPlayer + " Win!";
      gameOver = true;

      const matchData = {
        board: board,
        winner: currentPlayer,
        moves: Moves,
      };
      saveMatchData(matchData);
    } else if (CheckDraw()) {
      document.getElementById("WhoWin").textContent = "It's a Draw!";
      gameOver = true;
      const matchData = {
        board: board,
        winner: "Draw",
        moves: Moves,
      };
      saveMatchData(matchData);
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      document.getElementById("PlayerTurn").textContent =
        "Player " + currentPlayer + "'s Turn";

      if (
        GameMode.value === "PVE" &&
        currentPlayer === "O" &&
        !gameOver &&
        !isReplaying
      ) {
        // AI's turn
        const bestMove = findBestMove();
        airow = bestMove.row;
        aicol = bestMove.col;
        board[airow][aicol] = currentPlayer;
        const cell = document.querySelector(
          `[data-row="${airow}"][data-col="${aicol}"]`
        );
        cell.textContent = currentPlayer;
        Moves.push({ player: currentPlayer, row: airow, col: aicol });

        currentPlayer = currentPlayer === "X" ? "O" : "X";
      }
    }
  }
}

function CheckWin(row, col) {
  const symbol = board[row][col];
  let win = true;

  //Check row
  for (let i = 0; i < BoardSize; i++) {
    if (board[row][i] !== symbol) {
      win = false;
      break;
    }
  }

  if (win) return true;

  //Check Col
  win = true;
  for (let j = 0; j < BoardSize; j++) {
    if (board[j][col] !== symbol) {
      win = false;
      break;
    }
  }

  if (win) return true;

  //Check Diagonal
  if (row === col) {
    win = true;
    for (let k = 0; k < BoardSize; k++) {
      if (board[k][k] !== symbol) {
        win = false;
        break;
      }
    }
    if (win) return true;
  }

  if (row + col === BoardSize - 1) {
    win = true;
    for (let i = 0; i < BoardSize; i++) {
      if (board[i][BoardSize - 1 - i] !== symbol) {
        win = false;
        break;
      }
    }
    if (win) return true;
  }

  return false;
}

function CheckDraw() {
  for (let row = 0; row < BoardSize; row++) {
    for (let col = 0; col < BoardSize; col++) {
      if (board[row][col] === "") {
        return false;
      }
    }
  }
  return true;
}

function findBestMove() {
  let bestScore = -Infinity;
  let bestMove;

  for (let i = 0; i < BoardSize; i++) {
    for (let j = 0; j < BoardSize; j++) {
      if (board[i][j] == "") {
        board[i][j] = "O";
        const score = minimax(board, 0, false, i, j);
        board[i][j] = "";

        if (score > bestScore) {
          bestScore = score;
          bestMove = { row: i, col: j };
        }
      }
    }
  }

  return bestMove;
}

function minimax(board, depth, isMaximizing, row, col) {
  let scores = {
    X: -1,
    O: 1,
    Draw: 0,
  };

  if (CheckWin(row, col)) {
    return scores[currentPlayer];
  }

  if (CheckDraw()) {
    return scores["Draw"];
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < BoardSize; i++) {
      for (let j = 0; j < BoardSize; j++) {
        if (board[i][j] === "") {
          board[i][j] = "O";
          const score = minimax(board, depth + 1, false, i, j);
          board[i][j] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < BoardSize; i++) {
      for (let j = 0; j < BoardSize; j++) {
        if (board[i][j] === "") {
          board[i][j] = "X";
          const score = minimax(board, depth + 1, true, i, j);
          board[i][j] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  }
}

async function fetchMatchHistory() {
  const response = await fetch("http://localhost:3000/match");
  const matchHistory = await response.json();
  return matchHistory;
}

async function ReplayMenu() {
  const MatchHistory = await fetchMatchHistory();
  const ReplayMenu = document.getElementById("ReplayMenu");
  ReplayMenu.innerHTML = "";

  const reversedMatchHistory = MatchHistory.slice().reverse();

  reversedMatchHistory.forEach((match, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `Match ${reversedMatchHistory.length - index}`;
    ReplayMenu.appendChild(option);
  });
}

async function replayMatch(MatchIndex) {
  if (isReplaying) return;

  isReplaying = true;
  const MatchHistory = await fetchMatchHistory();
  const SelectedMatch = MatchHistory[MatchIndex];
  const replayMoves = SelectedMatch.moves;

  boardSizeInput.value = SelectedMatch.board.length;
  CreateBoard(); // Reset the game
  document.getElementById("PlayerTurn").textContent = "";

  if (SelectedMatch.winner == "X" || SelectedMatch.winner == "O") {
    document.getElementById("WhoWin").textContent =
      "This Match Player " + SelectedMatch.winner + " Win!";
  } else {
    document.getElementById("WhoWin").textContent = "This Match Is A Draw!";
  }

  for (let i = 0; i < replayMoves.length; i++) {
    if (!isReplaying) break;
    const move = replayMoves[i];
    const row = move.row;
    const col = move.col;
    const replayCell = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );

    replayCell.textContent = move.player;

    // Delay the replay to make it visually understandable
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  isReplaying = false;
}

async function saveMatchData(matchData) {
  const response = await fetch("http://localhost:3000/match", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(matchData),
  });
}
