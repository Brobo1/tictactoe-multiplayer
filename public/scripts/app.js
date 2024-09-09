import { GameBoard, gameBoardEventListener } from "./components/board.js";
import { GameFlow, rematchEventListener } from "./components/game.js";

const gameBoard = GameBoard();
gameBoard.initialize();

const game = new GameFlow();

gameBoardEventListener(game);
rematchEventListener(game);
