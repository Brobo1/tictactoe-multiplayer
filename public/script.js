const gameBoardDiv = document.getElementById("game-board");
const textsDiv = document.getElementById("texts");
const rematchBtn = document.getElementById("rematch");

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
	
	const playTurn = (row, col) => {
		const currPlayer = players[playerIndex];
		if (gameBoard.setCell(currPlayer, row, col)) {
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
	};
	
	return { playTurn, isFinished, rematch };
}

function displayMessage(message, color = "#c8c8c8") {
	textsDiv.children[1].textContent = message;
	textsDiv.children[1].style.color = color;
}

function highlightPlayerTurn(player = 0) {
	const playerElement = [textsDiv.children[0], textsDiv.children[2]];
	
	const clearHighlight = () =>
		playerElement.forEach((player) => (player.style.backgroundColor = ""));
	clearHighlight();
	playerElement[player].style.backgroundColor = "#4a4a4a";
	
	return { clearHighlight };
}

function Cell() {
	let sign = " ";
	
	const addSign = (player) => (sign = player.sign);
	const getSign = () => {
		return sign;
	};
	return { addSign, getSign };
}

const game = new GameFlow();

gameBoardDiv.addEventListener("click", (e) => {
	if (!game.isFinished() && e.target.className === "cell") {
		game.playTurn(e.target.dataset.row, e.target.dataset.col);
	}
});

rematchBtn.addEventListener("click", game.rematch);