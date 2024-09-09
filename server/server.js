const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server });

let clients = [];

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

wsServer.on("connection", (socket) => {
  console.log("A new client connected");
  clients.push(socket);

  // Notify players to start the game when two players are connected
  if (clients.length === 2) {
    clients.forEach((client, index) => {
      client.send(
        JSON.stringify({ type: "start", player: index === 0 ? "x" : "o" }),
      );
    });
    gameMoves = [];
  }

  socket.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "move") {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  socket.on("close", () => {
    console.log("A client disconnected");
    clients = clients.filter((client) => client !== socket);
    if (clients.length === 1) {
      clients[0].send(JSON.stringify({ type: "reset" }));
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});
