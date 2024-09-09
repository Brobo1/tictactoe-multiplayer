import { Cell } from "./cell.js";

export function GameBoard() {
  const gameBoardDiv = document.getElementById("game-board");
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

export function gameBoardEventListener(game, ws, playerNumber) {
  const gameBoardDiv = document.getElementById("game-board");
  gameBoardDiv.addEventListener("click", (e) => {
    if (!game.isFinished() && e.target.className === "cell") {
      const row = e.target.dataset.row;
      const col = e.target.dataset.col;
      game.playTurn(row, col, true);
    }
  });
}
