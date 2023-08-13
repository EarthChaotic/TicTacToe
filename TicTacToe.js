let currentPlayer;
let BoardSize;
let gameOver = false;
let Moves;
let isReplaying = false;
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

  let gameMode = document
}

function CreateBoard() {
  BoardSize = parseInt(boardSizeInput.value); //Parse Int BoardSize
  board = Array.from({ length: BoardSize }, () =>
    Array.from({ length: BoardSize }, () => "")
  );
  boardContainer.innerHTML = "";
  boardContainer.style.gridTemplateColumns = `repeat(${BoardSize}, 1fr)`;

  for (let row = 0; row < BoardSize; row++) {
    //Create Row
    for (let col = 0; col < BoardSize; col++) {
      //Create Col in Each Row
      const cell = document.createElement("div"); //Create new Div
      cell.className = "cell"; //set all cell classname to cell
      cell.dataset.row = row; //set row in current index
      cell.dataset.col = col; //set col in current index
      cell.addEventListener("click", MakeMove); //add MakeMove event in every Cell
      cell.textContent = board[row][col]; //For XO to be store in that exact Cell
      boardContainer.appendChild(cell); //set cell as boardContainer child
    }
  }
}

function MakeMove() {
  if (gameOver || isReplaying) return;
  const cell = event.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  if (board[row][col] == "") {
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
      fetch("http://localhost:3000/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(matchData),
      });
      return;
    } else if (CheckDraw()) {
      document.getElementById("WhoWin").textContent = "It's a Draw!";
      gameOver = true;
      const matchData = {
        board: board,
        winner: "Draw",
        moves: Moves,
      };
      fetch("http://localhost:3000/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(matchData),
      });
      return;
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      document.getElementById("PlayerTurn").textContent =
        "Player " + currentPlayer + "'s Turn";
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
  win = true; //set win to true again to check
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
