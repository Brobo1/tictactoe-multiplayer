import { GameBoard, gameBoardEventListener } from "./components/board.js";
import { GameFlow, rematchEventListener } from "./components/game.js";

const gameBoard = GameBoard();
gameBoard.initialize();

const ws = new WebSocket("ws://localhost:8080");

let playerNumber;
let game;

ws.onopen = () => {
  console.log("Connected to WebSocket server");
};

ws.onmessage = async (event) => {
  let message;
  if (event.data instanceof Blob) {
    message = await event.data.text();
  } else {
    message = event.data;
  }
  const parsedMessage = JSON.parse(message);

  if (parsedMessage.type === "player") {
    playerNumber = parsedMessage.player;
    console.log(`You are player ${playerNumber}`);
    game = new GameFlow(ws, playerNumber);
    gameBoardEventListener(game, ws, playerNumber);
    rematchEventListener(game, ws);
  } else if (parsedMessage.type === "move") {
    game.playTurn(parsedMessage.row, parsedMessage.col, false);
  }
};
