const gameBoardDiv = document.getElementById("game-board");
const textsDiv = document.getElementById("texts");
const rematchBtn = document.getElementById("rematch");

// WebSocket setup
const socket = new WebSocket("ws://localhost:8080");
let currentPlayer = null;

// Ensure binaryType is set to `blob`
socket.binaryType = "blob";

socket.addEventListener("open", () => {
  console.log("Connected to the WebSocket server");
});

socket.addEventListener("message", (event) => {
  const processMessage = (data) => {
    const message = JSON.parse(data);

    if (message.type === "start") {
      currentPlayer = message.player;
      displayMessage(`You are player ${currentPlayer === "x" ? "X" : "O"}`);
    }

    if (message.type === "move") {
      const { player, row, col } = message.move;
      gameFlow.playTurn(row, col, false);
    }

    if (message.type === "reset") {
      gameFlow.rematch();
    }
  };

  if (typeof event.data === "string") {
    processMessage(event.data);
  } else {
    const reader = new FileReader();
    reader.onload = (e) => processMessage(e.target.result);
    reader.readAsText(event.data);
  }
});

socket.addEventListener("close", () => {
  console.log("Disconnected from the WebSocket server");
  displayMessage("Disconnected from server", "#da3030");
});

function sendMessage(message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function Cell() {
  let sign = " ";

  const getSign = () => sign;
  const addSign = (newSign) => {
    sign = newSign;
  };

  return { getSign, addSign };
}

function GameBoard() {
  const row = 3;
  const col = 3;
  const gameBoard = [];
  const cellElements = [];

  const initialize = () => {
    gameBoardDiv.innerHTML = ``;
    for (let i = 0; i < row; i++) {
      gameBoard[i] = [];
      cellElements[i] = [];
      const gameBoardRows = document.createElement("div");
      gameBoardRows.className = "row";
      for (let j = 0; j < col; j++) {
        gameBoard[i].push(Cell());
        const gameBoardCell = document.createElement("div");
        gameBoardCell.className = "cell";
        gameBoardCell.dataset.row = i.toString();
        gameBoardCell.dataset.col = j.toString();

        cellElements[i].push(gameBoardCell);
        gameBoardRows.appendChild(gameBoardCell);
      }
      gameBoardDiv.appendChild(gameBoardRows);
    }
  };

  const setCell = (player, row, col) => {
    if (gameBoard[row][col].getSign() === " ") {
      gameBoard[row][col].addSign(player);
      cellElements[row][col].innerHTML =
        `<p class="sign-text">${player.sign}</p>`;
      return true;
    } else {
      return false;
    }
  };

  const getGameBoard = () =>
    gameBoard.map((row) => row.map((cell) => cell.getSign()));
  const printGameBoard = () => {
    gameBoard.map((row) => {
      console.log(row.map((cell) => cell.getSign()));
      return true;
    });
    console.log("-----------------");
  };

  initialize();
  return { getGameBoard, printGameBoard, setCell, initialize };
}

function Player(name, sign) {
  this.name = name;
  this.sign = sign;
}

function GameFlow() {
  let gameBoard = new GameBoard();
  const players = [new Player("player1", "x"), new Player("player2", "o")];
  let playerIndex = 0;
  let isGameOver = false;

  const playTurn = (row, col, isLocal = true) => {
    if (isLocal && players[playerIndex].sign !== currentPlayer) return;

    const currPlayer = players[playerIndex];
    if (gameBoard.setCell(currPlayer, row, col)) {
      if (isLocal) {
        sendMessage({
          type: "move",
          move: { player: currPlayer.sign, row, col },
        });
      }
      displayMessage("");
      playerIndex = (playerIndex + 1) % 2;
      gameBoard.printGameBoard();
      highlightPlayerTurn(playerIndex);
      const result = validate(gameBoard);
      if (result) {
        displayMessage(
          result === "draw" ? "Draw!" : `${result.toUpperCase()} Wins!`,
        );
        highlightPlayerTurn().clearHighlight();
        isGameOver = true;
        playerIndex = 0;
        rematchBtn.style.display = "block";
      }
    } else {
      displayMessage("Occupied", "#da3030");
    }
  };

  const validate = (board) => {
    const gameBoard = board.getGameBoard();

    const allMatch = (cells) => {
      const first = cells[0];
      return first !== " " && cells.every((cell) => cell === first);
    };

    for (let i = 0; i < 3; i++) {
      if (allMatch(gameBoard[i])) {
        return gameBoard[i][0];
      }
    }

    for (let i = 0; i < 3; i++) {
      const column = [gameBoard[0][i], gameBoard[1][i], gameBoard[2][i]];
      if (allMatch(column)) {
        return column[0];
      }
    }

    const diag1 = [gameBoard[0][0], gameBoard[1][1], gameBoard[2][2]];
    const diag2 = [gameBoard[0][2], gameBoard[1][1], gameBoard[2][0]];
    if (allMatch(diag1)) return diag1[0];
    if (allMatch(diag2)) return diag2[0];

    if (gameBoard.every((row) => row.every((cell) => cell !== " "))) {
      return "draw";
    }

    return null;
  };

  const isFinished = () => isGameOver;

  const rematch = () => {
    gameBoard.initialize();
    isGameOver = false;
    displayMessage("");
    highlightPlayerTurn();
    rematchBtn.style.display = "none";
    sendMessage({ type: "reset" });
  };

  return { playTurn, isFinished, rematch };
}

const gameFlow = new GameFlow();

function displayMessage(message, color = "#c8c8c8") {
  textsDiv.children[1].textContent = message;
  textsDiv.children[1].style.color = color;
}

function highlightPlayerTurn(player = 0) {
  const playerElement = [textsDiv.children[0], textsDiv.children[2]];

  const clearHighlight = () =>
    playerElement.forEach((player) => (player.style.fontWeight = "normal"));

  if (player === 0 || player) {
    playerElement[player].style.fontWeight = "bold";
  }

  return { clearHighlight };
}

rematchBtn.addEventListener("click", () => gameFlow.rematch());

gameBoardDiv.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("cell")) {
    const row = parseInt(target.dataset.row, 10);
    const col = parseInt(target.dataset.col, 10);
    gameFlow.playTurn(row, col);
  }
});
