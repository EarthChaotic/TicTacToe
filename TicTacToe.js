let currentPlayer;
let BoardSize;
let gameOver = false;
let Moves;
let isReplaying = false;
let aiPlayer = "O";
let isAITurn = false;
let GameMode = document.getElementById("GameMode");
let boardContainer = document.getElementById("board");
let boardSizeInput = document.getElementById("BoardSize");

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
  if(isAITurn){
    return
  }

  if (board[row][col] == "" && !gameOver && !isReplaying ) {
    if (GameMode.value === "PVP" || currentPlayer !== aiPlayer) {
      board[row][col] = currentPlayer;
      cell.textContent = currentPlayer;

      Moves.push({ player: currentPlayer, row, col });

      if (CheckWin()) {
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
      }
    }

    if (GameMode.value === "PVE" && currentPlayer === "O") {
      PVE();
    }
  }
}

function BestMove() {
  let bestScore = -Infinity;
  let bestMove;
  if (!gameOver) {
    for (let row = 0; row < BoardSize; row++) {
      for (let col = 0; col < BoardSize; col++) {
        if (board[row][col] === "") {
          board[row][col] = currentPlayer;
          const score = minimax(board, 0, false);
          board[row][col] = "";
          if (score > bestScore) {
            bestScore = score;
            bestMove = { row, col };
          }
        }
      }
    }
  }
  return bestMove;
}

function PVE() {
  isAITurn = true;

  setTimeout(() => {
    let bestMove = BestMove();

    const aiCell = document.querySelector(
      `[data-row="${bestMove.row}"][data-col="${bestMove.col}"]`
    );

    board[bestMove.row][bestMove.col] = aiPlayer;
    aiCell.textContent = aiPlayer;

    Moves.push({ player: aiPlayer, row: bestMove.row, col: bestMove.col });

    if (CheckWin()) {
      document.getElementById("WhoWin").textContent =
        "Player " + aiPlayer + " Win!";
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
      currentPlayer = "X";
      document.getElementById("PlayerTurn").textContent =
        "Player " + currentPlayer + "'s Turn";
    }
    isAITurn = false;
  }, 700);
}

function minimax(board, depth, isMaximizing) {
  const scores = {
    X: -1,
    O: 1,
    Draw: 0,
  };

  if (CheckWin()) {
    return scores[currentPlayer];
  }

  if (CheckDraw()) {
    return scores.Draw;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let row = 0; row < BoardSize; row++) {
      for (let col = 0; col < BoardSize; col++) {
        if (board[row][col] === "") {
          board[row][col] = aiPlayer;
          const score = minimax(board, depth + 1, false);
          board[row][col] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let row = 0; row < BoardSize; row++) {
      for (let col = 0; col < BoardSize; col++) {
        if (board[row][col] === "") {
          board[row][col] = "X";
          const score = minimax(board, depth + 1, true);
          board[row][col] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  }
}

function CheckWin() {
  //Check Col and Row Win
  for (let i = 0; i < BoardSize; i++) {
    let RowWin = true;
    let ColWin = true;
    for (let j = 0; j < BoardSize; j++) {
      if (board[i][j] !== currentPlayer) {
        RowWin = false;
      }
      if (board[j][i] !== currentPlayer) {
        ColWin = false;
      }
    }
    if (RowWin || ColWin) {
      return true;
    }
  }

  // Check Diagonal wins
  let diag1Win = true;
  let diag2Win = true;

  for (let i = 0; i < BoardSize; i++) {
    if (board[i][i] !== currentPlayer) {
      diag1Win = false;
    }
    if (board[i][BoardSize - 1 - i] !== currentPlayer) {
      diag2Win = false;
    }
  }
  if (diag1Win || diag2Win) {
    return true;
  }

  return false;
}

function CheckDraw() {
  for (let i = 0; i < BoardSize; i++) {
    for (let j = 0; j < BoardSize; j++) {
      if (board[i][j] === "") {
        return false;
      }
    }
  }
  return true;
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
