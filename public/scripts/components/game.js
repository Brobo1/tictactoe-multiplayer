import { GameBoard } from "./board.js";

const rematchBtn = document.getElementById("rematch");

export function Player(name, sign) {
  this.name = name;
  this.sign = sign;
}

export function displayMessage(message, color = "#c8c8c8") {
  const textsDiv = document.getElementById("texts");
  textsDiv.children[1].textContent = message;
  textsDiv.children[1].style.color = color;
}

function highlightPlayerTurn(player = 0) {
  const textsDiv = document.getElementById("texts");

  const playerElement = [textsDiv.children[0], textsDiv.children[2]];

  const clearHighlight = () =>
    playerElement.forEach((player) => (player.style.backgroundColor = ""));
  clearHighlight();
  playerElement[player].style.backgroundColor = "#4a4a4a";

  return { clearHighlight };
}

export function GameFlow(ws, playerNumber) {
  let gameBoard = new GameBoard();
  const players = [new Player("player1", "x"), new Player("player2", "o")];
  let playerIndex = 0; // Start with player 1
  let isGameOver = false;

  const playTurn = (row, col, isLocal = true) => {
    if (playerIndex !== playerNumber - 1 && isLocal) {
      displayMessage("Not your turn!", "#da3030");
      return;
    }

    const currPlayer = players[playerIndex];
    if (gameBoard.setCell(currPlayer, row, col)) {
      displayMessage("");
      gameBoard.printGameBoard();
      const result = validate(gameBoard);
      if (result) {
        displayMessage(
          result === "draw" ? "Draw!" : `${result.toUpperCase()} Wins!`,
        );
        highlightPlayerTurn().clearHighlight();
        isGameOver = true;
        rematchBtn.style.display = "block";
      } else {
        playerIndex = (playerIndex + 1) % 2;
        highlightPlayerTurn(playerIndex);
      }
      if (isLocal) {
        ws.send(JSON.stringify({ type: "move", row, col }));
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
    highlightPlayerTurn(playerIndex);
    rematchBtn.style.display = "none";
  };

  return { playTurn, isFinished, rematch };
}

export function rematchEventListener(game, ws) {
  rematchBtn.addEventListener("click", () => {
    game.rematch();
    ws.send(JSON.stringify({ type: "rematch" }));
  });
}
