const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

let players = [];

wss.on("connection", (ws) => {
  if (players.length < 2) {
    players.push(ws);
    ws.send(JSON.stringify({ type: "player", player: players.length }));

    ws.on("message", (message) => {
      players.forEach((player) => {
        if (player !== ws) {
          player.send(message);
        }
      });
    });

    ws.on("close", () => {
      players = players.filter((player) => player !== ws);
    });
  } else {
    ws.send(JSON.stringify({ type: "full" }));
    ws.close();
  }
});

console.log("WebSocket server is running on ws://localhost:8080");
